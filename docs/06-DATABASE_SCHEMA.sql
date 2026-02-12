-- HFR Schafer Vervoer PPE Issue System
-- PostgreSQL reference schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========
-- Identity
-- =========

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(160) NOT NULL,
    email VARCHAR(254) UNIQUE,
    mobile_number VARCHAR(30) UNIQUE,
    password_hash TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

-- =============================
-- Departments and people master
-- =============================

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL UNIQUE,
    code VARCHAR(30) UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE sub_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id),
    name VARCHAR(120) NOT NULL,
    code VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_sub_department UNIQUE (department_id, name)
);

CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number VARCHAR(60) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(220) NOT NULL,
    mobile_number VARCHAR(30) NOT NULL,
    email VARCHAR(254),
    department_id UUID NOT NULL REFERENCES departments(id),
    sub_department_id UUID NOT NULL REFERENCES sub_departments(id),
    job_title VARCHAR(120),
    employment_type VARCHAR(40) NOT NULL DEFAULT 'EMPLOYEE',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE person_size_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL UNIQUE REFERENCES people(id),
    clothing_size VARCHAR(20),
    jacket_size VARCHAR(20),
    trouser_size VARCHAR(20),
    shoe_size VARCHAR(20),
    glove_size VARCHAR(20),
    coverall_size VARCHAR(20),
    helmet_size VARCHAR(20),
    reflective_vest_size VARCHAR(20),
    rain_suit_size VARCHAR(20),
    notes TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE person_size_profile_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id),
    profile_id UUID REFERENCES person_size_profiles(id),
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    change_summary JSONB NOT NULL
);

-- =================
-- PPE and inventory
-- =================

CREATE TABLE ppe_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ppe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES ppe_categories(id),
    sku VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(30) NOT NULL DEFAULT 'EA',
    size_required BOOLEAN NOT NULL DEFAULT FALSE,
    min_stock_threshold NUMERIC(12, 2) NOT NULL DEFAULT 0,
    reorder_level NUMERIC(12, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ppe_item_size_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ppe_item_id UUID NOT NULL REFERENCES ppe_items(id),
    size_label VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_item_size UNIQUE (ppe_item_id, size_label)
);

CREATE TABLE stock_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    department_id UUID REFERENCES departments(id),
    sub_department_id UUID REFERENCES sub_departments(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stock_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES stock_locations(id),
    ppe_item_id UUID NOT NULL REFERENCES ppe_items(id),
    size_label VARCHAR(30),
    on_hand_qty NUMERIC(12, 2) NOT NULL DEFAULT 0,
    reserved_qty NUMERIC(12, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_stock_balance UNIQUE (location_id, ppe_item_id, size_label)
);

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_number VARCHAR(60) NOT NULL UNIQUE,
    movement_type VARCHAR(30) NOT NULL,
    location_id UUID NOT NULL REFERENCES stock_locations(id),
    ppe_item_id UUID NOT NULL REFERENCES ppe_items(id),
    size_label VARCHAR(30),
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    reason_code VARCHAR(60) NOT NULL,
    reference_type VARCHAR(60),
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============
-- PPE issuing
-- =============

CREATE TABLE ppe_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_number VARCHAR(60) NOT NULL UNIQUE,
    person_id UUID NOT NULL REFERENCES people(id),
    issued_from_location_id UUID NOT NULL REFERENCES stock_locations(id),
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    issue_reason VARCHAR(80) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_SIGNATURE',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ppe_issue_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES ppe_issues(id) ON DELETE CASCADE,
    ppe_item_id UUID NOT NULL REFERENCES ppe_items(id),
    size_label VARCHAR(30),
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL DEFAULT 'EA',
    notes TEXT
);

CREATE TABLE signature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES ppe_issues(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id),
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    failed_reason TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signature_request_id UUID NOT NULL UNIQUE REFERENCES signature_requests(id) ON DELETE CASCADE,
    issue_id UUID NOT NULL REFERENCES ppe_issues(id),
    person_id UUID NOT NULL REFERENCES people(id),
    signature_type VARCHAR(20) NOT NULL, -- DRAWN or TYPED
    signature_data TEXT NOT NULL, -- base64/image pointer/typed name
    consent_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    signed_name VARCHAR(220),
    signer_ip VARCHAR(64),
    signer_user_agent TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signature_request_id UUID REFERENCES signature_requests(id) ON DELETE CASCADE,
    recipient_mobile VARCHAR(30) NOT NULL,
    provider_name VARCHAR(80) NOT NULL DEFAULT 'WHATSAPP_CLOUD_API',
    provider_message_id VARCHAR(120),
    template_name VARCHAR(120),
    message_body TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============
-- Audit and ops
-- ============

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id),
    actor_name VARCHAR(160),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    action VARCHAR(80) NOT NULL,
    before_state JSONB,
    after_state JSONB,
    metadata JSONB,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============
-- Indexes
-- ============

CREATE INDEX idx_people_department ON people(department_id, sub_department_id);
CREATE INDEX idx_people_status ON people(status);
CREATE INDEX idx_stock_balances_item ON stock_balances(ppe_item_id);
CREATE INDEX idx_stock_movements_item_date ON stock_movements(ppe_item_id, created_at DESC);
CREATE INDEX idx_ppe_issues_person_date ON ppe_issues(person_id, issue_date DESC);
CREATE INDEX idx_signature_requests_status ON signature_requests(status, expires_at);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, occurred_at DESC);

