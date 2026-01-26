-- Tana Feature Flags - Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Projects table (multi-tenancy)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT projects_name_owner_unique UNIQUE (name, owner_id)
);

-- Environments table
CREATE TABLE environments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT environments_project_name_unique UNIQUE (project_id, name),
    CONSTRAINT environments_api_key_unique UNIQUE (api_key_hash)
);

-- Feature flags table
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT flags_project_key_unique UNIQUE (project_id, key)
);

-- Flag rules table (per environment)
CREATE TABLE flag_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT false,
    percentage INTEGER DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
    user_whitelist TEXT[], -- Array of user IDs
    user_blacklist TEXT[], -- Array of user IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rules_flag_env_unique UNIQUE (flag_id, environment_id)
);

-- Audit logs table (optional, for stretch goals)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    changes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_deleted ON projects(deleted_at);

CREATE INDEX idx_environments_project ON environments(project_id);
CREATE INDEX idx_environments_api_key ON environments(api_key_hash);

CREATE INDEX idx_flags_project ON feature_flags(project_id);
CREATE INDEX idx_flags_key ON feature_flags(key);
CREATE INDEX idx_flags_status ON feature_flags(status);

CREATE INDEX idx_rules_flag ON flag_rules(flag_id);
CREATE INDEX idx_rules_environment ON flag_rules(environment_id);
CREATE INDEX idx_rules_enabled ON flag_rules(enabled);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_environments_updated_at BEFORE UPDATE ON environments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flags_updated_at BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON flag_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for development (optional)
-- INSERT INTO users (email, password_hash, name) VALUES
-- ('admin@tana.dev', '$2b$10$...', 'Admin User');

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for the dashboard';
COMMENT ON TABLE projects IS 'Projects for organizing feature flags (multi-tenancy)';
COMMENT ON TABLE environments IS 'Environments within projects (dev, staging, prod)';
COMMENT ON TABLE feature_flags IS 'Feature flag definitions';
COMMENT ON TABLE flag_rules IS 'Evaluation rules for flags in specific environments';
COMMENT ON TABLE audit_logs IS 'Audit trail of all changes';
