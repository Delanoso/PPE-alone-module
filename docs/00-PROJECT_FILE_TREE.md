# Project File Tree - HFR Schafer Vervoer PPE Issue System

This is the complete recommended file tree for implementation.

```text
/workspace
├── .github/
│   └── workflows/
│       └── blank.yml
├── README.md
├── docs/
│   ├── 00-PROJECT_FILE_TREE.md
│   ├── 01-PRODUCT_REQUIREMENTS.md
│   ├── 02-USER_ROLES_AND_PERMISSIONS.md
│   ├── 03-UI_FORMS_AND_DASHBOARD_SPEC.md
│   ├── 04-WORKFLOWS_ISSUING_AND_WHATSAPP_SIGNATURE.md
│   ├── 05-MASTER_DROPDOWN_OPTIONS.md
│   ├── 06-DATABASE_SCHEMA.sql
│   ├── 07-API_SPECIFICATION.md
│   ├── 08-openapi.yaml
│   ├── 09-SECURITY_AND_COMPLIANCE.md
│   ├── 10-TEST_PLAN.md
│   └── 11-IMPLEMENTATION_ROADMAP.md
├── apps/
│   ├── api/
│   │   ├── README.md
│   │   └── src/
│   │       ├── README.md
│   │       ├── modules/
│   │       │   └── README.md
│   │       ├── routes/
│   │       │   └── README.md
│   │       ├── services/
│   │       │   └── README.md
│   │       └── jobs/
│   │           └── README.md
│   └── web/
│       ├── README.md
│       └── src/
│           ├── README.md
│           ├── pages/
│           │   └── README.md
│           ├── components/
│           │   └── README.md
│           ├── modules/
│           │   └── README.md
│           └── services/
│               └── README.md
├── database/
│   ├── README.md
│   ├── migrations/
│   │   └── README.md
│   ├── seeds/
│   │   └── README.md
│   └── scripts/
│       └── README.md
└── infra/
    ├── README.md
    ├── docker/
    │   └── README.md
    └── monitoring/
        └── README.md
```

## Notes

1. The tree includes both specification documents and scaffold folders for implementation.
2. Additional code files should be created under `apps/api/src` and `apps/web/src` following module boundaries described in the documentation set.
3. `database/migrations` and `database/seeds` should align with `docs/06-DATABASE_SCHEMA.sql`.
4. WhatsApp integration should be implemented as an adapter service under `apps/api/src/services`.

