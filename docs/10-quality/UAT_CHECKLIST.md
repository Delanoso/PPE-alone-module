# UAT Checklist

## A. Access and Login

- [ ] User can log in with assigned role.
- [ ] Incorrect password is handled safely.
- [ ] Inactive user cannot log in.

## B. Dashboard

- [ ] Role sees expected widgets only.
- [ ] Department filters work correctly.
- [ ] Pending signature count is accurate.

## C. People Module

- [ ] Add person works with all required fields.
- [ ] Edit person details works.
- [ ] Update size profile works.
- [ ] Delete person uses soft delete and hides from default list.
- [ ] "Add another person" workflow is efficient.

## D. Department Structure

- [ ] Departments listed correctly for HFR Schafer Vervoer.
- [ ] Sub-departments load correctly based on selected department.

## E. PPE and Stock

- [ ] PPE item and variant can be created.
- [ ] Stock receipt updates balances.
- [ ] Low-stock alert appears when threshold breached.

## F. PPE Issue Process

- [ ] Issue can be saved as draft.
- [ ] Confirmed issue deducts stock correctly.
- [ ] Receipt shows correct person, issuer, and item details.

## G. WhatsApp Signature

- [ ] Signature link is sent to correct mobile number.
- [ ] Link opens expected issue details.
- [ ] Signature submission marks issue as signed.
- [ ] Expired link behavior is correct.
- [ ] Resend action creates valid replacement link.

## H. Reporting and Audit

- [ ] Compliance report export includes signature status.
- [ ] Audit log shows create/update/delete events.
- [ ] Size profile updates are auditable.

## I. Final Sign-Off

- [ ] Health and Safety Manager approved
- [ ] Storeman representative approved
- [ ] Admin/HR representative approved
- [ ] Project owner approved
