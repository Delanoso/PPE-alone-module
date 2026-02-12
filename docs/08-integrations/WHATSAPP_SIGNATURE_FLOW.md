# WhatsApp Signature Flow

## Purpose

Allow off-site workers (for example drivers on route) to acknowledge issued PPE through a secure WhatsApp link.

## End-to-End Flow

1. Issuer creates issue transaction with `signature_mode = remote`.
2. API generates a secure token and stores **token hash** in `signature_tokens`.
3. API creates a short-lived signing URL:
   - `https://app.hfr.example/sign/<raw-token>`
4. Notification worker sends templated WhatsApp message.
5. Worker opens link and sees issue preview.
6. Worker signs and confirms.
7. API validates token and persists signature record.
8. Issue status updates to `signed`.
9. Audit and notification log entries are created.

## Security Controls

- Signed URL TTL default: 72 hours
- Single-use token
- Attempt limit per token
- Token revocation on issue cancellation
- Optional OTP step (future enhancement)

## Failure Handling

- Message send failure -> retry queue with backoff.
- Expired token -> show expiry screen and prompt contact issuer.
- Already used token -> show already signed screen.
- Invalid token -> generic invalid link screen.

## Webhook Events (Provider Dependent)

- `message_queued`
- `message_sent`
- `message_delivered`
- `message_failed`
- `message_read` (if supported)

These events are mapped into `notification_logs`.

## Suggested Retry Policy

- Attempt 1: immediate
- Attempt 2: +5 min
- Attempt 3: +15 min
- Attempt 4: +60 min
- Mark failed if all retries exhausted

## Privacy Notes

- Avoid including full PPE details in message body.
- The WhatsApp message should only contain short context and secure link.
