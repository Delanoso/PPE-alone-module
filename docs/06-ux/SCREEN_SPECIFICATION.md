# Screen Specification

## Design Principles

- Fast data entry for store/safety teams
- Clear compliance states and pending actions
- Consistent dropdown controls
- Mobile-friendly for field operations

## 1. Authentication Screens

### Login
- Fields: username/email, password
- Actions: `Login`, `Forgot Password`
- State handling: invalid credentials, locked account, inactive account

### Reset Password
- Fields: new password, confirm password
- Actions: `Save New Password`

## 2. Dashboard

### Role-Based Widgets
- Total active workers
- PPE issues this month
- Pending signatures
- Low-stock items
- Overdue replacements

### Filters
- Date range
- Department
- Sub-department
- Location

## 3. People Module

### People List Screen
- Table columns:
  - Employee No
  - Full Name
  - Department
  - Sub-department
  - Mobile
  - Status
  - Last Issue Date
  - Actions
- Row action buttons:
  - `View`
  - `Edit`
  - `Update Sizes`
  - `Delete`
- Primary actions:
  - `Add Person`
  - `Import CSV`
  - `Export`

### Person Form
- Identity section
- Employment section
- Contact section
- PPE Size Profile section (editable dropdowns)
- Actions:
  - `Save`
  - `Save and Add Another`
  - `Cancel`

## 4. PPE Catalog

### PPE Items Screen
- Add/Edit PPE item
- Add/Edit size variants
- Activate/Deactivate variants

### PPE Variant Form
- Variant code
- Size value
- Color
- Replacement cycle
- Min stock threshold

## 5. Stock Module

### Stock Movement List
- Movement date
- Type
- Item variant
- Location
- Quantity
- Balance after movement

### Stock Receipt Form
- Supplier
- Reference number
- Item lines
- Action: `Post Receipt`

### Stock Adjustment Form
- Reason code
- Approval note
- Action: `Post Adjustment`

## 6. Issue Module

### Issue Creation Screen
- Select person
- Auto-load size profile
- Add PPE lines with quantity and suggested variants
- Signature mode dropdown:
  - In person
  - Remote via WhatsApp
- Actions:
  - `Save Draft`
  - `Issue Now`

### Issue Detail Screen
- Header status timeline
- Issued line items
- Signature evidence
- Actions:
  - `Send Signature Link`
  - `Resend Link`
  - `Download Receipt`
  - `Cancel Issue` (role-restricted)

## 7. Public Signature Screen (Link)

- Displays issue summary and PPE lines
- Signer details capture
- Signature canvas/consent checkbox
- Actions:
  - `Sign and Confirm`
- Outcome screens:
  - Success
  - Expired link
  - Already signed

## 8. Admin Screens

- Users and roles
- Departments and sub-departments
- Dropdown options management
- Audit log viewer
- Notification logs
