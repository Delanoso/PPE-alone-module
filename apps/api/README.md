# HFR PPE API

Production-style backend API for the PPE issue system.

## Stack

- Fastify + TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Zod validation

## Main Feature Routes

- `/api/v1/auth`
- `/api/v1/departments`
- `/api/v1/people`
- `/api/v1/ppe`
- `/api/v1/stock`
- `/api/v1/issues`
- `/api/v1/sign/:token/*` (public signature flow)

## Local Run

1. Copy root `.env.example` to `.env`.
2. Set `DATABASE_URL`.
3. Run migrations and seed:
   - `npm run prisma:migrate -w @hfr/ppe-api`
   - `npm run prisma:seed -w @hfr/ppe-api`
4. Start API:
   - `npm run dev -w @hfr/ppe-api`
