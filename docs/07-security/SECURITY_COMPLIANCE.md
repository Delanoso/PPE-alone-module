# Security and Compliance Controls

## 1. Identity and Access Security

- Strong password policy (minimum length, complexity, history).
- Optional MFA for privileged roles.
- Account lockout after repeated failed login attempts.
- Session idle timeout and forced re-authentication.

## 2. Data Protection

- Encrypt all traffic in transit with TLS 1.2+.
- Encrypt sensitive data at rest where possible.
- Hash all passwords using modern algorithms (Argon2id or bcrypt).
- Store signature links as hashed tokens, not plain values.

## 3. Signature Evidence Integrity

- Single-use token model.
- Expiry and attempt limits.
- Record signer metadata:
  - timestamp
  - IP address
  - user agent
  - mobile number
- Lock signed records from edits.

## 4. Audit and Traceability

- Audit all privileged events and data writes.
- Preserve before/after payloads for critical entity changes.
- Track:
  - person creation/edit/delete
  - size profile changes
  - issue creation/cancellation
  - signature link sends/resends
  - stock adjustments

## 5. Privacy and Retention

- Minimize personal data to operational needs.
- Define legal retention period (default 7 years for issue records).
- Provide secure archival and deletion workflow after retention expiry.
- Restrict exports containing personal data.

## 6. Operational Security

- Daily backups and tested restore procedure.
- Separate production and non-production environments.
- Secrets in secure vault, never in source control.
- Incident response runbook with breach notification procedure.

## 7. Compliance Checklist (Minimum)

- [ ] RBAC implemented and verified
- [ ] Audit logs immutable and queryable
- [ ] Signature evidence stored and reportable
- [ ] Backup/restore tested and documented
- [ ] Vulnerability patching schedule active
- [ ] Access review conducted quarterly
