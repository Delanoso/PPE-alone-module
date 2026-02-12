# Database Schema Design (PostgreSQL)

## Goals

- Strong referential integrity
- Full transaction and audit traceability
- Flexible dropdown and size modeling
- Fast reporting by date, status, and department

## Core Schema Domains

1. **Identity and Access**
   - `roles`, `permissions`, `role_permissions`
   - `users`, `refresh_tokens`

2. **Organization and People**
   - `departments`, `sub_departments`, `job_titles`
   - `people`, `person_size_profiles`

3. **PPE Master and Inventory**
   - `ppe_categories`, `ppe_items`, `ppe_variants`
   - `locations`, `suppliers`, `stock_movements`

4. **Issue and Signature**
   - `issue_transactions`, `issue_lines`
   - `signature_tokens`, `signature_records`
   - `notification_logs`

5. **Compliance**
   - `audit_logs`

## Key Modeling Decisions

- **Soft delete** for people and users using `deleted_at`.
- **Immutable stock ledger** in `stock_movements`; on-hand is derived by aggregation.
- **Single-use signature tokens** with expiration and status transitions.
- **Generic size profile** (`person_size_profiles`) to support many PPE size types.
- **Department and sub-department normalization** for consistent reporting.

## Performance Considerations

- Composite indexes:
  - `(department_id, sub_department_id)` on people
  - `(status, issue_date)` on issue transactions
  - `(ppe_variant_id, movement_date)` on stock movements
- Time-based indexes for signatures and notifications.
- Optional materialized views for heavy dashboard queries.

## Data Retention

- Issue and signature records: default 7 years.
- Audit logs: default 7 years (or legal policy).
- Notification logs: 12-24 months, configurable.

## Migration Strategy

1. Create schema objects and enums.
2. Load master records (roles, departments, size options, PPE categories).
3. Load users and people.
4. Enable production writes.
5. Schedule recurring backups and retention jobs.
