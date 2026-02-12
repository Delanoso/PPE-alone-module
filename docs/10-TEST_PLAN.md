# Test Plan - PPE Issue System

## 1) Test strategy

Use a layered strategy:

1. Unit tests for domain logic
2. Integration tests for API + database
3. End-to-end tests for key workflows
4. Security and permission tests
5. UAT scenario validation with H&S stakeholders

## 2) Core test suites

### 2.1 Authentication and authorization

- User can login with valid credentials.
- Login fails with invalid credentials.
- Locked account cannot authenticate.
- Role-based endpoint restrictions enforced.

### 2.2 People management

- Add person with valid department/sub-department succeeds.
- Duplicate employee number is rejected.
- Edit person details and sizes succeeds.
- Delete person marks record inactive/soft-deleted.
- Bulk import validates bad rows and imports good rows.

### 2.3 Dropdown and master data consistency

- Department dropdown loads active entries only.
- Sub-department dropdown filters by department.
- Size dropdown values persist and validate.

### 2.4 PPE and stock

- Receive stock increases on-hand quantities.
- Adjust decrease cannot drop below zero without override.
- Transfer stock updates source and destination balances.
- Stock movement entries are always created.

### 2.5 Issuing workflow

- Issue with one line and valid stock succeeds.
- Multi-line issue saves all items.
- Issue fails when stock unavailable.
- Issue status transitions to pending signature.

### 2.6 WhatsApp signature flow

- Signature link created with expiry.
- Message event status stored (sent/delivered/failed).
- Valid token opens signing page.
- Expired token is rejected.
- Successful signature updates issue status to acknowledged.
- Token cannot be reused after signing.

### 2.7 Reporting

- Date filters produce correct totals.
- Department/sub-department breakdown accuracy.
- Signed vs unsigned counts correct.
- Export files generated and readable.

### 2.8 Audit

- All mutation actions write audit records.
- Audit includes actor, action, entity, timestamp.

## 3) Non-functional testing

### 3.1 Performance

- 95th percentile response time under 2 seconds for main list endpoints.
- Dashboard loads within target under expected concurrent usage.

### 3.2 Security

- SQL injection and XSS checks.
- JWT tampering rejection.
- Access control bypass attempts blocked.
- Rate limiting on public signing endpoint validated.

### 3.3 Reliability

- Retry behavior for failed WhatsApp sends.
- Database backup and restore dry run.

## 4) UAT scenarios (minimum)

1. Create department and sub-department hierarchy.
2. Add employee with full size profile.
3. Load initial stock.
4. Issue PPE and send WhatsApp link.
5. Employee signs on mobile.
6. Supervisor verifies signed record and report export.

## 5) Exit criteria

- No open critical defects.
- All priority-1 workflows pass.
- Security acceptance checks pass.
- Stakeholder sign-off from H&S and operations.

