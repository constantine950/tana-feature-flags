-- Seed Data for Development
-- DO NOT run in production!

-- Create test user
INSERT INTO users (email, password_hash, name) 
VALUES (
    'admin@tana.dev',
    -- Password: 'password123' (bcrypt hash with cost 10)
    '$2b$10$YourBcryptHashHere',
    'Admin User'
) ON CONFLICT (email) DO NOTHING;

-- Create test project
INSERT INTO projects (name, description, owner_id)
VALUES (
    'Demo Project',
    'Example project for testing Tana',
    (SELECT id FROM users WHERE email = 'admin@tana.dev')
) ON CONFLICT DO NOTHING;

-- Create environments
INSERT INTO environments (project_id, name, key, api_key_hash)
VALUES 
    (
        (SELECT id FROM projects WHERE name = 'Demo Project'),
        'development',
        'dev',
        -- API key: 'ffk_dev_test123'
        '$2b$10$YourHashedApiKeyHere'
    ),
    (
        (SELECT id FROM projects WHERE name = 'Demo Project'),
        'production',
        'prod',
        -- API key: 'ffk_prod_test456'
        '$2b$10$AnotherHashedApiKeyHere'
    )
ON CONFLICT DO NOTHING;

-- Create sample flags
INSERT INTO feature_flags (project_id, key, name, description, status, created_by)
VALUES
    (
        (SELECT id FROM projects WHERE name = 'Demo Project'),
        'new_checkout',
        'New Checkout Flow',
        'Redesigned checkout experience',
        'active',
        (SELECT id FROM users WHERE email = 'admin@tana.dev')
    ),
    (
        (SELECT id FROM projects WHERE name = 'Demo Project'),
        'dark_mode',
        'Dark Mode',
        'Dark theme for UI',
        'active',
        (SELECT id FROM users WHERE email = 'admin@tana.dev')
    ),
    (
        (SELECT id FROM projects WHERE name = 'Demo Project'),
        'premium_features',
        'Premium Features',
        'Advanced features for paid users',
        'active',
        (SELECT id FROM users WHERE email = 'admin@tana.dev')
    )
ON CONFLICT (project_id, key) DO NOTHING;

-- Create flag rules
INSERT INTO flag_rules (flag_id, environment_id, enabled, percentage, user_whitelist, user_blacklist)
SELECT 
    f.id,
    e.id,
    CASE 
        WHEN f.key = 'new_checkout' AND e.key = 'dev' THEN true
        WHEN f.key = 'new_checkout' AND e.key = 'prod' THEN true
        ELSE false
    END as enabled,
    CASE 
        WHEN f.key = 'new_checkout' AND e.key = 'dev' THEN 100
        WHEN f.key = 'new_checkout' AND e.key = 'prod' THEN 25
        WHEN f.key = 'dark_mode' AND e.key = 'prod' THEN 50
        ELSE 0
    END as percentage,
    CASE 
        WHEN f.key = 'premium_features' THEN ARRAY['user_vip_1', 'user_vip_2']::TEXT[]
        ELSE ARRAY[]::TEXT[]
    END as user_whitelist,
    ARRAY[]::TEXT[] as user_blacklist
FROM feature_flags f
CROSS JOIN environments e
WHERE f.project_id = (SELECT id FROM projects WHERE name = 'Demo Project')
  AND e.project_id = (SELECT id FROM projects WHERE name = 'Demo Project')
ON CONFLICT (flag_id, environment_id) DO NOTHING;

-- Verify data
SELECT 'Users created:' as info, COUNT(*) as count FROM users;
SELECT 'Projects created:' as info, COUNT(*) as count FROM projects;
SELECT 'Environments created:' as info, COUNT(*) as count FROM environments;
SELECT 'Flags created:' as info, COUNT(*) as count FROM feature_flags;
SELECT 'Rules created:' as info, COUNT(*) as count FROM flag_rules;