# HFR Schafer Vervoer - Organization Structure for PPE System

This structure is used for department/sub-department dropdowns, default PPE profiles, and compliance reporting.

## Department Hierarchy

### 1. Transport Operations

- **Refrigerated Trucks**
  - Long-haul refrigerated drivers
  - Regional refrigerated drivers
  - Reefer loading crew
- **Tautliner Operations**
  - Long-haul tautliner drivers
  - Regional tautliner drivers
  - Tautliner loading crew

### 2. Truck Workshop

- Mechanical maintenance
- Electrical and diagnostics
- Brake and suspension
- Service pit operations

### 3. Trailer Workshop

- Trailer mechanical repairs
- Trailer electrical repairs
- Axle and braking systems
- Structural repair and welding

### 4. Fiberglass Division

- Fiberglass fabrication
- Molding and lamination
- Repair and finishing
- Paint preparation

### 5. Admin Office

- Health and safety administration
- HR and payroll administration
- Procurement and stores coordination
- Management and finance support

## Job Role Examples

- Driver
- Assistant Driver
- Workshop Technician
- Workshop Supervisor
- Trailer Technician
- Fiberglass Technician
- Storeman
- Safety Officer
- HR Administrator
- Office Administrator
- Fleet Manager

## Default PPE Profile Mapping (Example)

| Department | Typical PPE Set |
|---|---|
| Refrigerated Drivers | Safety boots, high-vis vest, gloves, rain suit |
| Tautliner Drivers | Safety boots, high-vis vest, gloves, hard hat (yard) |
| Truck Workshop | Safety boots, overalls, gloves, eye protection, hearing protection |
| Trailer Workshop | Safety boots, overalls, welding gloves, face shield, hearing protection |
| Fiberglass Division | Safety boots, respirator, gloves, eye protection, coveralls |
| Admin Office | Visitor PPE set as needed (vest, boots for yard access) |

## Data Standard Notes

- Department and sub-department IDs should be immutable.
- Names can be edited but historical references should remain valid.
- Inactive units should not be shown in normal dropdowns unless "show inactive" is selected.
