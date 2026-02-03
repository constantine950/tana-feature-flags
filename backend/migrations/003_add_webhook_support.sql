-- 003_add_webhook_support.sql

-- Add webhooks table
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    secret VARCHAR(255) NOT NULL,
    events TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index
CREATE INDEX idx_webhooks_project ON webhooks(project_id);
CREATE INDEX idx_webhooks_active ON webhooks(active);

-- Add trigger
CREATE TRIGGER update_webhooks_updated_at 
    BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE webhooks IS 'Webhook endpoints for flag change notifications';