# Message Templates

## Template: PPE_SIGNATURE_LINK_V1

**Channel:** WhatsApp  
**Use case:** Send initial signing link for remote PPE issue acknowledgement.

```text
Hello {{first_name}},

HFR Schafer Vervoer has issued PPE for you.
Please review and sign your PPE receipt using this secure link:
{{signing_link}}

This link expires on {{expiry_date_time}}.
If you need help, contact {{issuer_name}}.
```

## Template: PPE_SIGNATURE_REMINDER_V1

**Channel:** WhatsApp  
**Use case:** Reminder when signature is pending.

```text
Reminder: your PPE receipt is still pending signature.
Please sign here: {{signing_link}}

Expiry: {{expiry_date_time}}
HFR Schafer Vervoer - Health and Safety
```

## Template: PPE_SIGNATURE_SUCCESS_V1

**Channel:** WhatsApp (optional)  
**Use case:** Confirmation after successful signing.

```text
Thank you, {{first_name}}.
Your PPE receipt was successfully signed on {{signed_date_time}}.
```

## Template Variables

- `first_name`
- `issuer_name`
- `signing_link`
- `expiry_date_time`
- `signed_date_time`

## Template Rules

- Do not include sensitive personal identifiers.
- Keep message concise and action-oriented.
- Ensure timezone-aware date formatting.
- Include support contact path for unresolved cases.
