# Security and Compliance

## 1) Security objectives

1. Protect personal data and health/safety records.
2. Ensure only authorized users can create or modify records.
3. Preserve auditability for compliance evidence.

## 2) Identity and access security

- Use salted password hashing (Argon2id or bcrypt).
- Enforce strong password policy and lockout controls.
- Support MFA for privileged users.
- Use short-lived JWT access tokens + refresh rotation.
- Implement role-based permission checks on every protected endpoint.

## 3) Data protection

- TLS 1.2+ for all client/server traffic.
- Encrypt backups and sensitive data at rest where possible.
- Avoid storing raw signature link tokens; store token hashes.
- Minimize personal data collected to required fields only.

## 4) Audit and traceability

Audit all critical actions:

- User and role changes
- Person create/update/delete
- Size profile changes
- Stock adjustments
- Issue creation/cancellation
- Signature requests and completions

Audit events must include actor, timestamp, action, entity, before/after state.

## 5) WhatsApp link security controls

1. Signed links must include secure random token.
2. Token validity should be limited (recommended 24-72 hours).
3. One-time use enforcement after successful signing.
4. Rate limit public token endpoints.
5. Add anti-automation controls (bot protection optional by risk level).

## 6) Compliance considerations

Applicable framework examples (adapt to legal jurisdiction):

- Occupational Health and Safety recordkeeping
- Data privacy laws (for example POPIA/GDPR-equivalent obligations)
- Internal retention and access control policy

## 7) Retention recommendations

- Issue and signature records: minimum 5 years (or legal requirement).
- Audit logs: minimum 2 years.
- Messaging delivery logs: 12-24 months.
- Soft-deleted people records retained for compliance window.

## 8) Operational security

- Principle of least privilege in production.
- Separate environments (dev/test/prod).
- Daily backups with restore testing.
- Vulnerability scans and dependency updates.
- Monitoring and alerting for auth anomalies and failed message delivery spikes.

## 9) Incident response

1. Detect and classify incident severity.
2. Contain affected components.
3. Preserve logs and evidence.
4. Notify internal stakeholders and legal/compliance contacts.
5. Perform post-incident review and corrective actions.

