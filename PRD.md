# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## AIDGRID — Intelligent Civic Problem-Solving & Public Service Intelligence Platform

### 1. Document Overview
- **Document Version:** 1.0.0
- **Status:** Approved / Implemented
- **Track:** World Problem Solver Track (CODE-ARENAX 2026)
- **Platform Scope:** Municipal Infrastructure & Civic Problem Accountability

---

### 2. Problem Statement
Municipal service management in dense urban regions faces multiple structural bottlenecks:
1. **Fragmented Reporting Channels:** Complaints submitted through arbitrary social media or paper logs lack accountability.
2. **Duplication and Noise:** Multiple residents report identical incidents independently without corroboration.
3. **Subjective Prioritization:** Urgent safety hazards are frequently scheduled behind non-critical beautification tasks.
4. **Mismatched Dispatch:** Tasks are assigned to field crews lacking requisite tools or certifications.
5. **No Resolution Verification:** Issues are closed administratively without resident confirmation.

---

### 3. Core Requirements Matrix

#### Mandatory Requirements (M01–M08)
- **M01: Complete Functional System (12 Marks)**  
  End-to-end operational pipeline connecting citizen submission, validation, automated triage, field crew assignment, completion evidence submission, citizen review, and archival.
- **M02: Database Persistence (8 Marks)**  
  Durable relational storage backing profiles, departments, zones, teams, skills, SLA policies, reports, assignments, status histories, workflow steps, notifications, and audit logs.
- **M03: Authentication & Role-Based Access Control (8 Marks)**  
  Enforced permissions across four distinct actor roles: Citizen, Field Officer, Department Manager, and System Administrator.
- **M04: Complex Business Logic & Lifecycle State Machine (10 Marks)**  
  Defined statuses: SUBMITTED, VALIDATING, TRIAGED, ASSIGNED, ACKNOWLEDGED, IN_PROGRESS, NEEDS_INFORMATION, RESOLVED, CITIZEN_REVIEW, CLOSED, REOPENED, ESCALATED, REJECTED.
- **M05: Dynamic Search, GIS, and Analytics (6 Marks)**  
  Real-time multi-facet filtering, Haversine geographic proximity calculation, SLA compliance percentages, and department utilization metrics.
- **M06: Edge-Case Handling & Defensive Design (8 Marks)**  
  Coordinate validation, spatial duplicate detection (<500m), input sanitization, and idempotent execution.
- **M07: Responsive UI & Accessibility (4 Marks)**  
  Semantic HTML, high-contrast dark theme, accessible forms, and bilingual English/Bangla text.
- **M08: Deployment & Documentation (4 Marks)**  
  Full architecture specifications, complete codebase, automated test suites, and deployment blueprints.

#### Advanced Challenges (A02 & A07)
- **A02: Intelligent Decisions & Optimization (20 Marks)**  
  Deterministic 6-factor explainable priority engine; skill-matched, distance-optimized field team assignment; constraint conflict detection and infeasibility handling.
- **A07: Automated Multi-Step Persistent Workflow (20 Marks)**  
  12-step event lifecycle; database-backed workflow runs and steps; failure injection sandbox; idempotent recovery resuming from the last successful step; proactive SLA escalation monitor.

---

### 4. Target Problem Categories
1. Damaged roads and potholes (ROADS)
2. Blocked drainage and waterlogging (DRAINAGE)
3. Uncollected garbage and overflowing waste bins (WASTE)
4. Broken streetlights and dark alleys (LIGHTS)
5. Water supply pipeline leakage (WATER)
6. Damaged sidewalks and pedestrian hazards (SIDEWALKS)
7. Fallen trees and storm hazards (TREES)
8. Other non-emergency community infrastructure (GENERAL)

*Note: Critical life-threatening emergencies trigger an immediate modal directive guiding the user to dial National Emergency Service 999.*
