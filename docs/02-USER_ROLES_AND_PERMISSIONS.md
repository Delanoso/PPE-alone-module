# User Roles and Permissions

## 1) Role matrix

| Module / Action | Super Admin | H&S Manager | Stores Controller | Department Supervisor | Issuing Officer | Employee | Auditor |
|---|---|---|---|---|---|---|---|
| View dashboard | Yes | Yes | Yes | Yes | Yes | Limited | Yes |
| Manage users | Yes | Limited | No | No | No | No | No |
| Manage roles | Yes | No | No | No | No | No | No |
| Manage departments/sub-departments | Yes | Yes | No | No | No | No | No |
| Add/edit/delete people | Yes | Yes | Limited | Limited | No | No | No |
| Import people in bulk | Yes | Yes | No | No | No | No | No |
| Edit person PPE sizes | Yes | Yes | No | Limited | No | Self only (optional) | No |
| Manage PPE catalog | Yes | Yes | Yes | No | No | No | No |
| Receive/adjust stock | Yes | Yes | Yes | No | No | No | No |
| Issue PPE | Yes | Yes | Yes | Limited | Yes | No | No |
| Send WhatsApp signature links | Yes | Yes | Yes | Limited | Yes | No | No |
| View signatures | Yes | Yes | Yes | Limited | Limited | Own only | Yes |
| Export reports | Yes | Yes | Yes | Limited | Limited | No | Yes |
| View audit logs | Yes | Yes | No | No | No | No | Yes |

## 2) Permission groups

### 2.1 Identity and access

- `users:create`
- `users:update`
- `users:delete`
- `users:view`
- `roles:assign`

### 2.2 Master data

- `departments:create`
- `departments:update`
- `departments:delete`
- `people:create`
- `people:update`
- `people:delete`
- `people:import`

### 2.3 PPE and stock

- `ppe_items:create`
- `ppe_items:update`
- `ppe_items:delete`
- `stock:receive`
- `stock:adjust`
- `stock:transfer`
- `stock:view`

### 2.4 Issuing and signatures

- `issues:create`
- `issues:approve`
- `issues:cancel`
- `issues:view`
- `signatures:request`
- `signatures:view`
- `signatures:remind`

### 2.5 Reporting and compliance

- `reports:view`
- `reports:export`
- `audit:view`

## 3) Recommended access policies

1. Principle of least privilege by default.
2. Department supervisors can only view/manage people in their departments.
3. Employees may only sign and view their own issue records.
4. Deletion of critical records should be soft-delete with audit event.
5. Privileged actions require reason/comment (e.g., stock adjustment).

## 4) Approval requirements

- First issue of certain critical PPE categories may require supervisor approval.
- Backdated stock adjustments require H&S manager approval.
- Bulk deletes require Super Admin confirmation.

## 5) Segregation of duties (recommended)

1. The same user should not both approve and audit the same exception.
2. User-role changes should be reviewed periodically.
3. Emergency access should be temporary and logged.

