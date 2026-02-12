# API Specification (Human-readable)

Base URL (example): `/api/v1`

Authentication: JWT bearer token for protected endpoints.  
Authorization: Role and permission checks on server side.

## 1) Auth endpoints

### POST `/auth/register`

Create user account (direct or invite flow).

### POST `/auth/login`

Authenticate and return access token and refresh token.

### POST `/auth/refresh`

Rotate and return a new access token.

### POST `/auth/logout`

Revoke refresh/session token.

### POST `/auth/forgot-password`

Trigger reset flow.

### POST `/auth/reset-password`

Set new password with reset token.

## 2) User and role endpoints

- GET `/users`
- POST `/users`
- GET `/users/{id}`
- PATCH `/users/{id}`
- DELETE `/users/{id}`
- POST `/users/{id}/roles`
- DELETE `/users/{id}/roles/{roleId}`

## 3) Department endpoints

- GET `/departments`
- POST `/departments`
- PATCH `/departments/{id}`
- DELETE `/departments/{id}`
- GET `/departments/{id}/sub-departments`
- POST `/departments/{id}/sub-departments`
- PATCH `/sub-departments/{id}`
- DELETE `/sub-departments/{id}`

## 4) People endpoints

- GET `/people`
- POST `/people`
- GET `/people/{id}`
- PATCH `/people/{id}`
- DELETE `/people/{id}`
- POST `/people/import`
- PATCH `/people/{id}/sizes`
- GET `/people/{id}/issues`

## 5) PPE catalog endpoints

- GET `/ppe/items`
- POST `/ppe/items`
- GET `/ppe/items/{id}`
- PATCH `/ppe/items/{id}`
- DELETE `/ppe/items/{id}`
- GET `/ppe/categories`
- POST `/ppe/categories`

## 6) Stock endpoints

- GET `/stock/balances`
- POST `/stock/receive`
- POST `/stock/adjust`
- POST `/stock/transfer`
- GET `/stock/movements`

## 7) Issue endpoints

- GET `/issues`
- POST `/issues`
- GET `/issues/{id}`
- PATCH `/issues/{id}`
- POST `/issues/{id}/send-signature-link`
- POST `/issues/{id}/cancel`

## 8) Signature endpoints

- GET `/signatures/requests`
- GET `/signatures/requests/{id}`
- POST `/signatures/requests/{id}/resend`
- GET `/sign/public/{token}`
- POST `/sign/public/{token}`

## 9) Report endpoints

- GET `/reports/issues`
- GET `/reports/stock`
- GET `/reports/signatures`
- GET `/reports/people-sizes`

## 10) Audit endpoints

- GET `/audit/logs`
- GET `/audit/logs/{entityType}/{entityId}`

## 11) API response standards

### Success

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": []
  }
}
```

## 12) Validation and business rules

1. Stock cannot go below zero unless override permission is enabled.
2. Only active employees can receive PPE issues.
3. Issue items requiring size must include a valid size.
4. Signature token must be valid, unused, and not expired.
5. Delete endpoints should soft-delete records where compliance requires retention.

