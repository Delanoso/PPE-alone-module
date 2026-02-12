# Complete Repository File Tree

```text
.
|-- .env.example
|-- README.md
|-- apps
|   |-- api
|   |   `-- README.md
|   `-- web
|       `-- README.md
|-- architecture
|   `-- decision-records
|       `-- README.md
|-- database
|   |-- schema.sql
|   `-- seeds
|       |-- 001_hfr_seed.sql
|       `-- 002_dropdown_seed.sql
|-- docs
|   |-- FILE_TREE.md
|   |-- 01-product
|   |   |-- FUNCTIONAL_REQUIREMENTS.md
|   |   |-- PROCESS_WORKFLOWS.md
|   |   |-- PROJECT_CHARTER.md
|   |   `-- USER_STORIES.md
|   |-- 02-business
|   |   `-- HFR_ORG_STRUCTURE.md
|   |-- 03-architecture
|   |   |-- DOMAIN_MODEL.md
|   |   `-- SYSTEM_ARCHITECTURE.md
|   |-- 04-data
|   |   |-- DATA_DICTIONARY.md
|   |   `-- DATABASE_SCHEMA.md
|   |-- 05-api
|   |   |-- API_NOTES.md
|   |   `-- openapi.yaml
|   |-- 06-ux
|   |   |-- DROPDOWN_CATALOG.md
|   |   `-- SCREEN_SPECIFICATION.md
|   |-- 07-security
|   |   |-- ROLES_AND_PERMISSIONS.md
|   |   `-- SECURITY_COMPLIANCE.md
|   |-- 08-integrations
|   |   |-- MESSAGE_TEMPLATES.md
|   |   `-- WHATSAPP_SIGNATURE_FLOW.md
|   |-- 09-operations
|   |   |-- BACKUP_AND_RECOVERY.md
|   |   `-- DEPLOYMENT_RUNBOOK.md
|   |-- 10-quality
|   |   |-- TEST_PLAN.md
|   |   `-- UAT_CHECKLIST.md
|   `-- 11-project
|       |-- IMPLEMENTATION_ROADMAP.md
|       `-- RISK_REGISTER.md
|-- infra
|   `-- README.md
`-- packages
    `-- shared
        `-- README.md
```

## Purpose of This Structure

- **apps/**: implementation placeholders for API and web app.
- **database/**: executable SQL schema and seed data.
- **docs/**: complete requirements, architecture, operations, and QA documents.
- **architecture/decision-records/**: place to track architecture decisions (ADR style).
- **infra/**: infrastructure provisioning notes (cloud, network, CI/CD).
- **packages/shared/**: shared DTOs, constants, validation schemas.

## Usage

1. Start with `docs/01-product/PROJECT_CHARTER.md`.
2. Follow `docs/03-architecture/SYSTEM_ARCHITECTURE.md`.
3. Build schema from `database/schema.sql`.
4. Load seeds in `database/seeds/`.
5. Implement APIs using `docs/05-api/openapi.yaml`.
6. Build UI pages from `docs/06-ux/SCREEN_SPECIFICATION.md`.
