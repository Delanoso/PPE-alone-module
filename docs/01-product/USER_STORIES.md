# User Stories and Acceptance Criteria

## Epic A: Authentication

### US-A1 - Login
As a registered user, I want to log in securely so that I can access my dashboard.

**Acceptance Criteria**
- Valid credentials grant access.
- Invalid credentials show safe error message.
- Locked account cannot log in until lockout period ends or admin unlocks.

### US-A2 - Password Reset
As a user, I want to reset my password so I can recover access.

**Acceptance Criteria**
- Reset link expires after configured TTL.
- Old token is invalidated when a new reset is requested.

## Epic B: People and Structure

### US-B1 - Add Person
As an admin or safety officer, I want to add a worker so they can receive PPE.

**Acceptance Criteria**
- Required fields: employee number, full name, mobile number, department, sub-department.
- Duplicate employee numbers are blocked.

### US-B2 - Edit Person and Sizes
As an authorized user, I want to update PPE sizes so issues can be accurate.

**Acceptance Criteria**
- Size fields are editable at any time.
- Changes are logged in audit history.

### US-B3 - Delete Person
As an admin, I want to delete a person when they leave the company.

**Acceptance Criteria**
- Delete is soft delete.
- Historic issue records remain visible and linked.

## Epic C: PPE Stock

### US-C1 - Record Stock Receipt
As a storeman, I want to capture incoming stock so quantities are correct.

**Acceptance Criteria**
- Receipt includes supplier reference.
- On-hand quantity updates immediately after confirmation.

### US-C2 - Low Stock Alert
As a safety manager, I want alerts for low PPE stock so shortages are prevented.

**Acceptance Criteria**
- Alerts trigger when available quantity is below threshold.
- Dashboard highlights affected items.

## Epic D: PPE Issuance and Signature

### US-D1 - Issue PPE In Person
As a storeman, I want to issue PPE with immediate signature collection.

**Acceptance Criteria**
- Cannot issue more than available quantity.
- Signature capture completes transaction status as `signed`.

### US-D2 - Issue PPE Remotely
As a safety officer, I want to send a signing link through WhatsApp when workers are off-site.

**Acceptance Criteria**
- Unique secure link is generated per issue.
- Link expires after configured time window.
- Signed confirmation updates issue status to `signed`.

### US-D3 - Resend Signing Link
As an issuer, I want to resend the link if worker did not sign.

**Acceptance Criteria**
- System enforces resend attempt limits.
- Audit log records each resend event.

## Epic E: Reporting and Oversight

### US-E1 - View Dashboard
As management, I want a summary of issued PPE and pending signatures.

**Acceptance Criteria**
- Dashboard shows counts by department and status.
- Date and department filters apply consistently.

### US-E2 - Export Compliance Report
As a safety officer, I want exportable proof for audits.

**Acceptance Criteria**
- Export includes signed timestamp and issuing user.
- Export format supports CSV and PDF.
