import { prisma } from './prisma';
import { DEFAULT_PRIORITY_WEIGHTS, PRIORITY_THRESHOLDS } from './constants';

export interface PriorityFactors {
  safety: number; // 0-100
  severity: number; // 0-100
  people: number; // 0-100
  location: number; // 0-100
  sla: number; // 0-100
  corroboration: number; // 0-100
}

export interface PriorityScoreResult {
  totalScore: number;
  priorityBand: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  factorScores: PriorityFactors;
  weights: typeof DEFAULT_PRIORITY_WEIGHTS;
  rulesApplied: string[];
  narrativeExplanation: string;
}

export interface TeamEligibilityResult {
  teamId: string;
  teamName: string;
  departmentName: string;
  isEligible: boolean;
  distanceKm: number;
  activeWorkload: number;
  capacity: number;
  assignmentCost: number;
  hasRequiredSkill: boolean;
  verifiedSkillName?: string;
  ineligibilityReasons: string[];
}

export interface AssignmentRecommendationResult {
  recommendedTeam: TeamEligibilityResult | null;
  eligibleAlternatives: TeamEligibilityResult[];
  ineligibleTeams: TeamEligibilityResult[];
  isFeasible: boolean;
  infeasibilityReason: string | null;
  rulesApplied: string[];
}

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // Round to 2 decimal places
}

/**
 * A02 Engine: Calculates Explainable Priority Score
 */
export async function calculateExplainablePriority(
  factors: PriorityFactors,
  customWeights?: typeof DEFAULT_PRIORITY_WEIGHTS
): Promise<PriorityScoreResult> {
  // Fetch dynamic weights from DB or use defaults
  let weights = customWeights || DEFAULT_PRIORITY_WEIGHTS;
  let thresholds = PRIORITY_THRESHOLDS;

  try {
    const dbConfig = await prisma.priorityConfig.findUnique({
      where: { id: 'default-config' },
    });
    if (dbConfig && !customWeights) {
      weights = {
        safety: dbConfig.safetyWeight,
        severity: dbConfig.severityWeight,
        people: dbConfig.peopleWeight,
        location: dbConfig.locationWeight,
        sla: dbConfig.slaWeight,
        corroboration: dbConfig.corroborationWeight,
      };
      thresholds = {
        CRITICAL: dbConfig.criticalThreshold,
        HIGH: dbConfig.highThreshold,
        MEDIUM: dbConfig.mediumThreshold,
        LOW: 0,
      };
    }
  } catch {
    // Fall back to constants if DB read fails
  }

  // Normalize all inputs strictly to 0-100
  const normalized: PriorityFactors = {
    safety: Math.min(100, Math.max(0, factors.safety)),
    severity: Math.min(100, Math.max(0, factors.severity)),
    people: Math.min(100, Math.max(0, factors.people)),
    location: Math.min(100, Math.max(0, factors.location)),
    sla: Math.min(100, Math.max(0, factors.sla)),
    corroboration: Math.min(100, Math.max(0, factors.corroboration)),
  };

  const totalScoreRaw =
    normalized.safety * weights.safety +
    normalized.severity * weights.severity +
    normalized.people * weights.people +
    normalized.location * weights.location +
    normalized.sla * weights.sla +
    normalized.corroboration * weights.corroboration;

  const totalScore = Math.round(totalScoreRaw * 10) / 10;

  let priorityBand: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (totalScore >= thresholds.CRITICAL) {
    priorityBand = 'CRITICAL';
  } else if (totalScore >= thresholds.HIGH) {
    priorityBand = 'HIGH';
  } else if (totalScore >= thresholds.MEDIUM) {
    priorityBand = 'MEDIUM';
  }

  const rulesApplied: string[] = [];
  if (normalized.safety >= 80) rulesApplied.push('RULE_HIGH_PUBLIC_SAFETY_HAZARD');
  if (normalized.severity >= 80) rulesApplied.push('RULE_EXTREME_STRUCTURAL_DAMAGE');
  if (normalized.people >= 75) rulesApplied.push('RULE_HIGH_POPULATION_DENSITY_IMPACT');
  if (normalized.location >= 80) rulesApplied.push('RULE_PRIMARY_TRANSIT_ARTERIAL');
  if (normalized.sla >= 60) rulesApplied.push('RULE_SLA_BREACH_IMMINENT');
  if (normalized.corroboration >= 20) rulesApplied.push('RULE_MULTIPLE_CITIZEN_CONFIRMATION');

  const narrative = `Computed Priority Score of ${totalScore}/100 [${priorityBand}]. Breakdown: Public Safety (${(
    normalized.safety * weights.safety
  ).toFixed(1)} pts), Physical Severity (${(
    normalized.severity * weights.severity
  ).toFixed(1)} pts), Population Impact (${(
    normalized.people * weights.people
  ).toFixed(1)} pts), Location Criticality (${(
    normalized.location * weights.location
  ).toFixed(1)} pts), SLA Elapsed Pressure (${(
    normalized.sla * weights.sla
  ).toFixed(1)} pts), Community Corroborations (${(
    normalized.corroboration * weights.corroboration
  ).toFixed(1)} pts).`;

  return {
    totalScore,
    priorityBand,
    factorScores: normalized,
    weights,
    rulesApplied,
    narrativeExplanation: narrative,
  };
}

/**
 * A02 Engine: Intelligent Department & Team Assignment with Constraint Validation
 */
export async function evaluateIntelligentAssignment(params: {
  reportId?: string;
  departmentId: string;
  serviceZoneId?: string | null;
  categoryCode: string;
  reportLat: number;
  reportLng: number;
  priorityScore: number;
}): Promise<AssignmentRecommendationResult> {
  const { departmentId, serviceZoneId, categoryCode, reportLat, reportLng } = params;

  // Determine required skill based on category
  const skillMapping: Record<string, string> = {
    ROADS: 'ASPHALT_REPAIR',
    DRAINAGE: 'HEAVY_DRAINAGE_EXCAVATION',
    WASTE: 'BIOHAZARD_WASTE',
    LIGHTS: 'HIGH_VOLTAGE_ELEC',
    WATER: 'WATER_MAIN_VALVE',
    SIDEWALKS: 'PAVEMENT_MASONRY',
    TREES: 'TREE_FELLING',
    GENERAL: 'CIVIC_MAINTENANCE',
  };

  const requiredSkillCode = skillMapping[categoryCode] || 'CIVIC_MAINTENANCE';

  // Fetch candidate teams for this department
  const candidateTeams = await prisma.team.findMany({
    where: {
      departmentId,
    },
    include: {
      department: true,
      serviceZone: true,
      skills: true,
    },
  });

  const assessedTeams: TeamEligibilityResult[] = [];

  for (const team of candidateTeams) {
    const ineligibilityReasons: string[] = [];

    // 1. Jurisdiction check
    const matchesZone = !serviceZoneId || team.serviceZoneId === serviceZoneId;
    if (!matchesZone) {
      ineligibilityReasons.push(`Team assigned to ${team.serviceZone.name}, outside report jurisdiction.`);
    }

    // 2. Skills and certification check
    const matchingSkill = team.skills.find((s) => s.skillCode === requiredSkillCode);
    const hasRequiredSkill = Boolean(matchingSkill);
    if (!hasRequiredSkill) {
      ineligibilityReasons.push(
        `Lacks mandatory certified skill: ${requiredSkillCode}.`
      );
    }

    // 3. Availability status check
    const isAvailable = team.status === 'ON_DUTY' || team.status === 'STANDBY';
    if (!isAvailable) {
      ineligibilityReasons.push(`Team status is currently ${team.status}.`);
    }

    // 4. Capacity & workload constraint
    const hasCapacity = team.activeWorkload < team.capacity;
    if (!hasCapacity) {
      ineligibilityReasons.push(
        `Active workload (${team.activeWorkload}/${team.capacity}) at maximum capacity.`
      );
    }

    // 5. Distance calculation
    const teamLat = team.currentLat ?? team.serviceZone.centerLat;
    const teamLng = team.currentLng ?? team.serviceZone.centerLng;
    const distanceKm = calculateHaversineDistance(reportLat, reportLng, teamLat, teamLng);

    // 6. Assignment Cost Calculation for eligible candidates
    // Cost = (Distance * 2.5) + (Workload Ratio * 40)
    const workloadRatio = team.capacity > 0 ? team.activeWorkload / team.capacity : 1.0;
    const assignmentCost = Math.round((distanceKm * 2.5 + workloadRatio * 40) * 10) / 10;

    const isEligible = ineligibilityReasons.length === 0;

    assessedTeams.push({
      teamId: team.id,
      teamName: team.name,
      departmentName: team.department.name,
      isEligible,
      distanceKm,
      activeWorkload: team.activeWorkload,
      capacity: team.capacity,
      assignmentCost,
      hasRequiredSkill,
      verifiedSkillName: matchingSkill?.skillName,
      ineligibilityReasons,
    });
  }

  // Filter eligible and sort by lowest cost
  const eligibleTeams = assessedTeams
    .filter((t) => t.isEligible)
    .sort((a, b) => a.assignmentCost - b.assignmentCost);

  const ineligibleTeams = assessedTeams.filter((t) => !t.isEligible);

  const rulesApplied: string[] = [
    `REQUIRED_SKILL_ENFORCED[${requiredSkillCode}]`,
    'JURISDICTION_ZONE_VALIDATED',
    'CAPACITY_CONSTRAINT_CHECKED',
    'HAVERSINE_PROXIMITY_OPTIMIZED',
  ];

  if (eligibleTeams.length > 0) {
    return {
      recommendedTeam: eligibleTeams[0],
      eligibleAlternatives: eligibleTeams.slice(1),
      ineligibleTeams,
      isFeasible: true,
      infeasibilityReason: null,
      rulesApplied,
    };
  }

  // CONFLICT DETECTION: Infeasible outcome
  let infeasibilityReason = 'No eligible team could be assigned. ';
  if (candidateTeams.length === 0) {
    infeasibilityReason += 'Department has no field teams configured in the database.';
  } else if (!candidateTeams.some((t) => t.skills.some((s) => s.skillCode === requiredSkillCode))) {
    infeasibilityReason += `Conflict: Nearest teams lack mandatory certification [${requiredSkillCode}].`;
  } else if (candidateTeams.every((t) => t.activeWorkload >= t.capacity)) {
    infeasibilityReason += 'Conflict: All certified teams are currently at 100% capacity.';
  } else if (!candidateTeams.some((t) => !serviceZoneId || t.serviceZoneId === serviceZoneId)) {
    infeasibilityReason += 'Conflict: No qualified teams within designated service zone jurisdiction.';
  } else {
    infeasibilityReason += 'Conflict: Combined availability, skill, and jurisdiction constraints unmet.';
  }

  return {
    recommendedTeam: null,
    eligibleAlternatives: [],
    ineligibleTeams,
    isFeasible: false,
    infeasibilityReason,
    rulesApplied: [...rulesApplied, 'CONFLICT_TRIGGERED_SUPERVISOR_REVIEW'],
  };
}
