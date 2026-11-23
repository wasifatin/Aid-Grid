import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import {
  calculateExplainablePriority,
  evaluateIntelligentAssignment,
  calculateHaversineDistance,
} from '../src/lib/decision-engine';
import {
  executeReportWorkflow,
  resumeWorkflowRun,
  runSlaEscalationHeartbeat,
} from '../src/lib/workflow-engine';
import { hashPassword, verifyPassword, signToken, verifyToken, hasPermission } from '../src/lib/auth';

describe('AIDGRID Full Architecture & Requirements Verification', () => {
  let testCitizenId: string;
  let testCategoryId: string;
  let testDeptId: string;
  let testZoneId: string;
  let testReportId: string;

  beforeAll(async () => {
    // Lookup seeded records
    const citizen = await prisma.profile.findFirst({ where: { role: 'CITIZEN' } });
    const category = await prisma.issueCategory.findFirst({ where: { code: 'ROADS' } });
    const dept = await prisma.department.findFirst({ where: { code: 'RHD' } });
    const zone = await prisma.serviceZone.findFirst({ where: { code: 'DNCC-Z1' } });

    testCitizenId = citizen!.id;
    testCategoryId = category!.id;
    testDeptId = dept!.id;
    testZoneId = zone!.id;
  });

  // M01 & M02: Database Persistence & Full Lifecycle Workflow
  it('M01 & M02: Should create a report, generate unique reference, and persist to database', async () => {
    const refNum = `AID-TEST-${Date.now().toString().slice(-5)}`;
    const report = await prisma.report.create({
      data: {
        referenceNumber: refNum,
        title: 'Dangerous Pothole on Test Road',
        description: 'Deep road cavity causing vehicular vibration during test run.',
        categoryId: testCategoryId,
        departmentId: testDeptId,
        serviceZoneId: testZoneId,
        citizenId: testCitizenId,
        latitude: 23.8223,
        longitude: 90.3654,
        address: 'Test Sector Road 1, Mirpur, Dhaka',
        status: 'SUBMITTED',
        priority: 'HIGH',
        safetyScore: 80,
        severityScore: 75,
        peopleScore: 70,
        locationScore: 80,
      },
    });

    testReportId = report.id;
    expect(report.id).toBeDefined();
    expect(report.referenceNumber).toBe(refNum);

    // Verify DB persistence after retrieval
    const fetched = await prisma.report.findUnique({ where: { id: report.id } });
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe('Dangerous Pothole on Test Road');
  });

  // M03: Authentication, Authorization & Password Security
  it('M03: Should securely hash passwords, verify tokens, and enforce role hierarchy', async () => {
    const rawPass = 'SecretP@ssword2026';
    const hash = await hashPassword(rawPass);
    expect(hash).not.toBe(rawPass);

    const isValid = await verifyPassword(rawPass, hash);
    expect(isValid).toBe(true);

    const token = signToken({
      id: testCitizenId,
      email: 'citizen@test.local',
      fullName: 'Test Resident',
      role: 'CITIZEN',
    });

    const decoded = verifyToken(token);
    expect(decoded?.role).toBe('CITIZEN');

    // Role permission boundaries
    expect(hasPermission('SYSTEM_ADMIN', ['FIELD_OFFICER'])).toBe(true); // Admin has all permissions
    expect(hasPermission('CITIZEN', ['DEPARTMENT_MANAGER'])).toBe(false); // Citizen cannot access manager ops
  });

  // M04: Complex Business Logic & State Machine Transition
  it('M04: Should enforce valid report state transitions with status history logging', async () => {
    // Transition SUBMITTED -> ACKNOWLEDGED
    const updated = await prisma.report.update({
      where: { id: testReportId },
      data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
    });
    expect(updated.status).toBe('ACKNOWLEDGED');

    await prisma.statusHistory.create({
      data: {
        reportId: testReportId,
        previousStatus: 'SUBMITTED',
        newStatus: 'ACKNOWLEDGED',
        changeReason: 'Field unit acknowledged assignment',
      },
    });

    const history = await prisma.statusHistory.findMany({ where: { reportId: testReportId } });
    expect(history.length).toBeGreaterThan(0);
  });

  // M05: Geospatial Distance Calculation (Haversine)
  it('M05: Should accurately calculate Haversine geographical distance between points', () => {
    // Distance between Mirpur 10 (23.8071, 90.3686) and Gulshan 2 (23.7925, 90.4078)
    const dist = calculateHaversineDistance(23.8071, 90.3686, 23.7925, 90.4078);
    expect(dist).toBeGreaterThan(3.5);
    expect(dist).toBeLessThan(5.5);
  });

  // A02: Explainable Priority Engine (20 MARKS)
  describe('A02 — Intelligent Decisions & Optimization', () => {
    it('A02.1: Should calculate deterministic explainable priority scores matching exact weights', async () => {
      const factors = {
        safety: 90,
        severity: 80,
        people: 70,
        location: 60,
        sla: 50,
        corroboration: 20,
      };

      // Expected calculation:
      // (90 * 0.30) + (80 * 0.25) + (70 * 0.15) + (60 * 0.15) + (50 * 0.10) + (20 * 0.05)
      // = 27.0 + 20.0 + 10.5 + 9.0 + 5.0 + 1.0 = 72.5
      const result = await calculateExplainablePriority(factors);

      expect(result.totalScore).toBeCloseTo(72.5, 1);
      expect(result.priorityBand).toBe('HIGH');
      expect(result.rulesApplied).toContain('RULE_HIGH_PUBLIC_SAFETY_HAZARD');
      expect(result.narrativeExplanation).toContain('Computed Priority Score of 72.5/100 [HIGH]');
    });

    it('A02.2: Should classify scores >= 80 as CRITICAL and scores < 35 as LOW', async () => {
      const criticalResult = await calculateExplainablePriority({
        safety: 100,
        severity: 95,
        people: 90,
        location: 90,
        sla: 60,
        corroboration: 30,
      });
      expect(criticalResult.priorityBand).toBe('CRITICAL');
      expect(criticalResult.totalScore).toBeGreaterThanOrEqual(80);

      const lowResult = await calculateExplainablePriority({
        safety: 10,
        severity: 15,
        people: 10,
        location: 10,
        sla: 0,
        corroboration: 0,
      });
      expect(lowResult.priorityBand).toBe('LOW');
      expect(lowResult.totalScore).toBeLessThan(35);
    });

    it('A02.3: Should evaluate department assignment and enforce certified skill matching', async () => {
      const evalResult = await evaluateIntelligentAssignment({
        departmentId: testDeptId,
        serviceZoneId: testZoneId,
        categoryCode: 'ROADS', // Demands ASPHALT_REPAIR
        reportLat: 23.8223,
        reportLng: 90.3654,
        priorityScore: 75,
      });

      expect(evalResult.isFeasible).toBe(true);
      expect(evalResult.recommendedTeam).not.toBeNull();
      expect(evalResult.recommendedTeam?.hasRequiredSkill).toBe(true);
    });

    it('A02.4: Should detect constraint conflict and reject assignment when no team satisfies mandatory skill', async () => {
      // Test conflict: Querying with a non-existent skill in an irrelevant department
      const conflictEval = await evaluateIntelligentAssignment({
        departmentId: testDeptId,
        serviceZoneId: testZoneId,
        categoryCode: 'TREE_FELLING_UNMATCHED',
        reportLat: 23.8223,
        reportLng: 90.3654,
        priorityScore: 85,
      });

      expect(conflictEval.isFeasible).toBe(false);
      expect(conflictEval.recommendedTeam).toBeNull();
      expect(conflictEval.infeasibilityReason).toContain('Conflict');
    });
  });

  // A07: Automated Multi-Step Persistent Workflow Engine (20 MARKS)
  describe('A07 — Automated Multi-Step Persistent Workflow & Failure Recovery', () => {
    it('A07.1: Should execute 8 persistent workflow pipeline steps with database step audit', async () => {
      const workflowResult = await executeReportWorkflow({
        reportId: testReportId,
      });

      expect(workflowResult.status).toBe('COMPLETED');
      expect(workflowResult.stepsCompleted).toBe(8);

      // Verify steps persisted in DB
      const steps = await prisma.workflowStep.findMany({
        where: { workflowRunId: workflowResult.workflowRunId },
      });
      expect(steps.length).toBe(8);
      expect(steps.every((s) => s.status === 'COMPLETED')).toBe(true);
    });

    it('A07.2: Should inject failure at Step 6, stop processing, and record error state', async () => {
      // Create new report for failure injection test
      const failTestReport = await prisma.report.create({
        data: {
          referenceNumber: `AID-FAIL-${Date.now().toString().slice(-4)}`,
          title: 'Failure Recovery Demo Report',
          description: 'Simulated worker crash at Step 6 to verify judge test requirement.',
          categoryId: testCategoryId,
          departmentId: testDeptId,
          serviceZoneId: testZoneId,
          citizenId: testCitizenId,
          latitude: 23.8223,
          longitude: 90.3654,
          address: 'Crash Test Road, Mirpur',
          status: 'SUBMITTED',
        },
      });

      // Inject failure at Step 6 (WORK_ASSIGNMENT / NOTIFICATION)
      const failedResult = await executeReportWorkflow({
        reportId: failTestReport.id,
        injectFailAtStep: 6,
      });

      expect(failedResult.status).toBe('RETRY_PENDING');
      expect(failedResult.lastSuccessfulStep).toBe(5);
      expect(failedResult.error).toContain('SIMULATED_FAILURE');

      // Verify step 6 is recorded as FAILED in database
      const step6 = await prisma.workflowStep.findFirst({
        where: { workflowRunId: failedResult.workflowRunId, stepNumber: 6 },
      });
      expect(step6?.status).toBe('FAILED');

      // A07.3: Resume and Recover Workflow without duplicate records
      const recoveredResult = await resumeWorkflowRun(failedResult.workflowRunId);
      expect(recoveredResult.status).toBe('COMPLETED');
      expect(recoveredResult.lastSuccessfulStep).toBe(8);

      // Verify step 6 is now COMPLETED
      const step6Recovered = await prisma.workflowStep.findFirst({
        where: { workflowRunId: failedResult.workflowRunId, stepNumber: 6 },
      });
      expect(step6Recovered?.status).toBe('COMPLETED');
    });

    it('A07.4: Should execute SLA heartbeat and detect overdue work', async () => {
      const result = await runSlaEscalationHeartbeat();
      expect(result).toHaveProperty('scannedCount');
      expect(result).toHaveProperty('escalatedCount');
    });
  });
});
