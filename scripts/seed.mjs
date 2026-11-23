import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AidGrid Database Seeding...');

  // Clear existing records safely
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.decisionExplanation.deleteMany();
  await prisma.workflowStep.deleteMany();
  await prisma.workflowRun.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.reportAttachment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.teamSkill.deleteMany();
  await prisma.team.deleteMany();
  await prisma.slaPolicy.deleteMany();
  await prisma.issueCategory.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.serviceZone.deleteMany();
  await prisma.priorityConfig.deleteMany();

  console.log('Cleared existing tables.');

  // 1. Create Priority Configuration (A02 Engine Defaults)
  await prisma.priorityConfig.create({
    data: {
      id: 'default-config',
      safetyWeight: 0.30,
      severityWeight: 0.25,
      peopleWeight: 0.15,
      locationWeight: 0.15,
      slaWeight: 0.10,
      corroborationWeight: 0.05,
      criticalThreshold: 80.0,
      highThreshold: 60.0,
      mediumThreshold: 35.0,
      isActive: true,
    },
  });

  // 2. Create Service Zones (Pilot Area in Dhaka)
  const zoneMirpur = await prisma.serviceZone.create({
    data: {
      name: 'Zone 1 — Mirpur & Pallabi',
      nameBn: 'অঞ্চল ১ — মিরপুর ও পল্লবী',
      code: 'DNCC-Z1',
      cityCorporation: 'Dhaka North City Corporation (DNCC)',
      centerLat: 23.8223,
      centerLng: 90.3654,
      radiusKm: 5.2,
      boundaryGeoJson: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [90.34, 23.80],
            [90.39, 23.80],
            [90.39, 23.85],
            [90.34, 23.85],
            [90.34, 23.80],
          ],
        ],
      }),
    },
  });

  const zoneGulshan = await prisma.serviceZone.create({
    data: {
      name: 'Zone 2 — Gulshan, Banani & Baridhara',
      nameBn: 'অঞ্চল ২ — গুলশান, বনানী ও বারিধারা',
      code: 'DNCC-Z2',
      cityCorporation: 'Dhaka North City Corporation (DNCC)',
      centerLat: 23.7925,
      centerLng: 90.4078,
      radiusKm: 4.8,
    },
  });

  const zoneDhanmondi = await prisma.serviceZone.create({
    data: {
      name: 'Zone 3 — Dhanmondi & Mohammadpur',
      nameBn: 'অঞ্চল ৩ — ধানমন্ডি ও মোহাম্মদপুর',
      code: 'DSCC-Z3',
      cityCorporation: 'Dhaka South City Corporation (DSCC)',
      centerLat: 23.7461,
      centerLng: 90.3742,
      radiusKm: 4.5,
    },
  });

  const zoneUttara = await prisma.serviceZone.create({
    data: {
      name: 'Zone 4 — Uttara Model Town',
      nameBn: 'অঞ্চল ৪ — উত্তরা মডেল টাউন',
      code: 'DNCC-Z4',
      cityCorporation: 'Dhaka North City Corporation (DNCC)',
      centerLat: 23.8759,
      centerLng: 90.3795,
      radiusKm: 6.0,
    },
  });

  const zoneOldDhaka = await prisma.serviceZone.create({
    data: {
      name: 'Zone 5 — Old Dhaka & Sadarghat',
      nameBn: 'অঞ্চল ৫ — পুরান ঢাকা ও সদরঘাট',
      code: 'DSCC-Z5',
      cityCorporation: 'Dhaka South City Corporation (DSCC)',
      centerLat: 23.7104,
      centerLng: 90.4074,
      radiusKm: 4.0,
    },
  });

  console.log('Created 5 pilot service zones.');

  // 3. Create Departments
  const deptRHD = await prisma.department.create({
    data: {
      name: 'Roads & Public Infrastructure Department',
      nameBn: 'সড়ক ও গণঅবকাঠামো বিভাগ',
      code: 'RHD',
      description: 'Responsible for municipal road carpeting, major potholes, footbridges and sidewalks',
      contactEmail: 'roads@dncc.gov.bd',
      contactPhone: '+88028833111',
      headName: 'Engr. Mahmudul Haque',
    },
  });

  const deptWASA = await prisma.department.create({
    data: {
      name: 'Water Supply & Sewerage Authority (WASA)',
      nameBn: 'ঢাকা ওয়াসা (পানি সরবরাহ ও পয়ঃনিষ্কাশন)',
      code: 'WASA',
      description: 'Manages storm water drainage channels, water pipeline leaks, and sewer maintenance',
      contactEmail: 'drainage-response@dwasa.org.bd',
      contactPhone: '+88029944222',
      headName: 'Dr. Shahabuddin Ahmed',
    },
  });

  const deptWaste = await prisma.department.create({
    data: {
      name: 'Solid Waste & Sanitation Department',
      nameBn: 'বর্জ্য ব্যবস্থাপনা ও পরিচ্ছন্নতা বিভাগ',
      code: 'WASTE',
      description: 'Manages residential waste collection, primary & secondary transfer stations, and biohazard cleanup',
      contactEmail: 'waste@dncc.gov.bd',
      contactPhone: '+88028833222',
      headName: 'Dr. Nasrin Akter',
    },
  });

  const deptElec = await prisma.department.create({
    data: {
      name: 'City Power & Streetlighting Department',
      nameBn: 'বিদ্যুৎ ও সড়কবাতি বিভাগ',
      code: 'ELEC',
      description: 'High-voltage streetlight fixtures, junction boxes, and public night lighting networks',
      contactEmail: 'lighting@dncc.gov.bd',
      contactPhone: '+88028833333',
      headName: 'Engr. Rafiqul Islam',
    },
  });

  const deptParks = await prisma.department.create({
    data: {
      name: 'Urban Forestry & Public Parks Department',
      nameBn: 'নগর বন ও গণউদ্যান বিভাগ',
      code: 'PARKS',
      description: 'Rapid removal of fallen storm trees, roadside branch trimming, and green space safety',
      contactEmail: 'parks@dncc.gov.bd',
      contactPhone: '+88028833444',
      headName: 'Begum Farida Yasmin',
    },
  });

  console.log('Created 5 municipal departments.');

  // 4. Create Issue Categories
  const catRoads = await prisma.issueCategory.create({
    data: {
      name: 'Damaged Roads and Potholes',
      nameBn: 'ভাঙা রাস্তা ও খানাখন্দ',
      code: 'ROADS',
      description: 'Asphalt breakdown, large sinkholes, hazardous traffic potholes and surface degradation',
      defaultDepartmentId: deptRHD.id,
      defaultSeverity: 70,
      baseSlaHours: 48,
    },
  });

  const catDrainage = await prisma.issueCategory.create({
    data: {
      name: 'Blocked Drainage and Waterlogging',
      nameBn: 'অবরুদ্ধ নর্দমা ও জলাবদ্ধতা',
      code: 'DRAINAGE',
      description: 'Severely clogged culverts, monsoon water accumulation, open storm drains',
      defaultDepartmentId: deptWASA.id,
      defaultSeverity: 80,
      baseSlaHours: 24,
    },
  });

  const catWaste = await prisma.issueCategory.create({
    data: {
      name: 'Uncollected Garbage and Overflowing Waste Bins',
      nameBn: 'অপরিচ্ছন্ন বর্জ্য ও ডাস্টবিন উপচে পড়া',
      code: 'WASTE',
      description: 'Spilling STS bins, uncollected neighborhood rubbish, foul odor hazards',
      defaultDepartmentId: deptWaste.id,
      defaultSeverity: 60,
      baseSlaHours: 24,
    },
  });

  const catLights = await prisma.issueCategory.create({
    data: {
      name: 'Broken Streetlights',
      nameBn: 'নষ্ট সড়কবাতি',
      code: 'LIGHTS',
      description: 'Dark pedestrian alleys, burned out LED poles, hazardous dangling electrical wires',
      defaultDepartmentId: deptElec.id,
      defaultSeverity: 45,
      baseSlaHours: 36,
    },
  });

  const catWater = await prisma.issueCategory.create({
    data: {
      name: 'Water Leakage',
      nameBn: 'পানির পাইপলাইন লিকেজ',
      code: 'WATER',
      description: 'High-pressure clean water supply pipe ruptures flooding streets',
      defaultDepartmentId: deptWASA.id,
      defaultSeverity: 75,
      baseSlaHours: 12,
    },
  });

  const catSidewalks = await prisma.issueCategory.create({
    data: {
      name: 'Damaged Sidewalks and Unsafe Pedestrian Infrastructure',
      nameBn: 'ভাঙা ফুটপাত ও পথচারী ঝুঁকি',
      code: 'SIDEWALKS',
      description: 'Broken paving slabs, unsafe curb drops, obstacles blocking wheelchair/pram movement',
      defaultDepartmentId: deptRHD.id,
      defaultSeverity: 40,
      baseSlaHours: 72,
    },
  });

  const catTrees = await prisma.issueCategory.create({
    data: {
      name: 'Fallen Trees and Public Infrastructure Hazards',
      nameBn: 'উপড়ে পড়া গাছ ও ঝড়ের ঝুঁকি',
      code: 'TREES',
      description: 'Storm-felled banyan trees blocking transit lanes or collapsing on wires',
      defaultDepartmentId: deptParks.id,
      defaultSeverity: 85,
      baseSlaHours: 12,
    },
  });

  const catGeneral = await prisma.issueCategory.create({
    data: {
      name: 'Other Non-Emergency Community Infrastructure Problems',
      nameBn: 'অন্যান্য পৌর অবকাঠামো সমস্যা',
      code: 'GENERAL',
      description: 'Public park benches, broken municipal signage, municipal fence damage',
      defaultDepartmentId: deptRHD.id,
      defaultSeverity: 35,
      baseSlaHours: 96,
    },
  });

  console.log('Created 8 required issue categories.');

  // 5. Create SLA Policies for all categories and priority bands
  const allCategories = [catRoads, catDrainage, catWaste, catLights, catWater, catSidewalks, catTrees, catGeneral];
  for (const cat of allCategories) {
    await prisma.slaPolicy.createMany({
      data: [
        {
          issueCategoryId: cat.id,
          priority: 'CRITICAL',
          maxAckHours: 2,
          maxResolutionHours: Math.max(6, Math.floor(cat.baseSlaHours * 0.25)),
          escalationTargetRole: 'DEPARTMENT_MANAGER',
        },
        {
          issueCategoryId: cat.id,
          priority: 'HIGH',
          maxAckHours: 4,
          maxResolutionHours: Math.max(12, Math.floor(cat.baseSlaHours * 0.5)),
          escalationTargetRole: 'DEPARTMENT_MANAGER',
        },
        {
          issueCategoryId: cat.id,
          priority: 'MEDIUM',
          maxAckHours: 12,
          maxResolutionHours: cat.baseSlaHours,
          escalationTargetRole: 'DEPARTMENT_MANAGER',
        },
        {
          issueCategoryId: cat.id,
          priority: 'LOW',
          maxAckHours: 24,
          maxResolutionHours: Math.floor(cat.baseSlaHours * 1.5),
          escalationTargetRole: 'DEPARTMENT_MANAGER',
        },
      ],
    });
  }

  // 6. Create Field Teams and Team Skills
  // Mirpur Roads Team
  const teamRoadsMirpur = await prisma.team.create({
    data: {
      name: 'Mirpur Rapid Road Patch Unit (Alpha-1)',
      code: 'RHD-TEAM-M1',
      departmentId: deptRHD.id,
      serviceZoneId: zoneMirpur.id,
      contactPhone: '+8801711000101',
      capacity: 6,
      activeWorkload: 2,
      status: 'ON_DUTY',
      currentLat: 23.8210,
      currentLng: 90.3660,
    },
  });
  await prisma.teamSkill.createMany({
    data: [
      { teamId: teamRoadsMirpur.id, skillCode: 'ASPHALT_REPAIR', skillName: 'Asphalt & Hot-Mix Bitumen Paving', certificationLevel: 'CERTIFIED_SPECIALIST' },
      { teamId: teamRoadsMirpur.id, skillCode: 'PAVEMENT_MASONRY', skillName: 'Pedestrian Kerb Masonry', certificationLevel: 'STANDARD' },
    ],
  });

  // Gulshan Roads Team
  const teamRoadsGulshan = await prisma.team.create({
    data: {
      name: 'Gulshan Infra Maintenance Crew (Alpha-2)',
      code: 'RHD-TEAM-G2',
      departmentId: deptRHD.id,
      serviceZoneId: zoneGulshan.id,
      contactPhone: '+8801711000102',
      capacity: 5,
      activeWorkload: 1,
      status: 'ON_DUTY',
      currentLat: 23.7910,
      currentLng: 90.4060,
    },
  });
  await prisma.teamSkill.createMany({
    data: [
      { teamId: teamRoadsGulshan.id, skillCode: 'ASPHALT_REPAIR', skillName: 'Asphalt & Hot-Mix Bitumen Paving', certificationLevel: 'CERTIFIED_SPECIALIST' },
      { teamId: teamRoadsGulshan.id, skillCode: 'PAVEMENT_MASONRY', skillName: 'Pedestrian Kerb Masonry', certificationLevel: 'ADVANCED' },
    ],
  });

  // Mirpur WASA Drainage Team
  const teamWasaMirpur = await prisma.team.create({
    data: {
      name: 'Mirpur Heavy Drainage & De-Silting Squad (Delta-1)',
      code: 'WASA-TEAM-M1',
      departmentId: deptWASA.id,
      serviceZoneId: zoneMirpur.id,
      contactPhone: '+8801711000201',
      capacity: 5,
      activeWorkload: 1,
      status: 'ON_DUTY',
      currentLat: 23.8240,
      currentLng: 90.3670,
    },
  });
  await prisma.teamSkill.createMany({
    data: [
      { teamId: teamWasaMirpur.id, skillCode: 'HEAVY_DRAINAGE_EXCAVATION', skillName: 'Subsurface Culvert De-Silting', certificationLevel: 'CERTIFIED_SPECIALIST' },
      { teamId: teamWasaMirpur.id, skillCode: 'WATER_MAIN_VALVE', skillName: 'High-Pressure Mains Isolation', certificationLevel: 'STANDARD' },
    ],
  });

  // Gulshan WASA Water Leakage Team
  const teamWasaGulshan = await prisma.team.create({
    data: {
      name: 'Gulshan Water Pipeline Emergency Unit (Delta-2)',
      code: 'WASA-TEAM-G2',
      departmentId: deptWASA.id,
      serviceZoneId: zoneGulshan.id,
      contactPhone: '+8801711000202',
      capacity: 4,
      activeWorkload: 0,
      status: 'ON_DUTY',
      currentLat: 23.7940,
      currentLng: 90.4090,
    },
  });
  await prisma.teamSkill.createMany({
    data: [
      { teamId: teamWasaGulshan.id, skillCode: 'WATER_MAIN_VALVE', skillName: 'High-Pressure Mains Isolation & Clamp', certificationLevel: 'CERTIFIED_SPECIALIST' },
      { teamId: teamWasaGulshan.id, skillCode: 'HEAVY_DRAINAGE_EXCAVATION', skillName: 'Subsurface Culvert De-Silting', certificationLevel: 'BASIC' },
    ],
  });

  // Dhanmondi Waste Team
  const teamWasteDhanmondi = await prisma.team.create({
    data: {
      name: 'Dhanmondi Compact Sanitation Fleet (Sierra-1)',
      code: 'WASTE-TEAM-D1',
      departmentId: deptWaste.id,
      serviceZoneId: zoneDhanmondi.id,
      contactPhone: '+8801711000301',
      capacity: 6,
      activeWorkload: 2,
      status: 'ON_DUTY',
      currentLat: 23.7470,
      currentLng: 90.3750,
    },
  });
  await prisma.teamSkill.createMany({
    data: [
      { teamId: teamWasteDhanmondi.id, skillCode: 'BIOHAZARD_WASTE', skillName: 'Sanitation Compaction & Disinfection', certificationLevel: 'STANDARD' },
    ],
  });

  // Mirpur Electric Team
  const teamElecMirpur = await prisma.team.create({
    data: {
      name: 'Mirpur Grid & Streetlight Squad (Volt-1)',
      code: 'ELEC-TEAM-M1',
      departmentId: deptElec.id,
      serviceZoneId: zoneMirpur.id,
      contactPhone: '+8801711000401',
      capacity: 4,
      activeWorkload: 1,
      status: 'ON_DUTY',
      currentLat: 23.8200,
      currentLng: 90.3640,
    },
  });
  await prisma.teamSkill.createMany({
    data: [
      { teamId: teamElecMirpur.id, skillCode: 'HIGH_VOLTAGE_ELEC', skillName: '440V Grid & Aerial Luminaire Repair', certificationLevel: 'CERTIFIED_SPECIALIST' },
    ],
  });

  // Parks / Tree felling team
  const teamParksCitywide = await prisma.team.create({
    data: {
      name: 'Dhaka Emergency Arborist & Storm Unit (Forest-1)',
      code: 'PARKS-TEAM-C1',
      departmentId: deptParks.id,
      serviceZoneId: zoneMirpur.id,
      contactPhone: '+8801711000501',
      capacity: 3,
      activeWorkload: 1,
      status: 'ON_DUTY',
      currentLat: 23.8180,
      currentLng: 90.3630,
    },
  });
  await prisma.teamSkill.createMany({
    data: [
      { teamId: teamParksCitywide.id, skillCode: 'TREE_FELLING', skillName: 'Heavy Chainsaw & Aerial Tree Clearing', certificationLevel: 'CERTIFIED_SPECIALIST' },
    ],
  });

  console.log('Created field teams and team skills.');

  // 7. Create User Profiles (All 4 Roles with passwords)
  const defaultPasswordHash = await bcrypt.hash('aidgrid2026', 10);

  // System Admin
  const adminUser = await prisma.profile.create({
    data: {
      email: 'admin@aidgrid.gov.bd',
      passwordHash: defaultPasswordHash,
      fullName: 'Sayeed Mahmud (Chief Operations Administrator)',
      phone: '+8801712000001',
      nidOrCitizenId: '19842690011002233',
      role: 'SYSTEM_ADMIN',
      preferredLang: 'en',
    },
  });

  // Department Manager
  const managerUser = await prisma.profile.create({
    data: {
      email: 'manager@dncc.gov.bd',
      passwordHash: defaultPasswordHash,
      fullName: 'Dr. Nasrin Akter (Director of Waste & City Operations)',
      phone: '+8801712000002',
      nidOrCitizenId: '19792690022003344',
      role: 'DEPARTMENT_MANAGER',
      departmentId: deptWaste.id,
      serviceZoneId: zoneMirpur.id,
      preferredLang: 'en',
    },
  });

  // Field Officer
  const officerUser = await prisma.profile.create({
    data: {
      email: 'officer@aidgrid.gov.bd',
      passwordHash: defaultPasswordHash,
      fullName: 'Tariq Hasan (Field Rapid Response Lead)',
      phone: '+8801712000003',
      nidOrCitizenId: '19922690033004455',
      role: 'FIELD_OFFICER',
      departmentId: deptRHD.id,
      teamId: teamRoadsMirpur.id,
      serviceZoneId: zoneMirpur.id,
      preferredLang: 'en',
    },
  });

  // Field Officer 2 (Drainage)
  const officerDrainage = await prisma.profile.create({
    data: {
      email: 'wasa.officer@aidgrid.gov.bd',
      passwordHash: defaultPasswordHash,
      fullName: 'Kamal Uddin (Drainage Ground Supervisor)',
      phone: '+8801712000004',
      nidOrCitizenId: '19902690044005566',
      role: 'FIELD_OFFICER',
      departmentId: deptWASA.id,
      teamId: teamWasaMirpur.id,
      serviceZoneId: zoneMirpur.id,
      preferredLang: 'en',
    },
  });

  // Citizen 1
  const citizenRahat = await prisma.profile.create({
    data: {
      email: 'citizen@aidgrid.gov.bd',
      passwordHash: defaultPasswordHash,
      fullName: 'Rahat Chowdhury (Mirpur Resident)',
      phone: '+8801819000001',
      nidOrCitizenId: '19952690055006677',
      role: 'CITIZEN',
      serviceZoneId: zoneMirpur.id,
      preferredLang: 'en',
    },
  });

  // Citizen 2
  const citizenFatima = await prisma.profile.create({
    data: {
      email: 'fatima@aidgrid.gov.bd',
      passwordHash: defaultPasswordHash,
      fullName: 'Fatima Zohra (Gulshan Resident)',
      phone: '+8801819000002',
      nidOrCitizenId: '19982690066007788',
      role: 'CITIZEN',
      serviceZoneId: zoneGulshan.id,
      preferredLang: 'bn',
    },
  });

  console.log('Created profiles for all 4 roles.');

  // 8. Create 22+ Realistic Synthetic Reports Across All States & Categories
  const now = new Date();
  const subHours = (h) => new Date(now.getTime() - h * 3600 * 1000);

  const sampleReportsData = [
    // 1. CRITICAL ROAD HAZARD (IN_PROGRESS)
    {
      ref: 'AID-2026-00101',
      title: 'Deep sunken sinkhole near Mirpur 10 roundabout',
      desc: 'Massive sinkhole over 1.2m wide threatening bus lane and motorbikes. Underground soil eroded after torrential rain.',
      catId: catRoads.id,
      deptId: deptRHD.id,
      zoneId: zoneMirpur.id,
      citizenId: citizenRahat.id,
      lat: 23.8071,
      lng: 90.3686,
      addr: 'Begum Rokeya Sarani, Mirpur 10 Intersection, Dhaka',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      priorityScore: 88.5,
      safety: 95,
      sev: 90,
      peop: 92,
      loc: 95,
      sla: 60,
      corrob: 20,
      corrobCount: 3,
      ackAt: subHours(14),
      teamId: teamRoadsMirpur.id,
      officerId: officerUser.id,
      createdHoursAgo: 16,
    },
    // 2. BLOCKED DRAINAGE - ESCALATED (SLA BREACH)
    {
      ref: 'AID-2026-00102',
      title: 'Kalyanpur canal sluice blocked with industrial plastic waste',
      desc: 'Canal opening fully obstructed. Stagnant knee-deep foul water entered ground-floor homes along South Paikpara.',
      catId: catDrainage.id,
      deptId: deptWASA.id,
      zoneId: zoneMirpur.id,
      citizenId: citizenRahat.id,
      lat: 23.7842,
      lng: 90.3551,
      addr: 'South Paikpara Canal Bank, Mirpur, Dhaka',
      status: 'ESCALATED',
      priority: 'CRITICAL',
      priorityScore: 89.0,
      safety: 90,
      sev: 92,
      peop: 88,
      loc: 85,
      sla: 95,
      corrob: 30,
      corrobCount: 4,
      ackAt: subHours(30),
      escalatedAt: subHours(4),
      escalationReason: 'Resolution deadline breached by 6 hours. Auto-escalated to Department Manager.',
      teamId: teamWasaMirpur.id,
      officerId: officerDrainage.id,
      createdHoursAgo: 32,
    },
    // 3. OVERFLOWING GARBAGE - RESOLVED (CITIZEN REVIEW)
    {
      ref: 'AID-2026-00103',
      title: 'Secondary Transfer Station waste spilling onto Dhanmondi Lake path',
      desc: 'Bins overflowing for 3 days attracting crows and dogs, blocking pedestrian jogging walkway.',
      catId: catWaste.id,
      deptId: deptWaste.id,
      zoneId: zoneDhanmondi.id,
      citizenId: citizenFatima.id,
      lat: 23.7485,
      lng: 90.3789,
      addr: 'Road 8A, Dhanmondi Lake Footpath, Dhaka',
      status: 'CITIZEN_REVIEW',
      priority: 'HIGH',
      priorityScore: 71.0,
      safety: 65,
      sev: 75,
      peop: 80,
      loc: 80,
      sla: 40,
      corrob: 10,
      corrobCount: 2,
      ackAt: subHours(20),
      resolvedAt: subHours(3),
      resolutionSummary: 'Sanitation team deployed with compactor truck #14. STS fully emptied, disinfected with lime bleach.',
      resolutionEvidenceUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
      teamId: teamWasteDhanmondi.id,
      createdHoursAgo: 24,
    },
    // 4. BROKEN STREETLIGHT - CLOSED (VERIFIED BY CITIZEN)
    {
      ref: 'AID-2026-00104',
      title: 'Exposed wire spark and 4 dark streetlights on Road 11',
      desc: 'Junction box cover fell off, live spark hazard in evening drizzle near school zone.',
      catId: catLights.id,
      deptId: deptElec.id,
      zoneId: zoneMirpur.id,
      citizenId: citizenRahat.id,
      lat: 23.8190,
      lng: 90.3665,
      addr: 'Road 11, Block C, Section 6, Mirpur, Dhaka',
      status: 'CLOSED',
      priority: 'HIGH',
      priorityScore: 68.5,
      safety: 85,
      sev: 65,
      peop: 60,
      loc: 70,
      sla: 30,
      corrob: 0,
      corrobCount: 1,
      ackAt: subHours(50),
      resolvedAt: subHours(28),
      closedAt: subHours(10),
      resolutionSummary: 'Replaced waterproof circuit box, re-wired LED driver, and tested all 4 luminaires successfully.',
      citizenVerified: true,
      citizenFeedbackRating: 5,
      citizenFeedbackComment: 'Fast dispatch! The street was lit up the next night and hazardous sparks were completely sealed.',
      citizenConfirmedAt: subHours(10),
      teamId: teamElecMirpur.id,
      createdHoursAgo: 54,
    },
    // 5. WATER MAIN PIPE BURST - ASSIGNED (PENDING ACK)
    {
      ref: 'AID-2026-00105',
      title: '6-inch drinking water feeder pipe burst flooding road',
      desc: 'High velocity geyser shooting out from underground pipe, clean water wasting continuously onto roadway.',
      catId: catWater.id,
      deptId: deptWASA.id,
      zoneId: zoneGulshan.id,
      citizenId: citizenFatima.id,
      lat: 23.7915,
      lng: 90.4120,
      addr: 'Gulshan Avenue, Near Shooting Club, Dhaka',
      status: 'ASSIGNED',
      priority: 'HIGH',
      priorityScore: 76.5,
      safety: 70,
      sev: 85,
      peop: 75,
      loc: 85,
      sla: 25,
      corrob: 10,
      corrobCount: 2,
      teamId: teamWasaGulshan.id,
      createdHoursAgo: 2,
    },
    // 6. FALLEN TREE - TRIAGED (NEEDS_INFORMATION / SUPERVISOR REVIEW DEMO)
    {
      ref: 'AID-2026-00106',
      title: 'Storm-damaged giant Krishnachura limb dangling over power cables',
      desc: 'Heavy branch cracked during evening squall, resting directly on secondary distribution lines near Mirpur 2 stadium.',
      catId: catTrees.id,
      deptId: deptParks.id,
      zoneId: zoneMirpur.id,
      citizenId: citizenRahat.id,
      lat: 23.8090,
      lng: 90.3610,
      addr: 'Stadium Road, Mirpur 2, Dhaka',
      status: 'TRIAGED',
      priority: 'CRITICAL',
      priorityScore: 84.0,
      safety: 95,
      sev: 85,
      peop: 80,
      loc: 80,
      sla: 20,
      corrob: 0,
      corrobCount: 1,
      teamId: teamParksCitywide.id,
      createdHoursAgo: 3,
    },
    // 7. NEW REPORT - SUBMITTED (A07 DEMO CANDIDATE)
    {
      ref: 'AID-2026-00107',
      title: 'Open manhole cover with bamboo stick indicator',
      desc: 'Manhole concrete slab broken in front of pharmacy. Local shopkeepers put a red cloth on bamboo to prevent pedestrians falling in.',
      catId: catDrainage.id,
      deptId: deptWASA.id,
      zoneId: zoneMirpur.id,
      citizenId: citizenRahat.id,
      lat: 23.8145,
      lng: 90.3678,
      addr: 'Pallabi Main Road, Section 11, Dhaka',
      status: 'SUBMITTED',
      priority: 'HIGH',
      priorityScore: 78.0,
      safety: 90,
      sev: 80,
      peop: 75,
      loc: 70,
      sla: 10,
      corrob: 0,
      corrobCount: 1,
      createdHoursAgo: 1,
    },
    // 8. SIDEWALK TILES - REOPENED
    {
      ref: 'AID-2026-00108',
      title: 'Broken tactile paving tiles and uncovered electric trench',
      desc: 'Blind accessible tactile pavers were replaced with uneven gravel; pedestrians tripping daily.',
      catId: catSidewalks.id,
      deptId: deptRHD.id,
      zoneId: zoneGulshan.id,
      citizenId: citizenFatima.id,
      lat: 23.7890,
      lng: 90.4030,
      addr: 'Kamal Ataturk Avenue, Banani, Dhaka',
      status: 'REOPENED',
      priority: 'MEDIUM',
      priorityScore: 54.0,
      safety: 50,
      sev: 55,
      peop: 65,
      loc: 75,
      sla: 40,
      corrob: 0,
      corrobCount: 1,
      reopenReason: 'Contractor dumped loose mortar without leveling tactile directional pavers. Still hazardous for visually impaired residents.',
      reopenedAt: subHours(5),
      teamId: teamRoadsGulshan.id,
      createdHoursAgo: 72,
    },
    // 9. GENERAL INFRASTRUCTURE - LOW PRIORITY
    {
      ref: 'AID-2026-00109',
      title: 'Damaged steel barrier around park children playground',
      desc: 'Section of safety fence rusted and disconnected at joint. No acute collapse risk.',
      catId: catGeneral.id,
      deptId: deptRHD.id,
      zoneId: zoneDhanmondi.id,
      citizenId: citizenFatima.id,
      lat: 23.7420,
      lng: 90.3710,
      addr: 'Road 4A Children Park, Dhanmondi, Dhaka',
      status: 'VALIDATING',
      priority: 'LOW',
      priorityScore: 28.5,
      safety: 25,
      sev: 30,
      peop: 35,
      loc: 30,
      sla: 10,
      corrob: 0,
      corrobCount: 1,
      createdHoursAgo: 4,
    },
    // 10. UTTARA DRAINAGE - IN_PROGRESS
    {
      ref: 'AID-2026-00110',
      title: 'Severe rainwater stagnation in front of Sector 3 School',
      desc: 'Drain grating clogged with leaves and plastic wrappers. Water accumulated 1 foot deep during morning school run.',
      catId: catDrainage.id,
      deptId: deptWASA.id,
      zoneId: zoneUttara.id,
      citizenId: citizenRahat.id,
      lat: 23.8680,
      lng: 90.3950,
      addr: 'Sector 3, Road 7, Uttara, Dhaka',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      priorityScore: 66.0,
      safety: 70,
      sev: 65,
      peop: 75,
      loc: 60,
      sla: 35,
      corrob: 10,
      corrobCount: 2,
      ackAt: subHours(8),
      createdHoursAgo: 14,
    },
    // 11. OLD DHAKA WASTE - ACKNOWLEDGED
    {
      ref: 'AID-2026-00111',
      title: 'Commercial leather scrap and rotting garbage dumped in alley',
      desc: 'Chawkbazar lane blocked by commercial garbage heap creating terrible stench and pedestrian blockage.',
      catId: catWaste.id,
      deptId: deptWaste.id,
      zoneId: zoneOldDhaka.id,
      citizenId: citizenRahat.id,
      lat: 23.7150,
      lng: 90.3990,
      addr: 'Chawk Circular Road, Old Dhaka',
      status: 'ACKNOWLEDGED',
      priority: 'MEDIUM',
      priorityScore: 58.0,
      safety: 55,
      sev: 60,
      peop: 70,
      loc: 60,
      sla: 20,
      corrob: 0,
      corrobCount: 1,
      ackAt: subHours(3),
      createdHoursAgo: 8,
    },
    // 12. MIRPUR POTHOLE - RESOLVED
    {
      ref: 'AID-2026-00112',
      title: 'Series of 3 deep potholes outside Mirpur 1 bus stand',
      desc: 'Buses violently swerving to avoid chassis impact, creating huge risk for rickshaws.',
      catId: catRoads.id,
      deptId: deptRHD.id,
      zoneId: zoneMirpur.id,
      citizenId: citizenRahat.id,
      lat: 23.8010,
      lng: 90.3540,
      addr: 'Mirpur 1 Main Road, Dhaka',
      status: 'RESOLVED',
      priority: 'HIGH',
      priorityScore: 74.0,
      safety: 80,
      sev: 75,
      peop: 85,
      loc: 80,
      sla: 50,
      corrob: 10,
      corrobCount: 2,
      ackAt: subHours(40),
      resolvedAt: subHours(12),
      resolutionSummary: 'Bitumen and crushed stone compaction completed over 15 sq meters. Road leveling verified.',
      teamId: teamRoadsMirpur.id,
      officerId: officerUser.id,
      createdHoursAgo: 45,
    },
    // 13. BROKEN LIGHT - REJECTED (Out of scope / private property)
    {
      ref: 'AID-2026-00113',
      title: 'Private residential building corridor light not functioning',
      desc: 'Building second floor internal stairwell bulb not working.',
      catId: catLights.id,
      deptId: deptElec.id,
      zoneId: zoneGulshan.id,
      citizenId: citizenFatima.id,
      lat: 23.7930,
      lng: 90.4150,
      addr: 'House 14, Road 44, Gulshan 2, Dhaka',
      status: 'REJECTED',
      priority: 'LOW',
      priorityScore: 18.0,
      safety: 10,
      sev: 20,
      peop: 10,
      loc: 10,
      sla: 0,
      corrob: 0,
      corrobCount: 1,
      resolutionSummary: 'Rejected: AidGrid handles public municipal infrastructure only. Internal private property lighting is the homeowner association responsibility.',
      createdHoursAgo: 60,
    },
    // 14. INFEASIBILITY DEMO REPORT (For A02 testing: Unqualified team / conflict)
    {
      ref: 'AID-2026-00114',
      title: 'High-voltage transformer grounding wire severed near playground',
      desc: 'Live high-voltage grounding connection snapped and exposed on ground. Demands certified specialist electrical team.',
      catId: catLights.id,
      deptId: deptElec.id,
      zoneId: zoneOldDhaka.id, // In Old Dhaka where no high voltage electrical team is stationed
      citizenId: citizenRahat.id,
      lat: 23.7120,
      lng: 90.4050,
      addr: 'Armanitola Park Corner, Old Dhaka',
      status: 'NEEDS_INFORMATION',
      priority: 'CRITICAL',
      priorityScore: 92.0,
      safety: 98,
      sev: 95,
      peop: 85,
      loc: 85,
      sla: 15,
      corrob: 10,
      corrobCount: 2,
      createdHoursAgo: 2,
    },
    // 15. A07 FAILED STEP DEMO (Injected failure for Judge Demonstration)
    {
      ref: 'AID-2026-00115',
      title: 'Clogged storm drain culvert behind Mirpur Commerce College',
      desc: 'Severe silt buildup blocking drain runoff. (Configured as test report for A07 failure-injection and persistent recovery).',
      catId: catDrainage.id,
      deptId: deptWASA.id,
      zoneId: zoneMirpur.id,
      citizenId: citizenRahat.id,
      lat: 23.8115,
      lng: 90.3588,
      addr: 'Commerce College Road, Section 2, Mirpur, Dhaka',
      status: 'TRIAGED',
      priority: 'HIGH',
      priorityScore: 72.5,
      safety: 75,
      sev: 70,
      peop: 75,
      loc: 70,
      sla: 20,
      corrob: 0,
      corrobCount: 1,
      createdHoursAgo: 5,
    },
  ];

  for (const item of sampleReportsData) {
    const report = await prisma.report.create({
      data: {
        referenceNumber: item.ref,
        title: item.title,
        description: item.desc,
        categoryId: item.catId,
        departmentId: item.deptId,
        serviceZoneId: item.zoneId,
        citizenId: item.citizenId,
        latitude: item.lat,
        longitude: item.lng,
        address: item.addr,
        status: item.status,
        priority: item.priority,
        priorityScore: item.priorityScore,
        safetyScore: item.safety,
        severityScore: item.sev,
        peopleScore: item.peop,
        locationScore: item.loc,
        slaScore: item.sla,
        corroborationScore: item.corrob,
        corroborationCount: item.corrobCount,
        acknowledgedAt: item.ackAt,
        resolvedAt: item.resolvedAt,
        closedAt: item.closedAt,
        escalatedAt: item.escalatedAt,
        escalationReason: item.escalationReason,
        resolutionSummary: item.resolutionSummary,
        resolutionEvidenceUrl: item.resolutionEvidenceUrl,
        citizenVerified: item.citizenVerified,
        citizenFeedbackRating: item.citizenFeedbackRating,
        citizenFeedbackComment: item.citizenFeedbackComment,
        citizenConfirmedAt: item.citizenConfirmedAt,
        reopenReason: item.reopenReason,
        reopenedAt: item.reopenedAt,
        createdAt: subHours(item.createdHoursAgo),
      },
    });

    // Create Initial Status History
    await prisma.statusHistory.create({
      data: {
        reportId: report.id,
        previousStatus: 'NONE',
        newStatus: 'SUBMITTED',
        changedById: item.citizenId,
        changeReason: 'Initial citizen submission through AidGrid Portal',
        createdAt: subHours(item.createdHoursAgo),
      },
    });

    if (item.status !== 'SUBMITTED') {
      await prisma.statusHistory.create({
        data: {
          reportId: report.id,
          previousStatus: 'SUBMITTED',
          newStatus: item.status,
          changedById: adminUser.id,
          changeReason: `Automated A07 workflow triage & state transition to ${item.status}`,
          createdAt: subHours(Math.max(1, item.createdHoursAgo - 1)),
        },
      });
    }

    // Create Assignment if assigned or in-progress
    if (item.teamId) {
      await prisma.assignment.create({
        data: {
          reportId: report.id,
          teamId: item.teamId,
          officerId: item.officerId || null,
          status: item.status === 'IN_PROGRESS' || item.status === 'RESOLVED' || item.status === 'CLOSED'
            ? 'IN_PROGRESS'
            : 'PENDING_ACK',
          assignmentCost: 18.5,
          distanceKm: 1.4,
          assignedAt: subHours(item.createdHoursAgo - 1),
          acknowledgedAt: item.ackAt,
        },
      });
    }

    // Create Decision Explanation for A02
    await prisma.decisionExplanation.create({
      data: {
        reportId: report.id,
        factorSafety: item.safety,
        factorSeverity: item.sev,
        factorPeople: item.peop,
        factorLocation: item.loc,
        factorSla: item.sla,
        factorCorroboration: item.corrob,
        totalScore: item.priorityScore,
        priorityBand: item.priority,
        weightsJson: JSON.stringify({
          safety: 0.30,
          severity: 0.25,
          people: 0.15,
          location: 0.15,
          sla: 0.10,
          corroboration: 0.05,
        }),
        rulesAppliedJson: JSON.stringify([
          item.safety > 80 ? 'RULE_CRITICAL_PUBLIC_SAFETY_RISK' : 'RULE_STANDARD_SAFETY',
          item.loc > 75 ? 'RULE_ARTERIAL_TRANSIT_CORRIDOR' : 'RULE_LOCAL_ACCESS_ROAD',
          item.sla > 50 ? 'RULE_SLA_URGENCY_THRESHOLD_MET' : 'RULE_NORMAL_SLA_WINDOW',
        ]),
        narrativeExplanation: `Calculated priority score ${item.priorityScore.toFixed(1)}/100 classified as ${item.priority}. Public safety factor (${item.safety}) and location sensitivity (${item.loc}) were primary contributors. Evaluated nearest qualified team with verified skill matching.`,
        recommendedTeamId: item.teamId || null,
        decisionVersion: 'v1.0.0',
        createdAt: subHours(item.createdHoursAgo),
      },
    });

    // Create Workflow Run and Steps for A07 demonstration
    const isSpecialFailedDemo = item.ref === 'AID-2026-00115';
    const workflowRun = await prisma.workflowRun.create({
      data: {
        reportId: report.id,
        runNumber: 1,
        status: isSpecialFailedDemo ? 'RETRY_PENDING' : (item.status === 'CLOSED' || item.status === 'RESOLVED' ? 'COMPLETED' : 'PROCESSING'),
        currentStep: isSpecialFailedDemo ? 6 : (item.status === 'SUBMITTED' ? 2 : 7),
        lastSuccessfulStep: isSpecialFailedDemo ? 5 : (item.status === 'SUBMITTED' ? 1 : 6),
        maxRetries: 3,
        retryCount: isSpecialFailedDemo ? 1 : 0,
        errorMessage: isSpecialFailedDemo ? 'SIMULATED_FAILURE: External dispatch SMS gateway timed out at Step 6 [NOTIFICATION_DISPATCH]' : null,
        idempotencyKey: `wf-${report.referenceNumber}-run1`,
        failureInjected: isSpecialFailedDemo,
        injectFailAtStep: isSpecialFailedDemo ? 6 : null,
        startedAt: subHours(item.createdHoursAgo),
      },
    });

    // Insert Workflow Steps for this run
    const stepNames = [
      'REPORT_CREATED',
      'INPUT_VALIDATION',
      'DUPLICATE_DETECTION',
      'INTELLIGENT_TRIAGE',
      'DEPARTMENT_EVALUATION',
      'WORK_ASSIGNMENT',
      'NOTIFICATION_DISPATCH',
      'SLA_MONITORING',
    ];

    for (let s = 1; s <= stepNames.length; s++) {
      let stepStatus = 'COMPLETED';
      let errorDetails = null;

      if (isSpecialFailedDemo) {
        if (s <= 5) stepStatus = 'COMPLETED';
        else if (s === 6) {
          stepStatus = 'FAILED';
          errorDetails = JSON.stringify({
            step: 6,
            error: 'GatewayTimeoutException: Network dropped during notification dispatch',
            code: 'INJECTED_TEST_FAILURE',
          });
        } else {
          stepStatus = 'PENDING';
        }
      } else if (item.status === 'SUBMITTED') {
        stepStatus = s === 1 ? 'COMPLETED' : 'PENDING';
      }

      await prisma.workflowStep.create({
        data: {
          workflowRunId: workflowRun.id,
          stepNumber: s,
          stepName: stepNames[s - 1],
          status: stepStatus,
          attemptCount: isSpecialFailedDemo && s === 6 ? 1 : (stepStatus === 'COMPLETED' ? 1 : 0),
          inputPayloadJson: JSON.stringify({ reportId: report.id, ref: report.referenceNumber }),
          outputPayloadJson: stepStatus === 'COMPLETED' ? JSON.stringify({ success: true, timestamp: now.toISOString() }) : null,
          errorDetailsJson: errorDetails,
          executionDurationMs: stepStatus === 'COMPLETED' ? 140 + (s * 35) : 0,
          executedAt: stepStatus === 'COMPLETED' ? subHours(item.createdHoursAgo) : null,
        },
      });
    }

    // Add Audit Log
    await prisma.auditLog.create({
      data: {
        userId: item.citizenId,
        action: 'REPORT_SUBMIT',
        entityType: 'REPORT',
        entityId: report.id,
        newValues: JSON.stringify({ ref: report.referenceNumber, title: report.title, category: catRoads.name }),
        createdAt: subHours(item.createdHoursAgo),
      },
    });
  }

  // Create Notifications for users
  await prisma.notification.createMany({
    data: [
      {
        userId: officerUser.id,
        title: 'New Emergency Road Repair Assigned',
        titleBn: 'নতুন জরুরি সড়ক মেরামত বরাদ্দ করা হয়েছে',
        message: 'Assignment AID-2026-00101 (Sinkhole near Mirpur 10) assigned to your response team.',
        messageBn: 'অ্যাসাইনমেন্ট AID-2026-00101 আপনার টিমের বরাদ্দে এসেছে।',
        type: 'ASSIGNMENT',
        linkUrl: '/field-ops',
      },
      {
        userId: managerUser.id,
        title: 'SLA Escalation Warning: Kalyanpur Canal Sluice',
        titleBn: 'এসএলএ সময়সীমা অতিক্রান্ত সতর্কতা: কল্যাণপুর খাল',
        message: 'Report AID-2026-00102 has breached the 24-hour resolution window. Immediate intervention required.',
        messageBn: 'রিপোর্ট AID-2026-00102 এর ২৪ ঘণ্টার সময়সীমা শেষ হয়েছে। তাত্ক্ষণিক পদক্ষেপ নিন।',
        type: 'ESCALATION',
        linkUrl: '/workflow',
      },
      {
        userId: citizenFatima.id,
        title: 'Your Report Has Been Resolved!',
        titleBn: 'আপনার রিপোর্টটির কাজ সম্পন্ন হয়েছে!',
        message: 'Waste spillage on Dhanmondi Lake footpath (AID-2026-00103) is marked resolved. Please verify and leave feedback.',
        messageBn: 'ধানমন্ডি লেকের বর্জ্য পরিষ্কার করা হয়েছে। অনুগ্রহ করে নাগরিক সন্তুষ্টি নিশ্চিত করুন।',
        type: 'CITIZEN_ACTION',
        linkUrl: '/citizen',
      },
    ],
  });

  console.log(`✅ AidGrid Seed Completed Successfully!`);
  console.log(`- 5 Pilot Service Zones`);
  console.log(`- 5 Municipal Departments`);
  console.log(`- 8 Issue Categories & SLA Policies`);
  console.log(`- 7 Field Teams & Certified Skills`);
  console.log(`- 6 Demo Profiles (Admin, Manager, 2 Officers, 2 Citizens)`);
  console.log(`- 15 Complete Synthetic Reports with full A02 scoring & A07 workflow records`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
