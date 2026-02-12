-- HFR Schafer Vervoer PPE Issue Management System
-- PostgreSQL schema

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE employment_status_enum AS ENUM ('active', 'inactive', 'terminated', 'suspended');
CREATE TYPE issue_status_enum AS ENUM ('draft', 'pending_signature', 'signed', 'cancelled');
CREATE TYPE signature_mode_enum AS ENUM ('in_person', 'remote');
CREATE TYPE token_status_enum AS ENUM ('created', 'sent', 'opened', 'signed', 'expired', 'revoked');
CREATE TYPE movement_type_enum AS ENUM ('receipt', 'issue', 'adjustment', 'return');
CREATE TYPE notification_channel_enum AS ENUM ('whatsapp', 'email', 'sms');
CREATE TYPE notification_status_enum AS ENUM ('queued', 'sent', 'delivered', 'failed', 'read');

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_code VARCHAR(50) NOT NULL UNIQUE,
  role_name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_code VARCHAR(80) NOT NULL UNIQUE,
  permission_name VARCHAR(140) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id),
  full_name VARCHAR(180) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  employee_no VARCHAR(50) UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_code VARCHAR(50) NOT NULL UNIQUE,
  department_name VARCHAR(120) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sub_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id),
  sub_department_code VARCHAR(50) NOT NULL,
  sub_department_name VARCHAR(140) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id, department_id),
  UNIQUE (department_id, sub_department_code),
  UNIQUE (department_id, sub_department_name)
);

CREATE TABLE job_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title_code VARCHAR(50) NOT NULL UNIQUE,
  job_title_name VARCHAR(140) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_no VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(120) NOT NULL,
  last_name VARCHAR(120) NOT NULL,
  id_number VARCHAR(80),
  mobile_number VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  department_id UUID NOT NULL REFERENCES departments(id),
  sub_department_id UUID NOT NULL REFERENCES sub_departments(id),
  job_title_id UUID REFERENCES job_titles(id),
  employment_status employment_status_enum NOT NULL DEFAULT 'active',
  hire_date DATE,
  termination_date DATE,
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_people_department_sub_department_match
    FOREIGN KEY (sub_department_id, department_id)
    REFERENCES sub_departments (id, department_id),
  CONSTRAINT chk_people_termination_date
    CHECK (termination_date IS NULL OR hire_date IS NULL OR termination_date >= hire_date)
);

CREATE TABLE person_size_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  size_type VARCHAR(50) NOT NULL,
  size_value VARCHAR(50) NOT NULL,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (person_id, size_type)
);

CREATE TABLE ppe_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code VARCHAR(50) NOT NULL UNIQUE,
  category_name VARCHAR(120) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ppe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES ppe_categories(id),
  item_code VARCHAR(50) NOT NULL UNIQUE,
  item_name VARCHAR(180) NOT NULL,
  description TEXT,
  replacement_cycle_days INTEGER CHECK (replacement_cycle_days IS NULL OR replacement_cycle_days >= 0),
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ppe_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ppe_item_id UUID NOT NULL REFERENCES ppe_items(id),
  variant_code VARCHAR(80) NOT NULL UNIQUE,
  size_value VARCHAR(50) NOT NULL,
  color VARCHAR(50),
  uom VARCHAR(20) NOT NULL DEFAULT 'unit',
  min_stock_level NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (min_stock_level >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_code VARCHAR(50) NOT NULL UNIQUE,
  location_name VARCHAR(160) NOT NULL UNIQUE,
  location_type VARCHAR(30) NOT NULL DEFAULT 'warehouse',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_code VARCHAR(50) NOT NULL UNIQUE,
  supplier_name VARCHAR(180) NOT NULL UNIQUE,
  contact_name VARCHAR(180),
  phone VARCHAR(30),
  email VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE issue_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_no VARCHAR(40) NOT NULL UNIQUE,
  person_id UUID NOT NULL REFERENCES people(id),
  issued_by_user_id UUID NOT NULL REFERENCES users(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  issue_status issue_status_enum NOT NULL DEFAULT 'draft',
  signature_mode signature_mode_enum NOT NULL,
  notes TEXT,
  signed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_issue_signed_at
    CHECK (issue_status <> 'signed' OR signed_at IS NOT NULL),
  CONSTRAINT chk_issue_cancelled_at
    CHECK (issue_status <> 'cancelled' OR cancelled_at IS NOT NULL)
);

CREATE TABLE issue_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_transaction_id UUID NOT NULL REFERENCES issue_transactions(id) ON DELETE CASCADE,
  ppe_variant_id UUID NOT NULL REFERENCES ppe_variants(id),
  quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
  condition_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (issue_transaction_id, ppe_variant_id)
);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ppe_variant_id UUID NOT NULL REFERENCES ppe_variants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  supplier_id UUID REFERENCES suppliers(id),
  movement_type movement_type_enum NOT NULL,
  quantity NUMERIC(12,2) NOT NULL CHECK (quantity <> 0),
  unit_cost NUMERIC(12,2) CHECK (unit_cost IS NULL OR unit_cost >= 0),
  reason_code VARCHAR(60),
  reference_type VARCHAR(40),
  reference_id UUID,
  movement_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_user_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_movement_quantity_direction
    CHECK (
      (movement_type IN ('receipt', 'return') AND quantity > 0)
      OR (movement_type = 'issue' AND quantity < 0)
      OR (movement_type = 'adjustment')
    )
);

CREATE TABLE signature_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_transaction_id UUID NOT NULL REFERENCES issue_transactions(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  token_status token_status_enum NOT NULL DEFAULT 'created',
  expires_at TIMESTAMPTZ NOT NULL,
  max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
  current_attempts INTEGER NOT NULL DEFAULT 0 CHECK (current_attempts >= 0),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE signature_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_transaction_id UUID NOT NULL UNIQUE REFERENCES issue_transactions(id) ON DELETE CASCADE,
  signature_token_id UUID REFERENCES signature_tokens(id),
  signature_type VARCHAR(20) NOT NULL CHECK (signature_type IN ('draw', 'type', 'consent')),
  signature_payload_uri TEXT NOT NULL,
  signer_name VARCHAR(255) NOT NULL,
  signer_mobile VARCHAR(30) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel notification_channel_enum NOT NULL,
  recipient VARCHAR(120) NOT NULL,
  template_code VARCHAR(80) NOT NULL,
  provider_message_id VARCHAR(120),
  status notification_status_enum NOT NULL DEFAULT 'queued',
  payload_json JSONB,
  response_json JSONB,
  issue_transaction_id UUID REFERENCES issue_transactions(id),
  signature_token_id UUID REFERENCES signature_tokens(id),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dropdown_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_code VARCHAR(80) NOT NULL UNIQUE,
  group_name VARCHAR(160) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dropdown_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES dropdown_groups(id) ON DELETE CASCADE,
  option_code VARCHAR(80) NOT NULL,
  option_label VARCHAR(160) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, option_code)
);

CREATE TABLE audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id UUID REFERENCES users(id),
  action VARCHAR(60) NOT NULL,
  entity_name VARCHAR(80) NOT NULL,
  entity_id UUID,
  before_json JSONB,
  after_json JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE VIEW stock_balances AS
SELECT
  ppe_variant_id,
  location_id,
  SUM(quantity) AS on_hand_quantity
FROM stock_movements
GROUP BY ppe_variant_id, location_id;

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_people_department_sub_department ON people(department_id, sub_department_id);
CREATE INDEX idx_people_status ON people(employment_status);
CREATE INDEX idx_person_size_profiles_person_id ON person_size_profiles(person_id);
CREATE INDEX idx_ppe_variants_item_id ON ppe_variants(ppe_item_id);
CREATE INDEX idx_issue_transactions_person_id ON issue_transactions(person_id);
CREATE INDEX idx_issue_transactions_status_date ON issue_transactions(issue_status, issue_date);
CREATE INDEX idx_issue_lines_issue_id ON issue_lines(issue_transaction_id);
CREATE INDEX idx_stock_movements_variant_date ON stock_movements(ppe_variant_id, movement_date);
CREATE INDEX idx_stock_movements_location_date ON stock_movements(location_id, movement_date);
CREATE INDEX idx_signature_tokens_issue_id ON signature_tokens(issue_transaction_id);
CREATE INDEX idx_signature_tokens_status_expires ON signature_tokens(token_status, expires_at);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_permissions_updated_at
BEFORE UPDATE ON permissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sub_departments_updated_at
BEFORE UPDATE ON sub_departments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_job_titles_updated_at
BEFORE UPDATE ON job_titles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_people_updated_at
BEFORE UPDATE ON people
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_person_size_profiles_updated_at
BEFORE UPDATE ON person_size_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ppe_categories_updated_at
BEFORE UPDATE ON ppe_categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ppe_items_updated_at
BEFORE UPDATE ON ppe_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ppe_variants_updated_at
BEFORE UPDATE ON ppe_variants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_locations_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_issue_transactions_updated_at
BEFORE UPDATE ON issue_transactions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_signature_tokens_updated_at
BEFORE UPDATE ON signature_tokens
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_notification_logs_updated_at
BEFORE UPDATE ON notification_logs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_dropdown_groups_updated_at
BEFORE UPDATE ON dropdown_groups
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_dropdown_options_updated_at
BEFORE UPDATE ON dropdown_options
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
