-- Seed: Extended dropdown options

BEGIN;

INSERT INTO dropdown_groups (group_code, group_name, description) VALUES
  ('employment_status', 'Employment Status', 'Status values for people'),
  ('size_type', 'PPE Size Type', 'Configurable size dimensions'),
  ('alpha_size', 'Alpha Sizes', 'Text-based sizes'),
  ('boot_size', 'Boot Sizes', 'Numeric boot size options'),
  ('glove_size', 'Glove Sizes', 'Glove size options'),
  ('hard_hat_size', 'Hard Hat Sizes', 'Head size options'),
  ('issue_reason', 'Issue Reason', 'Reason for issuing PPE'),
  ('stock_adjustment_reason', 'Stock Adjustment Reason', 'Reason for stock correction'),
  ('signature_mode', 'Signature Mode', 'How signature is captured')
ON CONFLICT (group_code) DO NOTHING;

INSERT INTO dropdown_options (group_id, option_code, option_label, sort_order)
SELECT g.id, o.option_code, o.option_label, o.sort_order
FROM dropdown_groups g
JOIN (
  VALUES
    -- employment_status
    ('employment_status', 'ACTIVE', 'Active', 10),
    ('employment_status', 'INACTIVE', 'Inactive', 20),
    ('employment_status', 'TERMINATED', 'Terminated', 30),
    ('employment_status', 'SUSPENDED', 'Suspended', 40),

    -- size_type
    ('size_type', 'BOOTS', 'Boots Size', 10),
    ('size_type', 'GLOVES', 'Gloves Size', 20),
    ('size_type', 'OVERALLS', 'Overalls Size', 30),
    ('size_type', 'JACKET', 'Jacket Size', 40),
    ('size_type', 'TROUSER', 'Trouser Size', 50),
    ('size_type', 'RAIN_SUIT', 'Rain Suit Size', 60),
    ('size_type', 'HARD_HAT', 'Hard Hat Size', 70),
    ('size_type', 'EAR_PROTECTION', 'Ear Protection Size', 80),
    ('size_type', 'RESPIRATOR', 'Respirator Size', 90),
    ('size_type', 'SAFETY_VEST', 'Safety Vest Size', 100),

    -- alpha_size
    ('alpha_size', '2XS', '2XS', 10),
    ('alpha_size', 'XS', 'XS', 20),
    ('alpha_size', 'S', 'S', 30),
    ('alpha_size', 'M', 'M', 40),
    ('alpha_size', 'L', 'L', 50),
    ('alpha_size', 'XL', 'XL', 60),
    ('alpha_size', '2XL', '2XL', 70),
    ('alpha_size', '3XL', '3XL', 80),
    ('alpha_size', '4XL', '4XL', 90),
    ('alpha_size', '5XL', '5XL', 100),

    -- boot_size
    ('boot_size', '3', '3', 10),
    ('boot_size', '4', '4', 20),
    ('boot_size', '5', '5', 30),
    ('boot_size', '6', '6', 40),
    ('boot_size', '7', '7', 50),
    ('boot_size', '8', '8', 60),
    ('boot_size', '9', '9', 70),
    ('boot_size', '10', '10', 80),
    ('boot_size', '11', '11', 90),
    ('boot_size', '12', '12', 100),
    ('boot_size', '13', '13', 110),
    ('boot_size', '14', '14', 120),

    -- glove_size
    ('glove_size', '6', '6', 10),
    ('glove_size', '7', '7', 20),
    ('glove_size', '8', '8', 30),
    ('glove_size', '9', '9', 40),
    ('glove_size', '10', '10', 50),
    ('glove_size', '11', '11', 60),
    ('glove_size', '12', '12', 70),

    -- hard_hat_size
    ('hard_hat_size', '52_54', '52-54 cm', 10),
    ('hard_hat_size', '55_56', '55-56 cm', 20),
    ('hard_hat_size', '57_58', '57-58 cm', 30),
    ('hard_hat_size', '59_60', '59-60 cm', 40),
    ('hard_hat_size', '61_62', '61-62 cm', 50),
    ('hard_hat_size', 'ADJ', 'Adjustable', 60),

    -- issue_reason
    ('issue_reason', 'NEW_STARTER', 'New Employee Starter Pack', 10),
    ('issue_reason', 'SCHEDULED_REPLACE', 'Scheduled Replacement', 20),
    ('issue_reason', 'DAMAGED_REPLACE', 'Damaged Item Replacement', 30),
    ('issue_reason', 'LOST_REPLACE', 'Lost Item Replacement', 40),
    ('issue_reason', 'CORRECTIVE_ACTION', 'Compliance Corrective Action', 50),
    ('issue_reason', 'TEMP_TASK', 'Temporary Task Issue', 60),
    ('issue_reason', 'VISITOR', 'Visitor Issue', 70),

    -- stock_adjustment_reason
    ('stock_adjustment_reason', 'COUNT_CORRECTION', 'Count Correction', 10),
    ('stock_adjustment_reason', 'DAMAGED_DISPOSAL', 'Damaged Stock Disposal', 20),
    ('stock_adjustment_reason', 'SUPPLIER_RETURN', 'Supplier Return', 30),
    ('stock_adjustment_reason', 'EXPIRY_WRITE_OFF', 'Expiry Write-Off', 40),
    ('stock_adjustment_reason', 'TRANSFER_CORRECTION', 'Internal Transfer Correction', 50),
    ('stock_adjustment_reason', 'QUALITY_HOLD', 'Quality Hold', 60),

    -- signature_mode
    ('signature_mode', 'IN_PERSON', 'In Person Signature', 10),
    ('signature_mode', 'REMOTE_WHATSAPP', 'Remote Signature - WhatsApp Link', 20)
) AS o(group_code, option_code, option_label, sort_order)
  ON o.group_code = g.group_code
ON CONFLICT DO NOTHING;

COMMIT;
