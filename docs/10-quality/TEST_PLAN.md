# Test Plan

## Test Objectives

- Verify all critical PPE lifecycle flows.
- Ensure data integrity for stock and issue records.
- Confirm security, permissions, and audit behavior.
- Validate WhatsApp signature journey.

## Test Types

1. Unit tests
2. Integration tests
3. API contract tests
4. End-to-end UI tests
5. Security tests
6. Performance smoke tests

## Core Test Scenarios

### Authentication
- Successful login/logout
- Failed login and lockout
- Password reset token expiry

### People Management
- Add person with valid data
- Reject duplicate employee number
- Edit person and size profile
- Soft delete person and confirm history remains

### Department and Sub-Department
- Filter people by department
- Validate dropdown dependency on selected department

### PPE and Stock
- Add PPE items and variants
- Post stock receipt and verify available quantity
- Post adjustment with reason code and audit trail

### Issue and Signature
- Create issue with sufficient stock
- Reject issue with insufficient stock
- In-person signature completion
- Remote WhatsApp link send and signature completion
- Expired token handling
- Resend token behavior and limits

### Reporting
- Dashboard metrics for pending signatures
- Compliance export (CSV/PDF)

### Security and Permissions
- RBAC enforcement for restricted actions
- Audit log entries created for CRUD actions

## Exit Criteria

- All P0/P1 scenarios pass
- No unresolved critical security defects
- No unresolved stock integrity defects
- UAT sign-off by Health and Safety owner
