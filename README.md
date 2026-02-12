# HFR Schafer Vervoer - PPE Issue Management System

This repository contains the complete planning and technical documentation for a health-and-safety PPE issue system tailored for **HFR Schafer Vervoer**.

The system scope includes:

- User registration and login
- Role-based dashboards
- PPE stock management (quantities, sizes, reorder tracking)
- People management with department and sub-department
- PPE issue workflow with online signature
- WhatsApp link delivery for remote signing
- Full audit trail and database persistence

## Repository Goals

1. Provide a complete document package for implementation.
2. Define backend, frontend, data, and operational requirements.
3. Provide practical seed data for organizational structure and dropdowns.
4. Ensure the system supports real health-and-safety operations in transport and workshop environments.

## Company Context Covered

The documentation includes structure and workflows for:

- Refrigerated truck operations
- Tautliner operations
- Truck workshop
- Trailer workshop
- Fiberglass division
- Admin office

## Main Documentation Entry Points

- `docs/FILE_TREE.md` - complete repository tree with purpose of each file
- `docs/01-product/` - business scope, requirements, user stories, process maps
- `docs/02-business/` - HFR organizational model
- `docs/03-architecture/` - system and domain architecture
- `docs/04-data/` - schema design and data dictionary
- `docs/05-api/` - OpenAPI spec and API notes
- `docs/06-ux/` - screen specification and dropdown catalog
- `docs/07-security/` - permissions and compliance controls
- `docs/08-integrations/` - WhatsApp signature integration flow
- `docs/09-operations/` - deployment and backup runbooks
- `docs/10-quality/` - test and UAT documents
- `docs/11-project/` - roadmap and risks
- `database/` - executable SQL schema and seed scripts

## Status

This repository now includes:

- Full implementation-ready blueprint and documentation
- Functional backend API scaffold (Fastify + Prisma + JWT)
- Functional responsive frontend scaffold (React + MUI + Query)
- Database schema and seed scripts

The platform is structured for near-term launch and iterative hardening.
