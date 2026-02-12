# Functional Requirements

## 1. Authentication and Access

- **FR-AUTH-001**: Users can register new accounts (admin-controlled).
- **FR-AUTH-002**: Users can log in with email/employee ID and password.
- **FR-AUTH-003**: MFA can be enabled per role or globally.
- **FR-AUTH-004**: Password reset flow with token expiry is required.
- **FR-AUTH-005**: Session timeout and account lockout policy must be enforced.

## 2. User and Role Management

- **FR-ROLE-001**: Admin can create, edit, disable users.
- **FR-ROLE-002**: Role-based access control must govern all modules.
- **FR-ROLE-003**: Permissions can be granted per action (view/create/update/delete/approve/export).

## 3. Organization Structure

- **FR-ORG-001**: Maintain departments and sub-departments.
- **FR-ORG-002**: Person records must reference one department and one sub-department.
- **FR-ORG-003**: Departments can be activated/deactivated.

## 4. People Management

- **FR-PEOPLE-001**: Add person with employee number, identity details, contact, and role.
- **FR-PEOPLE-002**: Edit person details including PPE sizes.
- **FR-PEOPLE-003**: Delete person (soft delete with audit trail).
- **FR-PEOPLE-004**: Reactivate previously deleted people when needed.
- **FR-PEOPLE-005**: Bulk import people via CSV.

## 5. PPE Catalog and Sizing

- **FR-PPE-001**: Maintain PPE master items (code, category, replacement cycle).
- **FR-PPE-002**: Maintain item variants by size and color where applicable.
- **FR-PPE-003**: Set minimum stock thresholds by location.
- **FR-PPE-004**: Link required PPE sets by department/job type.

## 6. Stock Management

- **FR-STOCK-001**: Capture stock receipts against suppliers and purchase refs.
- **FR-STOCK-002**: Capture stock adjustments with reason codes.
- **FR-STOCK-003**: Track on-hand, reserved, and available quantities.
- **FR-STOCK-004**: Trigger low-stock alerts.

## 7. PPE Issue Process

- **FR-ISSUE-001**: Create issue transactions for one or more PPE items.
- **FR-ISSUE-002**: Validate stock availability before issue.
- **FR-ISSUE-003**: Allow draft issue save and later completion.
- **FR-ISSUE-004**: Capture issuer and receiver metadata.
- **FR-ISSUE-005**: Support manual and digital signatures.
- **FR-ISSUE-006**: Generate issue receipt (PDF or HTML summary).

## 8. WhatsApp Signing

- **FR-WA-001**: Send secure signing links via WhatsApp.
- **FR-WA-002**: Links must be tokenized, single-use, and time-limited.
- **FR-WA-003**: Resend links with controlled retry policy.
- **FR-WA-004**: Record delivery, open, and signed timestamps where available.

## 9. Dashboard and Reporting

- **FR-DASH-001**: Role-based dashboards with KPI cards.
- **FR-DASH-002**: Department and date filters on reports.
- **FR-DASH-003**: Export reports to CSV and PDF.
- **FR-DASH-004**: Show outstanding signatures and overdue replacement alerts.

## 10. Audit and Compliance

- **FR-AUDIT-001**: All create/update/delete actions are auditable.
- **FR-AUDIT-002**: Signature records must be immutable after completion.
- **FR-AUDIT-003**: Keep historical stock movement ledger.
- **FR-AUDIT-004**: Retain issue records for configurable legal period.
