# Risk Register

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R1 | Incomplete people data at onboarding | High | Medium | Mandatory field validation and bulk import validation report |
| R2 | Incorrect size profile causes wrong PPE issue | High | Medium | Size profile review step and edit audit trail |
| R3 | WhatsApp delivery failures | Medium | Medium | Retry queue, alternative SMS/email channel fallback |
| R4 | Token misuse or unauthorized signing | High | Low | Single-use hashed tokens, TTL, attempt limits, audit |
| R5 | Stock inaccuracies from manual adjustments | High | Medium | Reason codes, approval workflow, weekly cycle counts |
| R6 | Poor user adoption | Medium | Medium | Training, simple UI flows, role-based onboarding |
| R7 | Performance degradation during reporting | Medium | Low | Indexed queries, caching, materialized views |
| R8 | Data loss from backup failures | High | Low | Automated backup monitoring and quarterly restore drills |
| R9 | Excessive permissions granted | High | Medium | RBAC review and quarterly access recertification |
| R10 | Legal retention non-compliance | High | Low | Configurable retention jobs and compliance audits |
