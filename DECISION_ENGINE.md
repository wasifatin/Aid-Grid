# ADVANCED CHALLENGE A02 — DECISION ENGINE
## Explainable Priority Scoring & Optimization Architecture

The AidGrid Decision Engine is a deterministic, auditable decision-support system that establishes transparent priority rankings and team assignment recommendations.

---

### 1. Explainable Priority Calculation

The platform implements a linear weighted factor model normalized to a 0–100 scale:

$$\text{Priority Score} = (S \times w_s) + (V \times w_v) + (P \times w_p) + (L \times w_l) + (A \times w_a) + (C \times w_c)$$

Where:
- $S$ = Public Safety Impact (Default weight: 0.30)
- $V$ = Issue Severity & Physical Damage (Default weight: 0.25)
- $P$ = Estimated People Affected (Default weight: 0.15)
- $L$ = Critical Location / Arterial Road Importance (Default weight: 0.15)
- $A$ = Issue Age & SLA Pressure (Default weight: 0.10)
- $C$ = Community Corroborations (Default weight: 0.05)

#### Score Bands:
- **80.0 – 100.0:** `CRITICAL` (Immediate emergency dispatch window)
- **60.0 – 79.9:** `HIGH` (Accelerated resolution timeline)
- **35.0 – 59.9:** `MEDIUM` (Standard municipal maintenance schedule)
- **0.0 – 34.9:** `LOW` (Scheduled community upkeep)

#### Dynamic Weight Configuration:
System administrators can reconfigure factor weights directly through the web UI (`/decision`). Updates persist in the `PriorityConfig` database entity and apply immediately without restarting server processes or modifying code.

---

### 2. Intelligent Team Assignment Engine

Candidate field response teams are assessed against six criteria:
1. **Jurisdiction Matching:** The team must be authorized for the incident's service zone.
2. **Mandatory Skill Verification:** The category's required certification (e.g. `HIGH_VOLTAGE_ELEC`, `HEAVY_DRAINAGE_EXCAVATION`) must exist on the team's verified skill profile.
3. **Availability Status:** Team status must be `ON_DUTY` or `STANDBY`.
4. **Capacity Constraint:** The team's active workload must be strictly less than its capacity limit.
5. **Geographical Proximity:** Computed using the Haversine formula based on team depot and incident GPS coordinates.
6. **Assignment Cost Function:**
   $$\text{Cost} = (\text{Distance}_{\text{km}} \times 2.5) + \left(\frac{\text{Workload}}{\text{Capacity}} \times 40\right)$$

---

### 3. Constraint Conflict Detection & Infeasibility Handling

When constraints cannot be satisfied simultaneously, AidGrid prevents invalid dispatch:
- **Missing Certification:** Nearest team is flagged if it lacks the required skill.
- **Capacity Exhaustion:** If all qualified teams are at 100% capacity, assignment is marked infeasible.
- **Safeguard Protocol:** Rather than assigning an unqualified team, the system marks the incident as `NEEDS_INFORMATION`, flags `isSupervisorReviewReq: true`, records an audit event, and generates a structured explanation for manual supervisor routing.
