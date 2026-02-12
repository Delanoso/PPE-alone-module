## HFR Schafer Vervoer - PPE Issue Management System

This repository contains a **complete planning and specification pack** for a PPE (Personal Protective Equipment) issue system focused on health and safety operations for:

- Refrigerated truck operations
- Tautliner operations
- Truck workshop
- Trailer workshop
- Fiberglass division
- Admin office

The company context is **HFR Schafer Vervoer**.

---

## Objective

Design a full PPE platform from:

1. User registration and login
2. Role-based dashboard access
3. PPE stock capture and control
4. Employee master list with departments and sub-departments
5. PPE issuing workflow
6. Online signature collection through WhatsApp links
7. Full database persistence and audit trails

---

## Repository scope

This repository currently provides:

- Complete file tree definition
- Product and functional requirements
- Roles and permissions
- UI and form behavior specifications
- Dropdown master-data options (with expanded choices)
- Database SQL schema
- API documentation and OpenAPI contract
- Security and compliance notes
- Test plan and implementation roadmap
- Technical scaffold placeholders for API, web app, database, and infrastructure

---

## Documentation index

All core documentation is in `docs/`:

- `00-PROJECT_FILE_TREE.md`
- `01-PRODUCT_REQUIREMENTS.md`
- `02-USER_ROLES_AND_PERMISSIONS.md`
- `03-UI_FORMS_AND_DASHBOARD_SPEC.md`
- `04-WORKFLOWS_ISSUING_AND_WHATSAPP_SIGNATURE.md`
- `05-MASTER_DROPDOWN_OPTIONS.md`
- `06-DATABASE_SCHEMA.sql`
- `07-API_SPECIFICATION.md`
- `08-openapi.yaml`
- `09-SECURITY_AND_COMPLIANCE.md`
- `10-TEST_PLAN.md`
- `11-IMPLEMENTATION_ROADMAP.md`

---

## High-level architecture

- **Web App (Frontend):** User-facing admin and issuing interface
- **API Service (Backend):** Auth, business logic, stock handling, issuing, signatures
- **Database:** Relational data store for users, people, stock, transactions, signatures
- **Messaging Integration:** WhatsApp provider for secure signing links
- **Audit & Reports:** Immutable event log and health/safety reporting

---

## Next step (implementation)

Use the provided specs as build-ready guidance to implement:

- Backend service (`apps/api`)
- Frontend application (`apps/web`)
- Migration and seed scripts (`database`)
- Deployment assets (`infra`)

