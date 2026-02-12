# Data Dictionary (Selected Fields)

## users

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| role_id | uuid | FK to roles |
| email | varchar(255) | Unique login email |
| employee_no | varchar(50) | Optional unique employee reference |
| password_hash | text | Hashed password |
| is_active | boolean | Access status |
| failed_login_attempts | integer | Lockout policy counter |
| locked_until | timestamptz | Lockout expiration |

## people

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| employee_no | varchar(50) | Unique, business identifier |
| first_name | varchar(120) | Required |
| last_name | varchar(120) | Required |
| mobile_number | varchar(30) | Required for WhatsApp flow |
| department_id | uuid | FK to departments |
| sub_department_id | uuid | FK to sub_departments |
| job_title_id | uuid | FK to job_titles |
| employment_status | varchar(20) | active/inactive/terminated |
| deleted_at | timestamptz | Soft delete marker |

## person_size_profiles

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| person_id | uuid | FK to people |
| size_type | varchar(50) | boots, gloves, overalls, etc |
| size_value | varchar(50) | value selected from dropdown |
| updated_by | uuid | FK to users |

## ppe_items

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| category_id | uuid | FK to ppe_categories |
| item_code | varchar(50) | Unique item code |
| item_name | varchar(255) | Display name |
| replacement_cycle_days | integer | Recommended replacement frequency |
| is_mandatory | boolean | Mandatory PPE flag |

## ppe_variants

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| ppe_item_id | uuid | FK to ppe_items |
| variant_code | varchar(80) | Unique SKU-like code |
| size_value | varchar(50) | Size label |
| color | varchar(50) | Optional |
| active | boolean | Active record flag |

## stock_movements

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| ppe_variant_id | uuid | FK to ppe_variants |
| location_id | uuid | FK to locations |
| movement_type | varchar(30) | receipt/issue/adjustment/return |
| quantity | numeric(12,2) | Positive for receipt/return, negative for issue |
| unit_cost | numeric(12,2) | Optional costing field |
| movement_date | timestamptz | Event date |
| reference_type | varchar(30) | issue/supplier/manual |
| reference_id | uuid | Polymorphic reference |

## issue_transactions

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| issue_no | varchar(40) | Unique business transaction number |
| person_id | uuid | Receiver |
| issued_by_user_id | uuid | Issuer |
| location_id | uuid | Issue location |
| issue_date | timestamptz | Transaction date |
| issue_status | varchar(30) | draft/pending_signature/signed/cancelled |
| signature_mode | varchar(20) | in_person/remote |
| signed_at | timestamptz | Final confirmation timestamp |

## issue_lines

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| issue_transaction_id | uuid | FK to issue_transactions |
| ppe_variant_id | uuid | FK to ppe_variants |
| quantity | numeric(12,2) | Issued quantity |
| condition_note | text | Optional note |

## signature_tokens

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| issue_transaction_id | uuid | FK to issue_transactions |
| token_hash | text | Stored hashed token |
| token_status | varchar(20) | created/sent/opened/signed/expired/revoked |
| expires_at | timestamptz | Link expiration |
| max_attempts | integer | Anti-abuse control |
| current_attempts | integer | Runtime counter |

## signature_records

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| issue_transaction_id | uuid | FK to issue_transactions |
| signature_type | varchar(20) | draw/type/consent |
| signature_payload_uri | text | Storage pointer |
| signer_name | varchar(255) | Receiver name |
| signer_mobile | varchar(30) | Confirmation phone |
| signed_at | timestamptz | Final signature time |
| ip_address | inet | Optional evidence |
| user_agent | text | Optional evidence |

## notification_logs

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| channel | varchar(20) | whatsapp/email/sms |
| recipient | varchar(120) | phone/email |
| template_code | varchar(80) | message template |
| provider_message_id | varchar(120) | external provider reference |
| status | varchar(30) | queued/sent/delivered/failed |
| payload_json | jsonb | sent payload |

## audit_logs

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| actor_user_id | uuid | Who performed action |
| action | varchar(60) | create/update/delete/login/etc |
| entity_name | varchar(80) | table/entity name |
| entity_id | uuid | affected record ID |
| before_json | jsonb | previous state |
| after_json | jsonb | new state |
| created_at | timestamptz | event timestamp |
