-- =============================================================================
-- Gamification Engine: Badges, XP, Levels, Streaks, Leaderboards
-- =============================================================================

-- Enums
CREATE TYPE badge_entity_type AS ENUM ('recruiter', 'candidate', 'company', 'firm');
CREATE TYPE badge_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE xp_source_type AS ENUM (
    'placement_completed', 'application_submitted', 'candidate_hired',
    'response_sent', 'profile_completed', 'split_completed',
    'review_received', 'streak_bonus', 'referral_bonus',
    'first_placement', 'milestone_bonus'
);
CREATE TYPE leaderboard_period AS ENUM ('weekly', 'monthly', 'quarterly', 'all_time');

-- =============================================================================
-- 1. Badge Definitions
-- =============================================================================
CREATE TABLE badge_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    entity_type badge_entity_type NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    tier badge_tier,
    status badge_status NOT NULL DEFAULT 'draft',
    criteria JSONB NOT NULL DEFAULT '{}',
    trigger_events TEXT[] NOT NULL DEFAULT '{}',
    data_source TEXT NOT NULL,
    revocable BOOLEAN NOT NULL DEFAULT false,
    xp_reward INT NOT NULL DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_badge_definitions_active ON badge_definitions (entity_type, status)
    WHERE status = 'active';

-- =============================================================================
-- 2. Badges Awarded
-- =============================================================================
CREATE TABLE badges_awarded (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_definition_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
    entity_type badge_entity_type NOT NULL,
    entity_id UUID NOT NULL,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}',
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_badge_award UNIQUE (badge_definition_id, entity_type, entity_id)
);

CREATE INDEX idx_badges_awarded_entity ON badges_awarded (entity_type, entity_id)
    WHERE revoked_at IS NULL;
CREATE INDEX idx_badges_awarded_definition ON badges_awarded (badge_definition_id)
    WHERE revoked_at IS NULL;

-- =============================================================================
-- 3. Badge Progress
-- =============================================================================
CREATE TABLE badge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_definition_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
    entity_type badge_entity_type NOT NULL,
    entity_id UUID NOT NULL,
    current_value NUMERIC NOT NULL DEFAULT 0,
    target_value NUMERIC NOT NULL,
    percentage NUMERIC GENERATED ALWAYS AS (
        LEAST(100, ROUND((current_value / NULLIF(target_value, 0)) * 100, 1))
    ) STORED,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_badge_progress UNIQUE (badge_definition_id, entity_type, entity_id)
);

CREATE INDEX idx_badge_progress_entity ON badge_progress (entity_type, entity_id);

-- =============================================================================
-- 4. XP Ledger
-- =============================================================================
CREATE TABLE xp_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type badge_entity_type NOT NULL,
    entity_id UUID NOT NULL,
    source xp_source_type NOT NULL,
    points INT NOT NULL,
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_ledger_entity ON xp_ledger (entity_type, entity_id);
CREATE INDEX idx_xp_ledger_created ON xp_ledger (created_at DESC);

-- =============================================================================
-- 5. Entity Levels
-- =============================================================================
CREATE TABLE entity_levels (
    entity_type badge_entity_type NOT NULL,
    entity_id UUID NOT NULL,
    total_xp INT NOT NULL DEFAULT 0,
    current_level INT NOT NULL DEFAULT 1,
    xp_to_next_level INT NOT NULL DEFAULT 100,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (entity_type, entity_id)
);

-- =============================================================================
-- 6. Level Thresholds
-- =============================================================================
CREATE TABLE level_thresholds (
    level INT PRIMARY KEY,
    xp_required INT NOT NULL,
    title TEXT NOT NULL,
    perks JSONB DEFAULT '{}'
);

-- =============================================================================
-- 7. XP Rules
-- =============================================================================
CREATE TABLE xp_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source xp_source_type NOT NULL,
    entity_type badge_entity_type NOT NULL,
    base_points INT NOT NULL,
    multiplier_conditions JSONB,
    max_per_day INT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_xp_rule UNIQUE (source, entity_type)
);

-- =============================================================================
-- 8. Entity Streaks
-- =============================================================================
CREATE TABLE entity_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type badge_entity_type NOT NULL,
    entity_id UUID NOT NULL,
    streak_type TEXT NOT NULL,
    current_count INT NOT NULL DEFAULT 0,
    longest_count INT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ,
    streak_started_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_streak UNIQUE (entity_type, entity_id, streak_type)
);

CREATE INDEX idx_entity_streaks_entity ON entity_streaks (entity_type, entity_id);

-- =============================================================================
-- 9. Leaderboard Entries
-- =============================================================================
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type badge_entity_type NOT NULL,
    entity_id UUID NOT NULL,
    period leaderboard_period NOT NULL,
    period_start DATE NOT NULL,
    rank INT NOT NULL,
    score NUMERIC NOT NULL,
    metric TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_leaderboard UNIQUE (entity_type, entity_id, period, period_start, metric)
);

CREATE INDEX idx_leaderboard_rank ON leaderboard_entries (entity_type, period, period_start, metric, rank);

-- =============================================================================
-- Seed: Level Thresholds (20 levels)
-- =============================================================================
INSERT INTO level_thresholds (level, xp_required, title, perks) VALUES
(1,     0,      'Newcomer',         '{}'),
(2,     100,    'Getting Started',  '{}'),
(3,     250,    'Contributor',      '{}'),
(4,     500,    'Active Member',    '{}'),
(5,     1000,   'Rising Star',      '{"profile_badge": true}'),
(6,     1750,   'Established',      '{"profile_badge": true}'),
(7,     2750,   'Experienced',      '{"profile_badge": true}'),
(8,     4000,   'Professional',     '{"profile_badge": true, "priority_listing": true}'),
(9,     5500,   'Senior Pro',       '{"profile_badge": true, "priority_listing": true}'),
(10,    7500,   'Expert',           '{"profile_badge": true, "priority_listing": true, "featured_profile": true}'),
(11,    10000,  'Master',           '{"profile_badge": true, "priority_listing": true, "featured_profile": true}'),
(12,    13000,  'Grand Master',     '{"profile_badge": true, "priority_listing": true, "featured_profile": true}'),
(13,    16500,  'Elite',            '{"profile_badge": true, "priority_listing": true, "featured_profile": true}'),
(14,    20500,  'Champion',         '{"profile_badge": true, "priority_listing": true, "featured_profile": true}'),
(15,    25000,  'Legend',           '{"profile_badge": true, "priority_listing": true, "featured_profile": true}'),
(16,    30000,  'Icon',             '{"profile_badge": true, "priority_listing": true, "featured_profile": true}'),
(17,    36000,  'Titan',            '{"profile_badge": true, "priority_listing": true, "featured_profile": true}'),
(18,    43000,  'Apex',             '{"profile_badge": true, "priority_listing": true, "featured_profile": true}'),
(19,    51000,  'Pinnacle',         '{"profile_badge": true, "priority_listing": true, "featured_profile": true}'),
(20,    60000,  'Transcendent',     '{"profile_badge": true, "priority_listing": true, "featured_profile": true}');

-- =============================================================================
-- Seed: XP Rules (points per action per entity type)
-- =============================================================================
INSERT INTO xp_rules (source, entity_type, base_points, max_per_day) VALUES
-- Recruiter XP
('placement_completed',     'recruiter', 500,  NULL),
('application_submitted',   'recruiter', 50,   500),
('candidate_hired',         'recruiter', 300,  NULL),
('response_sent',           'recruiter', 10,   100),
('profile_completed',       'recruiter', 200,  NULL),
('split_completed',         'recruiter', 400,  NULL),
('review_received',         'recruiter', 75,   NULL),
('streak_bonus',            'recruiter', 50,   NULL),
('referral_bonus',          'recruiter', 150,  NULL),
('first_placement',         'recruiter', 1000, NULL),
('milestone_bonus',         'recruiter', 250,  NULL),
-- Candidate XP
('profile_completed',       'candidate', 200,  NULL),
('application_submitted',   'candidate', 25,   250),
('candidate_hired',         'candidate', 500,  NULL),
('response_sent',           'candidate', 10,   100),
('review_received',         'candidate', 75,   NULL),
('referral_bonus',          'candidate', 100,  NULL),
('streak_bonus',            'candidate', 50,   NULL),
('milestone_bonus',         'candidate', 250,  NULL),
-- Company XP
('placement_completed',     'company', 200,    NULL),
('review_received',         'company', 50,     NULL),
('referral_bonus',          'company', 100,    NULL),
('milestone_bonus',         'company', 250,    NULL),
-- Firm XP
('placement_completed',     'firm', 300,       NULL),
('split_completed',         'firm', 250,       NULL),
('referral_bonus',          'firm', 150,       NULL),
('milestone_bonus',         'firm', 250,       NULL);

-- =============================================================================
-- Seed: Badge Definitions (starter badges)
-- =============================================================================

-- Recruiter badges
INSERT INTO badge_definitions (slug, name, description, entity_type, icon, color, tier, status, criteria, trigger_events, data_source, revocable, xp_reward, display_order) VALUES
('pro_recruiter',       'Pro Recruiter',      '25+ completed placements',                 'recruiter', 'fa-duotone fa-regular fa-award',              'text-warning',   'gold',     'active', '{"all": [{"field": "completed_placements", "operator": "gte", "value": 25}]}',  ARRAY['placement.completed', 'reputation.updated'], 'recruiter_reputation', false, 500, 1),
('fast_placer',         'Fast Placer',        'Average response time under 4 hours',       'recruiter', 'fa-duotone fa-regular fa-bolt',               'text-accent',    'silver',   'active', '{"all": [{"field": "avg_response_time_hours", "operator": "lt", "value": 4}]}', ARRAY['reputation.updated'],                        'recruiter_reputation', true,  300, 2),
('top_closer',          'Top Closer',         'Hire rate above 30%',                       'recruiter', 'fa-duotone fa-regular fa-bullseye',           'text-primary',   'gold',     'active', '{"all": [{"field": "hire_rate", "operator": "gte", "value": 30}]}',             ARRAY['reputation.updated'],                        'recruiter_reputation', true,  400, 3),
('split_partner',       'Split Partner',      '10+ completed split placements',            'recruiter', 'fa-duotone fa-regular fa-handshake',          'text-secondary', 'silver',   'active', '{"all": [{"field": "total_collaborations", "operator": "gte", "value": 10}]}',  ARRAY['placement.completed'],                       'recruiter_reputation', false, 350, 4),
('rising_star',         'Rising Star',        'First 5 placements completed',              'recruiter', 'fa-duotone fa-regular fa-star-shooting',      'text-info',      'bronze',   'active', '{"all": [{"field": "completed_placements", "operator": "gte", "value": 5}]}',   ARRAY['placement.completed', 'reputation.updated'], 'recruiter_reputation', false, 200, 5),
('verified_recruiter',  'Verified',           'Profile verified by platform',              'recruiter', 'fa-duotone fa-regular fa-badge-check',        'text-success',   NULL,       'active', '{"all": [{"field": "verification_status", "operator": "equals", "value": "verified"}]}', ARRAY['recruiter.updated'], 'recruiters', false, 100, 6),
('consistency_king',    'Consistency King',   '30-day activity streak',                    'recruiter', 'fa-duotone fa-regular fa-fire',               'text-error',     'gold',     'active', '{"all": [{"field": "current_count", "operator": "gte", "value": 30}]}',         ARRAY['streak.updated'],                            'entity_streaks',       true,  500, 7),
('first_placement',     'First Placement',    'Completed your first placement',            'recruiter', 'fa-duotone fa-regular fa-trophy',             'text-warning',   'bronze',   'active', '{"all": [{"field": "completed_placements", "operator": "gte", "value": 1}]}',   ARRAY['placement.completed', 'reputation.updated'], 'recruiter_reputation', false, 100, 8),

-- Candidate badges
('verified_candidate',  'Verified Profile',   'Profile verification completed',            'candidate', 'fa-duotone fa-regular fa-badge-check',        'text-success',   NULL,       'active', '{"all": [{"field": "verification_status", "operator": "equals", "value": "verified"}]}', ARRAY['candidate.updated'], 'candidates', false, 100, 1),
('in_demand',           'In Demand',          '5+ active submissions from recruiters',     'candidate', 'fa-duotone fa-regular fa-fire',               'text-error',     'silver',   'active', '{"all": [{"field": "active_submissions", "operator": "gte", "value": 5}]}',     ARRAY['application.created'],                       'candidates',           true,  200, 2),
('quick_responder',     'Quick Responder',    'Average response time under 24 hours',      'candidate', 'fa-duotone fa-regular fa-clock-rotate-left',  'text-info',      'bronze',   'active', '{"all": [{"field": "avg_response_hours", "operator": "lt", "value": 24}]}',     ARRAY['candidate.responded'],                       'candidates',           true,  150, 3),
('hired',               'Got Hired',          'Successfully placed through the platform',  'candidate', 'fa-duotone fa-regular fa-party-horn',         'text-warning',   'gold',     'active', '{"all": [{"field": "times_hired", "operator": "gte", "value": 1}]}',            ARRAY['placement.completed'],                       'candidates',           false, 500, 4),

-- Company badges
('preferred_employer',  'Preferred Employer', '10+ successful hires through platform',     'company',   'fa-duotone fa-regular fa-building-flag',      'text-primary',   'gold',     'active', '{"all": [{"field": "total_hires", "operator": "gte", "value": 10}]}',           ARRAY['placement.completed'],                       'companies',            false, 400, 1),
('fast_hiring',         'Fast Hiring',        'Average time-to-hire under 30 days',        'company',   'fa-duotone fa-regular fa-gauge-max',          'text-accent',    'silver',   'active', '{"all": [{"field": "avg_time_to_hire_days", "operator": "lt", "value": 30}]}',  ARRAY['placement.completed'],                       'companies',            true,  300, 2),
('repeat_client',       'Repeat Client',      '5+ placements completed',                   'company',   'fa-duotone fa-regular fa-arrows-repeat',      'text-secondary', 'silver',   'active', '{"all": [{"field": "total_placements", "operator": "gte", "value": 5}]}',       ARRAY['placement.completed'],                       'companies',            false, 250, 3);

-- updated_at triggers
CREATE TRIGGER set_badge_definitions_updated_at BEFORE UPDATE ON badge_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_badge_progress_updated_at BEFORE UPDATE ON badge_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_entity_levels_updated_at BEFORE UPDATE ON entity_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_entity_streaks_updated_at BEFORE UPDATE ON entity_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
