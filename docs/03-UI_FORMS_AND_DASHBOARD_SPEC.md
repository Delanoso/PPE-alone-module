# UI, Forms, and Dashboard Specification

## 1) Design principles

1. Keep workflows short for warehouse and workshop staff.
2. Use dropdowns wherever value consistency matters.
3. Provide explicit **Add**, **Edit**, **Delete**, and **Save** actions.
4. Support desktop and mobile responsive layouts.

## 2) Primary navigation

- Dashboard
- People
- Departments
- PPE Catalog
- Stock
- Issuing
- Signatures
- Reports
- Settings

## 3) Page specifications

### 3.1 Login page

Fields:

- Username/email/mobile
- Password

Actions:

- Log In
- Forgot Password
- Request Access (optional)

Validation:

- Required fields
- Lock account after configurable failed attempts

### 3.2 Registration / invite acceptance

Fields:

- First name
- Last name
- Mobile number
- Email (optional based on policy)
- Password + confirm password

Actions:

- Register
- Cancel

### 3.3 Dashboard page

Widgets/cards:

- Total active employees
- Total PPE items in stock
- Low stock alerts
- Pending signatures
- Issues today
- Issues by department chart
- Recent stock adjustments

Filters:

- Date range
- Department
- Location/site

### 3.4 People list page

Table columns:

- Employee number
- Full name
- Department
- Sub-department
- Job title
- PPE profile summary
- Status
- Actions

Top actions:

- **Add Person**
- **Import People**
- Export

Row actions:

- View
- Edit
- Delete
- Deactivate/Activate

Search and filters:

- Name / employee number search
- Department dropdown
- Sub-department dropdown (dependent)
- Status dropdown

### 3.5 Add/Edit person page

Sections:

1. Personal details
2. Department assignment
3. PPE size profile
4. Contact and communication

Required fields:

- Employee number
- Full name
- Department
- Sub-department
- Mobile number

PPE size profile fields (editable at any time):

- Overall clothing size
- Jacket size
- Trousers size
- Shoe size
- Glove size
- Coverall size
- Helmet size
- Reflective vest size
- Rain suit size

Buttons:

- **Save**
- **Save and Add Another**
- **Delete**
- **Cancel**

### 3.6 Departments page

Features:

- Add department
- Add sub-department
- Edit / deactivate / delete
- Sort display order

Validation:

- Department names unique
- Sub-department unique per department

### 3.7 PPE catalog page

Fields:

- Item code
- Item name
- Category
- Size required (yes/no)
- Available sizes
- Min stock threshold
- Reorder level
- Active status

Actions:

- Add item
- Edit item
- Retire item

### 3.8 Stock page

Tabs:

- Current stock
- Receipts
- Adjustments
- Transfers
- Damaged/Expired

Actions:

- Receive stock
- Adjust stock
- Transfer stock
- Export ledger

### 3.9 Issuing page

Workflow:

1. Select employee
2. Auto-load person sizes and history
3. Add issue lines (item, size, quantity)
4. Validate available stock
5. Save issue
6. Send signature link via WhatsApp

Buttons:

- **Add Item Line**
- **Remove Line**
- **Save Issue**
- **Save and Send WhatsApp Link**
- **Cancel Issue**

### 3.10 Signature page (mobile friendly)

Displays:

- Employee name
- Issue summary
- Date/time
- Policy acknowledgement text

Controls:

- Draw signature pad
- Type name fallback
- Accept checkbox
- Submit signature

States:

- Link valid and pending
- Already signed
- Link expired

### 3.11 Reports page

Filters:

- Date range
- Department
- Sub-department
- PPE category
- Employee
- Signed status

Exports:

- CSV
- Excel
- PDF

## 4) Form validation standards

1. Required fields marked with `*`.
2. Prevent save if required fields missing.
3. Mobile numbers normalized to international format.
4. Numeric fields enforce non-negative values.
5. Delete action requires confirmation modal.

## 5) UX safeguards

1. Warn before navigating away with unsaved changes.
2. Show success/error toasts for all mutations.
3. Use inline error messages per field.
4. Add loading indicators on long operations.

