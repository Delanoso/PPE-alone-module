# Product Requirements - PPE Issue System

## 1) Product name

**HFR Schafer Vervoer PPE Issue Management System**

## 2) Business purpose

Provide a digital health and safety system to manage:

- PPE stock quantities
- Employee PPE profiles (including sizes)
- PPE issue transactions
- Digital acknowledgements/signatures
- Auditable compliance records

## 3) Business units in scope

1. Refrigerated Trucks
2. Tautliners
3. Truck Workshop
4. Trailer Workshop
5. Fiberglass Division
6. Admin Office

## 4) Core user roles

- Super Admin
- Health & Safety Manager
- Stores Controller
- Department Supervisor
- Issuing Officer
- Employee (signature only / limited self-service)
- Auditor (read-only)

Detailed permissions are in `02-USER_ROLES_AND_PERMISSIONS.md`.

## 5) Functional requirements

### 5.1 Authentication and access

1. Users can register (or be invited by admin).
2. Users can log in and log out securely.
3. Users can reset password by email or mobile OTP.
4. Role-based access control must limit data and actions.
5. Sessions expire after configurable inactivity timeout.

### 5.2 Dashboard

Dashboard must include:

- Current PPE stock by item and site
- Low-stock alerts and reorder indicators
- Pending signature requests
- PPE issued today/this week/this month
- Top departments by PPE consumption
- Recent issue activity log

### 5.3 Department and people management

1. Admins can add, edit, deactivate, and delete people.
2. People records include:
   - Employee number
   - Full name
   - Mobile number (WhatsApp-enabled)
   - Department
   - Sub-department
   - Job title
   - PPE size profile (multi-field)
   - Active/inactive status
3. Departments and sub-departments are managed centrally.
4. Bulk import for people via CSV/Excel is supported.
5. Search, filter, and pagination are required.

### 5.4 PPE catalog and stock management

1. Admins can define PPE items and variants.
2. Each item includes:
   - SKU/code
   - Description
   - Category
   - Size applicability
   - Unit of measure
   - Minimum stock threshold
3. Stock actions:
   - Receive stock
   - Adjust stock
   - Transfer stock between locations
   - Mark damaged/expired items
4. All stock movements must be auditable.

### 5.5 PPE issuing workflow

1. Issuing officer selects employee, item(s), quantity, and size.
2. System validates availability before issue.
3. Issue transaction is saved with unique issue number.
4. Signature request can be sent by WhatsApp link.
5. Employee opens secure link and signs digitally.
6. Signed acknowledgement is linked to issue transaction.
7. If unsigned, reminder messages can be sent.

### 5.6 WhatsApp link-based signing

1. Unique short-lived tokenized link per issue event.
2. Link opens mobile-friendly signing page.
3. Signature records timestamp, signer identity, and IP/device metadata.
4. Expired links cannot be reused.
5. Signed PDF or image evidence is storable/retrievable.

### 5.7 Reporting and compliance

Standard reports:

- PPE issued per person/date range
- PPE issued by department/sub-department
- Outstanding/unacknowledged issues
- Size distribution and size changes over time
- Stock movement ledger
- Expiry and damaged stock report

Export options:

- CSV
- Excel
- PDF

## 6) Non-functional requirements

1. **Security:** encrypted data in transit (TLS) and at rest where possible.
2. **Availability:** target 99.5% monthly uptime.
3. **Performance:** standard list pages load within 2 seconds under normal load.
4. **Auditability:** immutable audit log for critical operations.
5. **Scalability:** design for growth across additional sites/depots.
6. **Usability:** mobile-friendly for supervisors and signature pages.
7. **Data retention:** configurable per legal and internal policy.

## 7) Data requirements

System must store:

- User accounts and roles
- Departments and sub-departments
- Employee records and PPE size profiles
- PPE catalog
- Stock balances and stock movements
- Issue transactions and issue line items
- Signature records and message delivery states
- Full audit logs

## 8) Out of scope (phase 1)

- Payroll integration
- Biometric time-and-attendance integration
- Native mobile app (web responsive only)
- Multi-company tenancy

## 9) Acceptance criteria summary

1. Complete person lifecycle: add/edit/delete/deactivate and size updates.
2. Full PPE stock lifecycle: receive/adjust/issue/audit.
3. Issue + WhatsApp signature flow works end-to-end.
4. Data saved correctly and retrievable through reports.
5. Permissions enforce role restrictions.

