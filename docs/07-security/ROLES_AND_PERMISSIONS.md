# Roles and Permissions Matrix

## Standard Roles

1. **Super Admin**
2. **Health and Safety Manager**
3. **Storeman**
4. **Department Supervisor**
5. **HR/Admin Officer**
6. **Read-Only Auditor**

## Permission Areas

- Authentication administration
- User management
- Department/sub-department management
- People CRUD and size profile updates
- PPE catalog management
- Stock receipt and adjustment
- PPE issue creation and cancellation
- Signature link sending/resending
- Report export
- Audit log access

## Matrix

| Permission | Super Admin | H&S Manager | Storeman | Supervisor | HR/Admin | Auditor |
|---|---|---|---|---|---|---|
| Manage users | Y | N | N | N | Limited | N |
| Manage roles/permissions | Y | N | N | N | N | N |
| Manage departments/sub-departments | Y | Y | N | N | Limited | N |
| Add person | Y | Y | Y | N | Y | N |
| Edit person | Y | Y | Y | Limited | Y | N |
| Delete person (soft) | Y | Y | N | N | N | N |
| Update size profile | Y | Y | Y | Limited | Y | N |
| PPE catalog CRUD | Y | Y | Limited | N | N | N |
| Stock receipts | Y | Y | Y | N | N | N |
| Stock adjustments | Y | Y | Limited | N | N | N |
| Create issue | Y | Y | Y | Limited | N | N |
| Cancel issue | Y | Y | Limited | N | N | N |
| Send WhatsApp signature link | Y | Y | Y | Limited | N | N |
| Export reports | Y | Y | Y | Limited | Y | Y |
| View audit log | Y | Y | N | N | N | Y |

## Permission Notes

- "Limited" means restricted to assigned departments/locations.
- Delete operations are soft delete only and must always be audited.
- Signature evidence cannot be edited after completion.
- Report exports should include watermark/user metadata for traceability.
