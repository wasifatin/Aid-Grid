# SECURITY & DATA PROTECTION ARCHITECTURE
## AIDGRID Security Implementation

AidGrid adheres to defense-in-depth principles across its frontend, API layer, and database boundaries.

---

### 1. Role-Based Access Control (RBAC)

The application enforces a 4-tier role hierarchy:
1. **Citizen (`CITIZEN`):** Can submit reports, corroborate nearby issues, view personal history, confirm resolutions, and reopen unsatisfactory completions. Cannot view internal field notes or unmasked contact details of other citizens.
2. **Field Officer (`FIELD_OFFICER`):** Authorized to access assigned response queues, acknowledge work, log technical notes, and submit photographic evidence of repair.
3. **Department Manager (`DEPARTMENT_MANAGER`):** Manages team assignments, reviews SLA escalations, and supervises departmental resolution metrics.
4. **System Administrator (`SYSTEM_ADMIN`):** Unrestricted supervisory access across pilot zones, global configuration, weight tuning, and audit trails.

---

### 2. Authentication & Session Integrity
- **Password Protection:** User passwords are encrypted with `bcrypt` (10 salt rounds). Plaintext passwords are never stored or logged.
- **JWT Session Tokens:** Signed using a 32-character secret key and delivered via secure `HttpOnly`, `SameSite=Lax` browser cookies.
- **Server-Side Verification:** Every mutating API route checks caller identity and role server-side; client role checks are treated as display aids only.

---

### 3. Privacy & Public Data Protection
- **Citizen PII Masking:** Public listings (`/reports`, `/map`, `/api/reports`) selectively project report fields, excluding citizen phone numbers, National ID numbers (NID), and private contact details.
- **Input Sanitization:** Geospatial coordinates are clamped to valid ranges (-90 to +90, -180 to +180).
- **Audit Logging:** Security-relevant actions (submission, assignment, state transition, failure injection) are permanently recorded in `AuditLog` records.
