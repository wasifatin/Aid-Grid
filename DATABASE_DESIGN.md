# DATABASE DESIGN SPECIFICATION
## AIDGRID Relational Schema Documentation

AidGrid utilizes a relational schema configured for SQLite/PostgreSQL with foreign key constraints, unique indices, and transaction boundaries.

---

### 1. Entity-Relationship Overview

```
+---------------+        1:N        +------------------+
|  Department   |------------------>|       Team       |
+---------------+                   +------------------+
        | 1:N                                 | 1:N
        v                                     v
+---------------+                   +------------------+
| IssueCategory |                   |    TeamSkill     |
+---------------+                   +------------------+
        | 1:N
        v
+---------------+        1:N        +------------------+
|    Report     |------------------>|    Assignment    |
+---------------+                   +------------------+
  | 1:N   | 1:N   \ 1:N                       |
  |       |        +------------+             v
  |       v                     |     +------------------+
  |  +--------------------+     |     |     Profile      |
  |  |  ReportAttachment  |     |     +------------------+
  |  +--------------------+     |
  v                             v
+--------------------+   +-----------------------+
|   WorkflowRun      |   |  DecisionExplanation  |
+--------------------+   +-----------------------+
          | 1:N
          v
+--------------------+
|   WorkflowStep     |
+--------------------+
```

---

### 2. Core Entities & Data Dictionaries

#### `Profile`
Stores user identities, hashed credentials, and role associations.
- `id` (String, PK)
- `email` (String, Unique)
- `passwordHash` (String)
- `fullName` (String)
- `phone` (String, Optional)
- `nidOrCitizenId` (String, Optional)
- `role` (String: CITIZEN, FIELD_OFFICER, DEPARTMENT_MANAGER, SYSTEM_ADMIN)
- `preferredLang` (String: "en" | "bn")
- `departmentId`, `teamId`, `serviceZoneId` (Foreign Keys)

#### `Report`
Primary civic complaint record containing geospatial coordinates, lifecycle state, and factor scores.
- `id` (String, PK)
- `referenceNumber` (String, Unique, format: `AID-2026-XXXXX`)
- `title`, `description`, `address` (Text)
- `latitude`, `longitude` (Float)
- `categoryId`, `departmentId`, `serviceZoneId`, `citizenId` (Foreign Keys)
- `status` (Enum: SUBMITTED, VALIDATING, TRIAGED, ASSIGNED, ACKNOWLEDGED, IN_PROGRESS, NEEDS_INFORMATION, RESOLVED, CITIZEN_REVIEW, CLOSED, REOPENED, ESCALATED, REJECTED)
- `priority` (Enum: CRITICAL, HIGH, MEDIUM, LOW)
- `priorityScore` (Float, 0.0–100.0)
- `safetyScore`, `severityScore`, `peopleScore`, `locationScore`, `slaScore`, `corroborationScore` (Float)
- `corroborationCount` (Int, Default: 1)
- `ackDeadline`, `resolutionDeadline` (DateTime)
- `resolutionSummary`, `resolutionEvidenceUrl` (Text, Optional)
- `citizenVerified` (Boolean), `citizenFeedbackRating` (Int, 1–5)

#### `WorkflowRun` & `WorkflowStep`
Durable tracking tables supporting A07 persistent workflow execution.
- `WorkflowRun`: `id`, `reportId`, `runNumber`, `status` (PENDING, PROCESSING, COMPLETED, RETRY_PENDING, FAILED), `currentStep`, `lastSuccessfulStep`, `idempotencyKey` (Unique), `errorMessage`.
- `WorkflowStep`: `id`, `workflowRunId`, `stepNumber` (1–12), `stepName`, `status` (PENDING, EXECUTING, COMPLETED, FAILED), `attemptCount`, `inputPayloadJson`, `outputPayloadJson`, `errorDetailsJson`, `executionDurationMs`.

#### `DecisionExplanation`
Auditable record of A02 prioritization and assignment recommendations.
- `id`, `reportId`, factor scores, `totalScore`, `priorityBand`, `weightsJson`, `rulesAppliedJson`, `narrativeExplanation`, `recommendedTeamId`, `infeasibilityReason`, `isSupervisorReviewReq`.

#### `PriorityConfig`
Configurable scoring weight parameters editable at runtime.
- `id` ("default-config")
- `safetyWeight` (0.30), `severityWeight` (0.25), `peopleWeight` (0.15), `locationWeight` (0.15), `slaWeight` (0.10), `corroborationWeight` (0.05)
- `criticalThreshold` (80.0), `highThreshold` (60.0), `mediumThreshold` (35.0)
