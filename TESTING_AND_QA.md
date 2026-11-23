# TESTING & QUALITY ASSURANCE MANUAL
## AIDGRID Test Strategy & Verification Evidence

AidGrid employs a multi-tier testing strategy combining automated Vitest unit/integration tests with end-to-end judge verification scenarios.

---

### 1. Automated Vitest Suite

Execute the automated test suite with:
```bash
npm run test
```

#### Test Suite Coverage Matrix (`tests/aidgrid.test.ts`):
1. **M01 & M02: Persistence & Lifecycle** — Creates incident report, assigns unique identifier (`AID-TEST-XXXX`), verifies transactional SQLite persistence.
2. **M03: Role Permissions & Cryptography** — Validates bcrypt hashing, token generation, and role boundary restrictions.
3. **M04: State Machine Governance** — Exercises status transitions and history audit insertion.
4. **M05: Geospatial Distance Calculation** — Validates Haversine distance computations across Dhaka coordinates.
5. **A02.1: Mathematical Priority Determinism** — Confirms exact scoring output across all 6 weighted parameters.
6. **A02.2: Score Band Classification** — Tests threshold categorization (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
7. **A02.3: Certified Skill Matching** — Verifies team selection requiring category-specific credentials.
8. **A02.4: Conflict Infeasibility Detection** — Asserts graceful rejection when candidate teams lack mandatory qualifications.
9. **A07.1: Multi-Step Durable Execution** — Validates persistent 8-step pipeline execution and step record creation.
10. **A07.2 & A07.3: Injected Failure & Recovery** — Injects step failure, verifies error persistence, resumes execution idempotently from the last successful step without duplicate assignments.
11. **A07.4: Proactive SLA Escalation** — Evaluates deadline calculations and automated manager escalation.

---

### 2. Manual Judge Testing Guide

1. **Test A02 Decision Engine:**
   - Navigate to `/decision`.
   - Click "3. Uncertified Skill Conflict".
   - Confirm that the system highlights constraint infeasibility and logs the incident for supervisor review.
2. **Test A07 Workflow Recovery:**
   - Navigate to `/workflow`.
   - Select the pre-seeded failure run (`AID-2026-00115`).
   - Observe Step 6 in `FAILED` status with captured timeout details.
   - Click "Execute Automated Recovery / Retry Worker".
   - Confirm the worker resumes execution from Step 6 to Step 8 without duplicating earlier steps.
3. **Test Full Citizen-to-Resolution Lifecycle:**
   - Navigate to `/citizen` and file a report.
   - Check the instant duplicate detection alert (<500m).
   - Use the Judge Role bar to switch to Field Lead (`/field-ops`).
   - Acknowledge task, start work, and submit completion proof.
   - Switch back to Citizen (`/citizen`) and accept the resolution with a 5-star rating.
