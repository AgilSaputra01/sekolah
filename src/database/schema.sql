-- ==============================================================================
-- EDUCORE MULTI-TENANT SAAS SCHOOL MANAGEMENT PLATFORM
-- PRODUCTION RELATIONAL DATABASE SCHEMA SPECIFICATION
-- Database Engine: PostgreSQL 15+ (Compatible with Amazon RDS / Supabase / Neon)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PLATFORM LEVEL USERS (SaaS Super Admins & SaaS Operators)
-- ==============================================================================
CREATE TABLE platform_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(50) NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'billing_admin', 'support_agent', 'auditor')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated')),
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_platform_users_email ON platform_users(email);

-- ==============================================================================
-- 2. TENANTS (Logical Tenant Container for Isolation & Billing)
-- ==============================================================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'sch-109283'
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'sman1jkt'
    status VARCHAR(30) NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'suspended', 'expired', 'archived')),
    isolation_mode VARCHAR(30) NOT NULL DEFAULT 'shared_schema_rls' CHECK (isolation_mode IN ('shared_schema_rls', 'separate_schema', 'dedicated_database')),
    database_connection_url TEXT, -- Used if dedicated DB
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ==============================================================================
-- 3. SCHOOLS (School Academic Entity linked 1-to-1 with Tenant)
-- ==============================================================================
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    npsn VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK', 'MA', 'MTs')),
    school_type VARCHAR(20) NOT NULL DEFAULT 'Swasta' CHECK (school_type IN ('Negeri', 'Swasta')),
    address TEXT NOT NULL,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    principal_name VARCHAR(255),
    logo_url TEXT,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2026/2027',
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif', 'Trial', 'Suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schools_npsn ON schools(npsn);
CREATE INDEX idx_schools_tenant ON schools(tenant_id);

-- ==============================================================================
-- 4. SAAS PRODUCTS & MODULE CATALOG
-- ==============================================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(50) NOT NULL CHECK (category IN ('Core', 'Akademik', 'Keuangan', 'Smart Campus', 'Mobile')),
    base_price DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. SUBSCRIPTION PLANS
-- ==============================================================================
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_code VARCHAR(50) NOT NULL UNIQUE, -- 'plan-free', 'plan-basic', 'plan-pro', 'plan-enterprise'
    name VARCHAR(100) NOT NULL,
    badge VARCHAR(50),
    description TEXT,
    monthly_price DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    annual_price DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    max_students INT NOT NULL DEFAULT 100,
    max_users INT NOT NULL DEFAULT 10,
    trial_days INT NOT NULL DEFAULT 0,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    quota_limit INT, -- NULL means unlimited
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(plan_id, feature_key)
);

CREATE INDEX idx_plan_features_plan ON plan_features(plan_id);

-- ==============================================================================
-- 6. TENANT SUBSCRIPTIONS
-- ==============================================================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'annually')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'expiring', 'expired', 'suspended')),
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_dates ON subscriptions(start_date, end_date);

-- ==============================================================================
-- 7. TRANSACTIONS & INVOICES
-- ==============================================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    subscription_id UUID REFERENCES subscriptions(id),
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    subtotal DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    admin_fee DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(100) NOT NULL,
    payment_gateway VARCHAR(50) NOT NULL DEFAULT 'Midtrans' CHECK (payment_gateway IN ('Midtrans', 'Xendit', 'Manual')),
    gateway_reference_id VARCHAR(255),
    gateway_payload JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_tenant ON transactions(tenant_id);
CREATE INDEX idx_transactions_invoice ON transactions(invoice_number);
CREATE INDEX idx_transactions_status ON transactions(status);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    billing_address TEXT,
    pdf_url TEXT,
    notes TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. DOMAINS (Subdomains & Custom Domains)
-- ==============================================================================
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    full_subdomain VARCHAR(255) NOT NULL UNIQUE,
    custom_domain VARCHAR(255) UNIQUE,
    ssl_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed')),
    dns_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (dns_status IN ('pending', 'connected', 'config_required', 'error')),
    verification_token VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_domains_tenant ON domains(tenant_id);
CREATE INDEX idx_domains_custom ON domains(custom_domain);

-- ==============================================================================
-- 9. TENANT SETTINGS (Tenant Customization & Feature Flags)
-- ==============================================================================
CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    primary_color VARCHAR(20) DEFAULT '#4f46e5',
    theme_mode VARCHAR(10) DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark', 'system')),
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    currency VARCHAR(10) DEFAULT 'IDR',
    academic_quota_students INT NOT NULL DEFAULT 100,
    academic_quota_staff INT NOT NULL DEFAULT 10,
    whatsapp_gateway_token TEXT,
    smtp_configuration JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. ROLES & PERMISSIONS (RBAC within Tenant or System)
-- ==============================================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for system-wide roles
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module_name VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('View', 'Create', 'Edit', 'Delete', 'Approve')),
    is_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(role_id, module_name, action_type)
);

CREATE INDEX idx_permissions_role ON permissions(role_id);

-- ==============================================================================
-- 11. USERS (Tenant Bound Users: Admin Sekolah, Kepala Sekolah, Guru, Siswa, dll.)
-- ==============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for platform super admin
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- Cached role name
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- ==============================================================================
-- 12. AUDIT LOGS (Platform-wide Security & Auditing)
-- ==============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    user_id UUID,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Tenant', 'Billing', 'Security', 'System')),
    details TEXT NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ==============================================================================
-- 13. IDEMPOTENT TENANT PROVISIONING TRANSACTION PROCEDURE (PL/pgSQL)
-- ==============================================================================
CREATE OR REPLACE PROCEDURE sp_provision_tenant(
    p_school_name VARCHAR,
    p_npsn VARCHAR,
    p_level VARCHAR,
    p_school_type VARCHAR,
    p_address TEXT,
    p_province VARCHAR,
    p_city VARCHAR,
    p_district VARCHAR,
    p_phone VARCHAR,
    p_email VARCHAR,
    p_subdomain VARCHAR,
    p_admin_name VARCHAR,
    p_admin_email VARCHAR,
    p_admin_phone VARCHAR,
    p_password_hash VARCHAR,
    p_plan_id UUID,
    p_billing_cycle VARCHAR,
    p_payment_method VARCHAR,
    INOUT p_result_tenant_id UUID DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_tenant_id UUID;
    v_school_id UUID;
    v_admin_role_id UUID;
    v_user_id UUID;
    v_sub_id UUID;
    v_trx_id UUID;
    v_plan_record RECORD;
    v_sub_end_date TIMESTAMPTZ;
    v_sub_amount DECIMAL(14,2);
    v_invoice_num VARCHAR;
BEGIN
    -- Check for idempotency: if subdomain or npsn exists, abort or return existing
    SELECT id INTO v_tenant_id FROM tenants WHERE subdomain = p_subdomain;
    IF v_tenant_id IS NOT NULL THEN
        RAISE EXCEPTION 'Subdomain % sudah terdaftar dalam sistem.', p_subdomain;
    END IF;

    SELECT id INTO v_school_id FROM schools WHERE npsn = p_npsn;
    IF v_school_id IS NOT NULL THEN
        RAISE EXCEPTION 'NPSN % sudah terdaftar dalam sistem.', p_npsn;
    END IF;

    -- Fetch plan details
    SELECT * INTO v_plan_record FROM plans WHERE id = p_plan_id;
    IF v_plan_record IS NULL THEN
        RAISE EXCEPTION 'Plan ID tidak valid.';
    END IF;

    -- Calculate duration & amount
    IF p_billing_cycle = 'annually' THEN
        v_sub_end_date := NOW() + INTERVAL '1 year';
        v_sub_amount := v_plan_record.annual_price;
    ELSE
        IF v_plan_record.trial_days > 0 THEN
            v_sub_end_date := NOW() + (v_plan_record.trial_days || ' days')::INTERVAL;
            v_sub_amount := 0;
        ELSE
            v_sub_end_date := NOW() + INTERVAL '1 month';
            v_sub_amount := v_plan_record.monthly_price;
        END IF;
    END IF;

    -- 1. Create Tenant
    INSERT INTO tenants (tenant_code, name, subdomain, status)
    VALUES ('sch-' || FLOOR(RANDOM() * 899999 + 100000)::TEXT, p_school_name, p_subdomain, 
            CASE WHEN v_plan_record.name = 'Free' THEN 'trial' ELSE 'active' END)
    RETURNING id INTO v_tenant_id;

    -- 2. Create School
    INSERT INTO schools (tenant_id, npsn, name, level, school_type, address, province, city, district, phone, email, status)
    VALUES (v_tenant_id, p_npsn, p_school_name, p_level, p_school_type, p_address, p_province, p_city, p_district, p_phone, p_email, 'Aktif')
    RETURNING id INTO v_school_id;

    -- 3. Create Tenant Settings
    INSERT INTO tenant_settings (tenant_id, academic_quota_students, academic_quota_staff)
    VALUES (v_tenant_id, v_plan_record.max_students, v_plan_record.max_users);

    -- 4. Create Domain Record
    INSERT INTO domains (tenant_id, subdomain, full_subdomain, ssl_status, dns_status)
    VALUES (v_tenant_id, p_subdomain, p_subdomain || '.educore.id', 'active', 'connected');

    -- 5. Seed Default Admin Sekolah Role
    INSERT INTO roles (tenant_id, name, description, is_system, status)
    VALUES (v_tenant_id, 'Admin Sekolah', 'Administrator Utama Sekolah Pengelola Tenant', TRUE, 'Aktif')
    RETURNING id INTO v_admin_role_id;

    -- 6. Create Admin User
    INSERT INTO users (tenant_id, school_id, role_id, name, email, phone, password_hash, role, status)
    VALUES (v_tenant_id, v_school_id, v_admin_role_id, p_admin_name, p_admin_email, p_admin_phone, p_password_hash, 'Admin Sekolah', 'Aktif')
    RETURNING id INTO v_user_id;

    -- 7. Create Subscription
    INSERT INTO subscriptions (tenant_id, plan_id, billing_cycle, start_date, end_date, amount, status, auto_renew)
    VALUES (v_tenant_id, p_plan_id, p_billing_cycle, NOW(), v_sub_end_date, v_sub_amount,
            CASE WHEN v_plan_record.name = 'Free' THEN 'trial' ELSE 'active' END, TRUE)
    RETURNING id INTO v_sub_id;

    -- 8. Create Transaction & Invoice
    v_invoice_num := 'INV/' || TO_CHAR(NOW(), 'YYYY/MM') || '/EDU-' || LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0');
    INSERT INTO transactions (tenant_id, subscription_id, invoice_number, subtotal, tax, admin_fee, total, payment_method, payment_gateway, status, paid_at)
    VALUES (v_tenant_id, v_sub_id, v_invoice_num, v_sub_amount, v_sub_amount * 0.11, 4500, (v_sub_amount * 1.11) + 4500, p_payment_method, 'Midtrans', 'paid', NOW())
    RETURNING id INTO v_trx_id;

    INSERT INTO invoices (transaction_id, tenant_id, customer_name, customer_email, due_date)
    VALUES (v_trx_id, v_tenant_id, p_admin_name, p_admin_email, NOW() + INTERVAL '1 day');

    -- 9. Log Audit Trail
    INSERT INTO audit_logs (tenant_id, user_id, user_name, action, category, details, ip_address)
    VALUES (v_tenant_id, v_user_id, p_admin_name, 'TENANT_PROVISIONED', 'Tenant', 
            'Aktivasi tenant sukses untuk sekolah: ' || p_school_name || ' (Subdomain: ' || p_subdomain || ')', '127.0.0.1');

    p_result_tenant_id := v_tenant_id;
END;
$$;

