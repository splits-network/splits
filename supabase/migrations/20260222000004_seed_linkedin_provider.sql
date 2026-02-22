-- Seed LinkedIn OAuth provider
-- Phase 5: LinkedIn OAuth integration for profile verification

INSERT INTO integration_providers (slug, name, category, icon, description, oauth_auth_url, oauth_token_url, oauth_scopes, sort_order) VALUES
(
    'linkedin',
    'LinkedIn',
    'linkedin',
    'fa-brands fa-linkedin',
    'Verify your professional identity and enrich candidate profiles with LinkedIn data',
    'https://www.linkedin.com/oauth/v2/authorization',
    'https://www.linkedin.com/oauth/v2/accessToken',
    ARRAY['openid', 'profile', 'email'],
    5
);
