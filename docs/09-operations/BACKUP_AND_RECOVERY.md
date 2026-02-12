# Backup and Recovery

## Backup Scope

- PostgreSQL full backups
- Incremental WAL/point-in-time recovery logs
- Object storage for signature files and generated receipts
- Configuration snapshots (without secrets)

## Backup Schedule

- Full DB backup: daily
- WAL archival: continuous
- Signature/object storage backup: daily
- Retention:
  - daily backups kept 30 days
  - weekly backups kept 12 weeks
  - monthly backups kept 12 months

## Restore Targets

- RPO (Recovery Point Objective): <= 24 hours
- RTO (Recovery Time Objective): <= 4 hours

## Recovery Drill Procedure

1. Provision clean restore environment.
2. Restore latest full backup.
3. Replay WAL to selected point.
4. Restore object storage snapshot.
5. Verify:
   - latest users/people present
   - issue and signature consistency
   - dashboard metrics align
6. Document drill result and actions.

## Data Integrity Checks After Restore

- Count parity for `issue_transactions` and `issue_lines`
- Signed issues must have matching `signature_records`
- Stock movement aggregate must match expected balances
- Audit log chronology must be intact
