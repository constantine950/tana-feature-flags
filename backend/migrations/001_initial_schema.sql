-- Tana Feature Flags - Database Schema
-- PostgreSQL 14+
-- Created: 2026-01-26

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    
    CONSTRAINT users_email_lowercase CHECK (email = LOWER(email)),
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

COMMENT ON TABLE users IS 'Dashboard user accounts';

-- ============================================================
-- PROJECTS
-- ============================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT projects_name_owner_unique UNIQUE (name, owner_id, deleted_at)
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_deleted ON projects(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

COMMENT ON TABLE projects IS 'Projects for organizing feature flags (multi-tenancy)';

-- ============================================================
-- ENVIRONMENTS
-- ============================================================

CREATE TABLE environments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(50) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT environments_project_name_unique UNIQUE (project_id, name),
    CONSTRAINT environments_project_key_unique UNIQUE (project_id, key),
    CONSTRAINT environments_api_key_unique UNIQUE (api_key_hash),
    CONSTRAINT environments_key_format CHECK (key ~* '^[a-z0-9_-]+$')
);

CREATE INDEX idx_environments_project ON environments(project_id);
CREATE INDEX idx_environments_api_key ON environments(api_key_hash);

COMMENT ON TABLE environments IS 'Environments within projects (dev, staging, prod)';

-- ============================================================
-- FEATURE FLAGS
-- ============================================================

CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT flags_project_key_unique UNIQUE (project_id, key),
    CONSTRAINT flags_key_format CHECK (key ~* '^[a-z0-9_]+$')
);

CREATE INDEX idx_flags_project ON feature_flags(project_id);
CREATE INDEX idx_flags_key ON feature_flags(key);
CREATE INDEX idx_flags_status ON feature_flags(status);
CREATE INDEX idx_flags_created_by ON feature_flags(created_by);

COMMENT ON TABLE feature_flags IS 'Feature flag definitions';

-- ============================================================
-- FLAG RULES
-- ============================================================

CREATE TABLE flag_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT false,
    percentage INTEGER DEFAULT 0 
        CHECK (percentage >= 0 AND percentage <= 100),
    user_whitelist TEXT[] DEFAULT '{}',
    user_blacklist TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT rules_flag_env_unique UNIQUE (flag_id, environment_id)
);

CREATE INDEX idx_rules_flag ON flag_rules(flag_id);
CREATE INDEX idx_rules_environment ON flag_rules(environment_id);
CREATE INDEX idx_rules_enabled ON flag_rules(enabled);
CREATE INDEX idx_rules_flag_env ON flag_rules(flag_id, environment_id);

COMMENT ON TABLE flag_rules IS 'Evaluation rules for flags in specific environments';

-- ============================================================
-- AUDIT LOGS (Optional/Stretch)
-- ============================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT audit_action_valid CHECK (
        action IN ('create', 'update', 'delete', 'login', 'logout')
    ),
    CONSTRAINT audit_entity_valid CHECK (
        entity_type IN ('user', 'project', 'environment', 'flag', 'rule')
    )
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_environments_updated_at 
    BEFORE UPDATE ON environments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flags_updated_at 
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at 
    BEFORE UPDATE ON flag_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VIEWS (Optional - for convenience)
-- ============================================================

-- View: Active flags with their rules
CREATE VIEW v_active_flags AS
SELECT 
    f.id as flag_id,
    f.key as flag_key,
    f.name as flag_name,
    p.id as project_id,
    p.name as project_name,
    e.id as environment_id,
    e.name as environment_name,
    r.enabled,
    r.percentage,
    r.user_whitelist,
    r.user_blacklist
FROM feature_flags f
JOIN projects p ON f.project_id = p.id
LEFT JOIN flag_rules r ON f.id = r.flag_id
LEFT JOIN environments e ON r.environment_id = e.id
WHERE f.status = 'active' 
  AND p.deleted_at IS NULL;

COMMENT ON VIEW v_active_flags IS 'Convenient view of all active flags with their environment rules';

-- ============================================================
-- SAMPLE DATA (for development)
-- ============================================================

-- Uncomment for development seed data
-- INSERT INTO users (email, password_hash, name) VALUES
--     ('admin@tana.dev', '$2b$10$...', 'Admin User');
-- 
-- INSERT INTO projects (name, description, owner_id) VALUES
--     ('Demo Project', 'Example project for testing', 
--      (SELECT id FROM users WHERE email = 'admin@tana.dev'));