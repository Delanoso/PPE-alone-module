-- Seed: HFR organization and core masters

BEGIN;

-- Roles
INSERT INTO roles (role_code, role_name, description) VALUES
  ('super_admin', 'Super Admin', 'Full system access'),
  ('health_safety_manager', 'Health and Safety Manager', 'Safety oversight and compliance'),
  ('storeman', 'Storeman', 'Stock and issue operations'),
  ('department_supervisor', 'Department Supervisor', 'Department-limited access'),
  ('hr_admin', 'HR/Admin Officer', 'People administration support'),
  ('auditor', 'Read-Only Auditor', 'Read-only compliance access')
ON CONFLICT (role_code) DO NOTHING;

-- Permissions
INSERT INTO permissions (permission_code, permission_name, description) VALUES
  ('users.manage', 'Manage Users', 'Create, update, disable users'),
  ('roles.manage', 'Manage Roles', 'Manage role permissions'),
  ('org.manage', 'Manage Organization', 'Manage departments and sub-departments'),
  ('people.create', 'Create People', 'Add people'),
  ('people.update', 'Update People', 'Edit person details'),
  ('people.delete', 'Delete People', 'Soft delete people'),
  ('people.size.update', 'Update People Sizes', 'Update size profiles'),
  ('ppe.manage', 'Manage PPE Catalog', 'Manage PPE items and variants'),
  ('stock.receive', 'Post Stock Receipts', 'Capture stock receipts'),
  ('stock.adjust', 'Post Stock Adjustments', 'Adjust inventory'),
  ('issue.create', 'Create Issue', 'Create PPE issue transactions'),
  ('issue.cancel', 'Cancel Issue', 'Cancel issue transactions'),
  ('signature.send', 'Send Signature Link', 'Send or resend signature links'),
  ('reports.export', 'Export Reports', 'Export reports'),
  ('audit.view', 'View Audit Logs', 'Read audit logs')
ON CONFLICT (permission_code) DO NOTHING;

-- Role permission mapping
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  (r.role_code = 'super_admin')
  OR (r.role_code = 'health_safety_manager' AND p.permission_code IN
      ('org.manage','people.create','people.update','people.delete','people.size.update','ppe.manage','stock.receive','stock.adjust','issue.create','issue.cancel','signature.send','reports.export','audit.view'))
  OR (r.role_code = 'storeman' AND p.permission_code IN
      ('people.create','people.update','people.size.update','stock.receive','stock.adjust','issue.create','signature.send','reports.export'))
  OR (r.role_code = 'department_supervisor' AND p.permission_code IN
      ('people.update','people.size.update','issue.create','signature.send','reports.export'))
  OR (r.role_code = 'hr_admin' AND p.permission_code IN
      ('people.create','people.update','people.size.update','reports.export'))
  OR (r.role_code = 'auditor' AND p.permission_code IN
      ('reports.export','audit.view'))
)
ON CONFLICT DO NOTHING;

-- Departments
INSERT INTO departments (department_code, department_name) VALUES
  ('TRANSPORT', 'Transport Operations'),
  ('TRUCK_WS', 'Truck Workshop'),
  ('TRAILER_WS', 'Trailer Workshop'),
  ('FIBER', 'Fiberglass Division'),
  ('ADMIN', 'Admin Office')
ON CONFLICT (department_code) DO NOTHING;

-- Sub-departments
INSERT INTO sub_departments (department_id, sub_department_code, sub_department_name)
SELECT d.id, s.sub_code, s.sub_name
FROM departments d
JOIN (
  VALUES
    ('TRANSPORT', 'REF_LONG', 'Refrigerated Trucks - Long Haul'),
    ('TRANSPORT', 'REF_REG', 'Refrigerated Trucks - Regional'),
    ('TRANSPORT', 'REF_LOAD', 'Refrigerated Loading'),
    ('TRANSPORT', 'TAUT_LONG', 'Tautliner - Long Haul'),
    ('TRANSPORT', 'TAUT_REG', 'Tautliner - Regional'),
    ('TRANSPORT', 'TAUT_LOAD', 'Tautliner Loading'),
    ('TRUCK_WS', 'MECH', 'Mechanical Maintenance'),
    ('TRUCK_WS', 'ELECT', 'Electrical and Diagnostics'),
    ('TRUCK_WS', 'BRAKE', 'Brake and Suspension'),
    ('TRUCK_WS', 'PIT', 'Service Pit Operations'),
    ('TRAILER_WS', 'TR_MECH', 'Trailer Mechanical Repairs'),
    ('TRAILER_WS', 'TR_ELECT', 'Trailer Electrical Repairs'),
    ('TRAILER_WS', 'TR_AXLE', 'Axle and Braking Systems'),
    ('TRAILER_WS', 'TR_WELD', 'Structural Repair and Welding'),
    ('FIBER', 'FAB', 'Fiberglass Fabrication'),
    ('FIBER', 'LAM', 'Molding and Lamination'),
    ('FIBER', 'FIN', 'Repair and Finishing'),
    ('FIBER', 'PAINT', 'Paint Preparation'),
    ('ADMIN', 'HSE', 'Health and Safety Administration'),
    ('ADMIN', 'HR', 'HR and Payroll Administration'),
    ('ADMIN', 'PROC', 'Procurement and Stores Coordination'),
    ('ADMIN', 'FIN', 'Management and Finance Support')
) AS s(dep_code, sub_code, sub_name)
  ON s.dep_code = d.department_code
ON CONFLICT DO NOTHING;

-- Job titles
INSERT INTO job_titles (job_title_code, job_title_name) VALUES
  ('DRIVER', 'Driver'),
  ('ASST_DRIVER', 'Assistant Driver'),
  ('STOREMAN', 'Storeman'),
  ('SAFETY_OFFICER', 'Safety Officer'),
  ('TRUCK_TECH', 'Workshop Technician'),
  ('TRAILER_TECH', 'Trailer Technician'),
  ('FIBER_TECH', 'Fiberglass Technician'),
  ('WORKSHOP_SUP', 'Workshop Supervisor'),
  ('ADMIN_CLERK', 'Admin Clerk'),
  ('OPS_MANAGER', 'Operations Manager')
ON CONFLICT (job_title_code) DO NOTHING;

-- Locations
INSERT INTO locations (location_code, location_name, location_type) VALUES
  ('MAIN_STORE', 'Main PPE Store', 'warehouse'),
  ('TRUCK_WS_STORE', 'Truck Workshop PPE Point', 'workshop'),
  ('TRAILER_WS_STORE', 'Trailer Workshop PPE Point', 'workshop'),
  ('FIBER_STORE', 'Fiberglass PPE Point', 'workshop'),
  ('ADMIN_DESK', 'Admin Office PPE Desk', 'office')
ON CONFLICT (location_code) DO NOTHING;

-- PPE categories
INSERT INTO ppe_categories (category_code, category_name) VALUES
  ('FOOT', 'Foot Protection'),
  ('HAND', 'Hand Protection'),
  ('EYE_FACE', 'Eye and Face Protection'),
  ('HEAD', 'Head Protection'),
  ('HEARING', 'Hearing Protection'),
  ('RESP', 'Respiratory Protection'),
  ('BODY', 'Body Protection'),
  ('HIVIS', 'High Visibility'),
  ('WEATHER', 'Weather Protection')
ON CONFLICT (category_code) DO NOTHING;

-- PPE items
INSERT INTO ppe_items (category_id, item_code, item_name, replacement_cycle_days, is_mandatory)
SELECT c.id, x.item_code, x.item_name, x.repl_days, x.is_mandatory
FROM ppe_categories c
JOIN (
  VALUES
    ('FOOT', 'BOOT_SAFETY', 'Safety Boots', 365, TRUE),
    ('HAND', 'GLOVE_GEN', 'General Purpose Gloves', 90, TRUE),
    ('EYE_FACE', 'GLASSES_CLEAR', 'Safety Glasses - Clear', 180, TRUE),
    ('HEAD', 'HARD_HAT', 'Hard Hat', 365, TRUE),
    ('HEARING', 'EAR_PLUG', 'Ear Plugs', 30, TRUE),
    ('RESP', 'RESP_HALF', 'Half Mask Respirator', 365, TRUE),
    ('BODY', 'OVERALL', 'Protective Overalls', 180, TRUE),
    ('HIVIS', 'VEST_HIVIS', 'High Visibility Vest', 180, TRUE),
    ('WEATHER', 'RAIN_SUIT', 'Rain Suit', 365, FALSE)
) AS x(category_code, item_code, item_name, repl_days, is_mandatory)
  ON x.category_code = c.category_code
ON CONFLICT (item_code) DO NOTHING;

-- PPE variants
INSERT INTO ppe_variants (ppe_item_id, variant_code, size_value, color, uom, min_stock_level)
SELECT i.id, v.variant_code, v.size_value, v.color, v.uom, v.min_stock
FROM ppe_items i
JOIN (
  VALUES
    ('BOOT_SAFETY', 'BOOT_SAFETY_8', '8', 'Black', 'pair', 20),
    ('BOOT_SAFETY', 'BOOT_SAFETY_9', '9', 'Black', 'pair', 25),
    ('BOOT_SAFETY', 'BOOT_SAFETY_10', '10', 'Black', 'pair', 25),
    ('VEST_HIVIS', 'VEST_HIVIS_M', 'M', 'Yellow', 'unit', 20),
    ('VEST_HIVIS', 'VEST_HIVIS_L', 'L', 'Yellow', 'unit', 20),
    ('VEST_HIVIS', 'VEST_HIVIS_XL', 'XL', 'Yellow', 'unit', 15),
    ('OVERALL', 'OVERALL_M', 'M', 'Navy', 'unit', 20),
    ('OVERALL', 'OVERALL_L', 'L', 'Navy', 'unit', 20),
    ('OVERALL', 'OVERALL_XL', 'XL', 'Navy', 'unit', 20),
    ('GLOVE_GEN', 'GLOVE_GEN_9', '9', 'Grey', 'pair', 50),
    ('GLOVE_GEN', 'GLOVE_GEN_10', '10', 'Grey', 'pair', 50),
    ('HARD_HAT', 'HARD_HAT_ADJ', 'Adjustable', 'White', 'unit', 20)
) AS v(item_code, variant_code, size_value, color, uom, min_stock)
  ON v.item_code = i.item_code
ON CONFLICT (variant_code) DO NOTHING;

COMMIT;
