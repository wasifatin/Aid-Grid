# API DOCUMENTATION & INTEROPERABILITY SPECIFICATION
## AIDGRID REST & Open311 GeoReport v2 Specification

AidGrid exposes both native application JSON endpoints and an Open311 GeoReport v2 compatible service adapter.

---

### 1. Authentication Endpoints

#### `POST /api/auth/login`
Authenticates a user session via email/password or initiates a Judge Role Switch.
- **Request Body:**
  ```json
  { "email": "admin@aidgrid.gov.bd", "password": "aidgrid2026" }
  ```
  Or for Judge 1-click evaluation:
  ```json
  { "judgeRole": "SYSTEM_ADMIN" }
  ```
- **Response:** `200 OK` with user profile object and sets HTTP-only `aidgrid_token` cookie.

#### `GET /api/auth/me`
Retrieves currently authenticated session, active role, and department context.

---

### 2. Civic Reports Endpoints

#### `GET /api/reports`
Queries reported civic infrastructure issues with multi-facet filters.
- **Query Parameters:** `search`, `category`, `priority`, `status`, `departmentId`, `serviceZoneId`, `citizenId`, `page`, `limit`, `sortBy`, `sortOrder`.
- **Response:** Array of reports with relational associations (category, department, zone, assignments).

#### `POST /api/reports`
Submits a verified civic infrastructure report and automatically initiates the A07 persistent workflow pipeline.
- **Request Body:**
  ```json
  {
    "title": "Broken storm water culvert",
    "description": "Drainage blocked near intersection causing monsoon waterlogging.",
    "categoryId": "DRAINAGE",
    "serviceZoneId": "DNCC-Z1",
    "latitude": 23.8223,
    "longitude": 90.3654,
    "address": "Begum Rokeya Sarani, Mirpur 10, Dhaka",
    "safetyScore": 85,
    "severityScore": 80,
    "peopleScore": 75,
    "locationScore": 70,
    "photoUrl": "https://example.org/evidence.jpg",
    "injectFailAtStep": null
  }
  ```
- **Response:** `201 Created` with generated reference (e.g., `AID-2026-00116`) and executed workflow status.

#### `GET /api/reports/nearby`
Detects potential duplicate reports within a geographic radius (default 500–800m).
- **Parameters:** `lat`, `lng`, `categoryId`, `radius` (in km).

#### `POST /api/reports/[id]/corroborate`
Allows community members to corroborate an existing nearby issue, incrementing confirmation count and raising priority score (+5%).

---

### 3. Open311 GeoReport v2 Standard Adapter

AidGrid provides an interoperability layer modeled after the Open311 GeoReport v2 open civic standard:

#### `GET /api/open311/v2/services`
Lists active service categories with codes, names, and responsible agencies.

#### `GET /api/open311/v2/requests`
Retrieves public service requests in standardized GeoReport schema.

#### `POST /api/open311/v2/requests`
Submits an external service request into AidGrid's triage pipeline.
- **Input Fields:** `service_code`, `lat`, `long`, `address_string`, `description`, `first_name`, `email`.
- **Output:** Returns `service_request_id` (`AID-2026-XXXXX`).

#### `GET /api/open311/v2/requests/[id]`
Fetches status, priority, and resolution details for a specific service request.
