# Deployment Runbook

## Environments

- **dev**: development and integration testing
- **staging**: pre-production validation
- **prod**: live operations

## Core Services

- Web frontend
- API backend
- Background worker (notifications, retries)
- PostgreSQL database
- Object storage for signature artifacts

## Deployment Steps (High Level)

1. Build and tag release artifacts.
2. Run DB migrations on target environment.
3. Deploy API and worker.
4. Deploy web app.
5. Run smoke tests:
   - login
   - people CRUD
   - stock receipt
   - issue + signature link
6. Monitor logs and metrics for 30 minutes.
7. Confirm successful deployment and notify stakeholders.

## Rollback Strategy

- Keep previous release artifact available.
- Blue/green or rolling rollback to previous stable image.
- Database rollback policy:
  - backward-compatible migrations preferred
  - avoid destructive migrations without backup snapshot

## Runtime Monitoring

- API health endpoint and uptime check
- Error rate and latency dashboards
- Queue depth for notification worker
- Failed message send rate
- Database connection and slow query metrics

## Operational Alerts

- API uptime below threshold
- Spike in 5xx errors
- Queue retry exhaustion
- Backup job failure
- High failed login attempts
