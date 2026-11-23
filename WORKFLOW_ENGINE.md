# ADVANCED CHALLENGE A07 — WORKFLOW ENGINE
## Automated Multi-Step Persistent Workflow & Failure Recovery

The AidGrid Workflow Engine provides a database-backed, event-driven state machine that guarantees execution persistence, idempotency, and automated recovery across system interruptions.

---

### 1. 12-Step Lifecycle Pipeline

1. **Step 1: REPORT_CREATED** — Persists initial complaint and assigns unique reference `AID-2026-XXXXX`.
2. **Step 2: INPUT_VALIDATION** — Verifies mandatory fields, coordinate bounds, and address consistency.
3. **Step 3: DUPLICATE_DETECTION** — Evaluates nearby open incidents within 500m for spatial deduplication.
4. **Step 4: INTELLIGENT_TRIAGE** — Calculates A02 priority score and persists decision explanation.
5. **Step 5: DEPARTMENT_EVALUATION** — Screens candidate teams for skills, jurisdiction, and capacity.
6. **Step 6: WORK_ASSIGNMENT** — Creates a durable field assignment record and increments active team load.
7. **Step 7: NOTIFICATION_DISPATCH** — Emits notifications to both resident and dispatched field response crew.
8. **Step 8: SLA_MONITORING** — Evaluates category SLA policy and establishes countdown deadlines.
9. **Step 9: ESCALATION_CHECK** — Periodic monitor scanning open tasks for deadline breaches.
10. **Step 10: RESOLUTION_AUDIT** — Validates completion photographs and technical notes upon field submission.
11. **Step 11: CITIZEN_VERIFICATION** — Presents two-way confirmation prompt to resident (accept or reopen).
12. **Step 12: FINAL_CLOSURE** — Records SHA-256 verified archival log and closes incident.

---

### 2. Persistent Architecture & State Tables

Execution status is tracked in durable relational entities:
- `WorkflowRun`: Holds run identifier, report link, overall status (`PENDING`, `PROCESSING`, `COMPLETED`, `RETRY_PENDING`, `FAILED`), current step number, last successful step, retry counts, and idempotency key.
- `WorkflowStep`: Records individual step outcome, input JSON, output JSON, duration in milliseconds, and error details.

---

### 3. Failure Injection & Idempotent Resumption

To demonstrate resilience for competition evaluators, AidGrid includes a failure-injection sandbox:
1. **Failure Injection:** An evaluator specifies a step to fail (e.g. Step 6).
2. **Captured Error:** Step execution encounters a simulated gateway timeout. The step is marked `FAILED`, the run is placed in `RETRY_PENDING`, and an error payload is persisted.
3. **Automated Recovery:** The evaluator triggers the recovery worker.
4. **Idempotent Resume:** The engine identifies `lastSuccessfulStep = 5`, skips steps 1 through 5, and re-executes starting at step 6 without generating duplicate assignments or notifications.
