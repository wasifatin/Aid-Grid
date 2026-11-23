# SYSTEM ARCHITECTURE SPECIFICATION
## AIDGRID Platform Architecture

### 1. Architectural Topology

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  [Citizen Portal]      [Command Center]      [Field Ops]      [Intelligence Lab]  |
|  - Next.js 14 App      - Recharts Analytics  - Task Queue     - Weight Tuning     |
|  - Leaflet GIS         - Data Tables         - Photo Proof    - Failure Sandbox   |
+-----------------------------------------------------------------------------------+
                                          |
                                    HTTPS / REST
                                          v
+-----------------------------------------------------------------------------------+
|                             APPLICATION & API LAYER                               |
|  +-----------------------+  +-----------------------+  +-----------------------+  |
|  |   Auth & RBAC Guard   |  |   Open311 v2 Adapter  |  | Reports CRUD & Spatial|  |
|  |   (JWT / Cookie / Me) |  |   (/services, requests|  | (/nearby, /corroborate) |  |
|  +-----------------------+  +-----------------------+  +-----------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                     +--------------------+--------------------+
                     v                                         v
+----------------------------------------+   +--------------------------------------+
|        A02 DECISION ENGINE             |   |        A07 WORKFLOW ENGINE           |
| - 6-Factor Normalized Scoring (0-100)  |   | - 12-Step State Machine Pipeline     |
| - Configurable Weight Matrix           |   | - Atomic Step Execution & Idempotency|
| - Haversine Proximity Optimizer        |   | - Failure Injection & Resume Worker  |
| - Skill Verification & Conflict Guard  |   | - SLA Escalation Heartbeat Daemon    |
+----------------------------------------+   +--------------------------------------+
                     |                                         |
                     +--------------------+--------------------+
                                          v
+-----------------------------------------------------------------------------------+
|                                PERSISTENCE LAYER                                  |
|                             Prisma ORM / Relational DB                            |
|  [Profiles]   [Departments]   [Zones]   [Categories]   [Teams & Skills]           |
|  [Reports]    [Attachments]   [Assignments]   [WorkflowRuns]   [WorkflowSteps]    |
|  [DecisionExplanations]       [PriorityConfig] [AuditLogs]     [Notifications]    |
+-----------------------------------------------------------------------------------+
```

---

### 2. Component Separation & Responsibilities

1. **Presentation Layer (`src/app/`, `src/components/`):**
   - Pure client components with server-rendered wrappers.
   - Context-driven state management (`AppContext.tsx`) managing bilingual localization, active user sessions, role-switching, and global alerts.
   
2. **Decision Engine Subsystem (`src/lib/decision-engine.ts`):**
   - Decoupled from UI components for independent evaluation and testing.
   - Accepts normalized input metrics (0–100) and computes weighted priority scores.
   - Evaluates candidate teams against geographic jurisdiction, certified skills, status, and workload capacity.
   - Generates structured narratives, rules-applied lists, and infeasibility reports.

3. **Workflow Engine Subsystem (`src/lib/workflow-engine.ts`):**
   - Executes multi-step pipelines with database durability.
   - Each step records input payload, output payload, execution duration, and timestamp.
   - Ensures idempotency by checking unique keys before creating records.
   - Provides recovery logic to resume execution from the last successful step upon system restart.

4. **Data Access Layer (`src/lib/prisma.ts`, `prisma/schema.prisma`):**
   - Singleton client instance optimized for serverless and containerized deployments.
   - Relational model enforcing foreign keys, cascade rules, and compound indices.
