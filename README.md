# AIDGRID
### Public issues. Accountable action.

> **CODE-ARENAX — Hack the Vibe 2026**  
> **Track:** WORLD PROBLEM SOLVER TRACK  
> **Declared Advanced Challenges:**  
> - **A02 — Intelligent Decisions & Optimization (20 Marks)**  
> - **A07 — Automated Multi-Step Workflow (20 Marks)**  
> **Mandatory Requirements:** M01 to M08 (60 Marks)  
> **Target Pilot Region:** Dhaka Municipal Corporation Pilot Area (DNCC & DSCC, Bangladesh)

---

## 1. Executive Summary

**AidGrid** is an intelligent civic problem-solving, triage, and public-service accountability platform. It connects citizens, municipal authorities, department supervisors, and ground field response crews within a transparent, verifiable operational cycle.

Unlike conventional passive grievance portals, AidGrid incorporates:
- **A02 Decision Intelligence:** A deterministic, explainable multi-factor scoring algorithm combined with a capacity-aware, skill-verified team assignment engine.
- **A07 Automated Multi-Step Workflow:** A persistent, database-backed 12-step event lifecycle with idempotent step execution, automated failure injection recovery, and proactive SLA escalation monitoring.
- **Open311 GeoReport v2 Compliance:** Standard REST interfaces interoperable with global civic technology frameworks.
- **Bilingual Interface:** Full English and Bangla (বাংলা) support across all modules and status workflows.

---

## 2. Core Functional Modules

| Module | Description | Target Users |
|---|---|---|
| **Module A: Citizen Portal** | Mobile-first complaint filing, real-time nearby duplicate detection (<500m), interactive community corroboration, photo evidence, and two-way verification gate (acceptance rating or rejection/reopen). | Citizens / Residents |
| **Module B: Operations Command Center** | Enterprise dashboard featuring real-time analytical metrics, priority distribution, category breakdowns, GIS map visualization, multi-parameter filtering, and comprehensive lifecycle audits. | Municipal Administrators & Supervisors |
| **Module C: Field Operations Workspace** | Tactical work queue for response crews: task acknowledgement, on-site initiation, progress logging, completion photo submission, and resolution reporting. | Field Officers & Response Crews |
| **Module D: Decision & Workflow Center** | Live interactive sandbox showcasing explainable priority breakdown, dynamic weight tuning without code modifications, constraint conflict isolation, and failure-injection recovery. | System Architects, Judges & Engineers |

---

## 3. Technology Stack

- **Frontend & App Framework:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Data Visualization & GIS:** Recharts, Leaflet / OpenStreetMap GeoJSON spatial models
- **Database & Persistence:** SQLite with Prisma ORM (relational schema, transactional integrity, foreign keys, unique indices)
- **Security & Authorization:** Role-Based Access Control (RBAC), bcrypt password hashing, JSON Web Tokens (JWT)
- **Testing:** Vitest automated test suite verifying M01–M08, A02, and A07 specifications

---

## 4. Quick Start & Setup

### Prerequisites
- Node.js v18+ (tested on v20 and v26)
- npm or pnpm

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/aidgrid/aidgrid.git
cd aidgrid

# 2. Install dependencies
npm install

# 3. Synchronize database schema
npx prisma generate
npx prisma db push

# 4. Seed demo dataset (5 zones, 5 departments, 8 categories, 15+ synthetic reports)
npm run db:seed

# 5. Run automated test suite
npm run test

# 6. Launch development server
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 5. Judge Evaluation Guide & Role Quick-Switch

AidGrid provides an instant 1-click **Judge Quick-Switch Role Bar** in the header:
- **System Admin:** `admin@aidgrid.gov.bd` (Full command center, settings, analytics)
- **Department Manager:** `manager@dncc.gov.bd` (Department oversight, SLA escalations)
- **Field Officer:** `officer@aidgrid.gov.bd` (Work queue, acknowledgement, resolution)
- **Citizen:** `citizen@aidgrid.gov.bd` (Issue filing, corroboration, satisfaction review)

All accounts share the default development password: `aidgrid2026`

---

## 6. Repository Documentation Index

1. [`PRD.md`](./PRD.md) — Product Requirements Document & Scope
2. [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md) — Architectural Diagram & System Topology
3. [`DATABASE_DESIGN.md`](./DATABASE_DESIGN.md) — Entity-Relationship Design & Schema
4. [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) — REST Endpoints & Open311 v2 Specification
5. [`DECISION_ENGINE.md`](./DECISION_ENGINE.md) — A02 Mathematical Formulation & Conflict Logic
6. [`WORKFLOW_ENGINE.md`](./WORKFLOW_ENGINE.md) — A07 Persistent State Engine & Recovery Mechanism
7. [`SECURITY.md`](./SECURITY.md) — Security Protocols, RBAC, and Data Protection
8. [`TESTING_AND_QA.md`](./TESTING_AND_QA.md) — Test Matrix, Vitest Suites, and Verification Logs
9. [`DEPLOYMENT.md`](./DEPLOYMENT.md) — Cloud Hosting and Production Setup
10. [`SETUP_AND_INITIALIZATION.md`](./SETUP_AND_INITIALIZATION.md) — Step-by-Step Environment Initialization
11. [`OPEN_SOURCE_ATTRIBUTION.md`](./OPEN_SOURCE_ATTRIBUTION.md) — Licenses & Upstream Acknowledgements
