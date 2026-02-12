# Workflows - PPE Issuing and WhatsApp Signature

## 1) End-to-end workflow overview

1. Admin creates departments and sub-departments.
2. Admin adds people and captures PPE sizes.
3. Stores controller maintains PPE stock.
4. Issuing officer creates PPE issue transaction.
5. System sends WhatsApp signature link to employee.
6. Employee signs online from mobile device.
7. Signature and issue records are stored for compliance.

## 2) Employee onboarding workflow

1. Open People page.
2. Click **Add Person**.
3. Enter personal details and department/sub-department.
4. Capture size profile in dropdowns.
5. Save person record.
6. Optional: send welcome message with portal access.

Business rules:

- Employee number must be unique.
- Department and sub-department must exist.
- Mobile number required for WhatsApp link delivery.

## 3) PPE issue workflow

1. Open Issuing page.
2. Select employee.
3. System retrieves:
   - Latest size profile
   - Past issue history
   - Outstanding return/replacement flags (if configured)
4. Add one or more line items.
5. Validate stock.
6. Save issue with generated issue number.
7. Deduct stock quantities.
8. Trigger signature request flow.

## 4) WhatsApp signature request workflow

1. System creates signature request record with status `PENDING`.
2. System generates secure tokenized URL:
   - One-time use token
   - Expiry timestamp (e.g., 48 hours)
   - Bound to issue record and employee identity
3. System sends WhatsApp message template:
   - Greeting and company name
   - Issue summary
   - Secure signing link
4. Delivery status stored: `QUEUED`, `SENT`, `DELIVERED`, `FAILED`.

## 5) Online signature capture workflow

1. Employee opens link.
2. System validates token:
   - Exists
   - Not expired
   - Not already completed
3. Employee views issue details and acknowledgement text.
4. Employee signs (drawn signature or typed signature).
5. Employee submits.
6. System stores:
   - Signature artifact
   - Timestamp
   - Device/IP metadata
   - Consent confirmation
7. Signature request status moves to `SIGNED`.
8. Issue record status updates to `ACKNOWLEDGED`.

## 6) Reminder and escalation workflow

1. Scheduler identifies pending requests nearing expiry.
2. Reminder messages sent at configurable intervals.
3. Escalation notifications sent to supervisor/H&S if overdue.
4. Expired requests can be reissued with a new token.

## 7) Exception workflows

### 7.1 Stock unavailable

- Block issuance, show alternatives, or allow pending issue (policy-based).

### 7.2 Employee has no mobile/WhatsApp

- Capture manual signature on-site and upload evidence.

### 7.3 Token expired

- Show expiry page and allow authorized user to resend new link.

### 7.4 Message delivery failure

- Retry with backoff and surface error in signature queue.

## 8) Audit events (minimum)

- Person created/updated/deleted
- Size profile changed
- PPE stock received/adjusted/transferred
- Issue created/edited/cancelled
- Signature link sent/reminded/expired
- Signature completed

## 9) Suggested WhatsApp message template

```text
HFR Schafer Vervoer:
Hello {{employee_name}}, PPE issue {{issue_number}} is ready for acknowledgement.
Please sign securely here: {{secure_link}}
This link expires on {{expiry_datetime}}.
```

