# API Notes

## Versioning

- Base path: `/api/v1`
- Version in URL for backward-compatible evolution.

## Auth Strategy

- `POST /auth/login` returns access + refresh tokens.
- Access token in `Authorization: Bearer <token>`.
- Refresh token rotation through `POST /auth/refresh`.

## Common Response Envelope

```json
{
  "success": true,
  "message": "optional",
  "data": {},
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 130
  }
}
```

## Key Endpoint Groups

- Auth: login, refresh, logout, forgot/reset password
- Users and permissions
- Departments and sub-departments
- People and size profiles
- PPE catalog and variants
- Stock movements and balances
- Issue transactions and lines
- Signature links and completion endpoints
- Dashboard and reporting exports

## Business Rule Highlights

- People delete is soft delete only.
- Stock cannot go negative on confirmed issues.
- Signature links are single-use and expire.
- Issue transaction status changes must be valid transitions.
- Every write endpoint creates audit logs.

## Error Codes (Examples)

- `AUTH_001` invalid credentials
- `AUTH_002` account locked
- `PEOPLE_001` duplicate employee number
- `STOCK_001` insufficient available quantity
- `SIGN_001` token expired
- `SIGN_002` token already used
- `PERM_001` insufficient permission
