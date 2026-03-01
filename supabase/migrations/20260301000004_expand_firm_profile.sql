-- Migration: Expand firm profile for marketing & marketplace
-- Adds branding, specialization, location, contact, marketplace toggles, and visibility controls

-- ============================================================
-- Identity & Branding
-- ============================================================
ALTER TABLE public.firms
  ADD COLUMN slug TEXT,
  ADD COLUMN tagline VARCHAR(160),
  ADD COLUMN description TEXT,
  ADD COLUMN logo_url TEXT,
  ADD COLUMN logo_path TEXT,
  ADD COLUMN banner_url TEXT,
  ADD COLUMN banner_path TEXT;

-- ============================================================
-- Specialization & Discovery
-- ============================================================
ALTER TABLE public.firms
  ADD COLUMN industries TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN specialties TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN placement_types TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN geo_focus TEXT[] NOT NULL DEFAULT '{}';

-- ============================================================
-- Location
-- ============================================================
ALTER TABLE public.firms
  ADD COLUMN headquarters_city VARCHAR(100),
  ADD COLUMN headquarters_state VARCHAR(100),
  ADD COLUMN headquarters_country VARCHAR(2),
  ADD COLUMN founded_year SMALLINT,
  ADD COLUMN team_size_range TEXT;

-- ============================================================
-- Contact & Social
-- ============================================================
ALTER TABLE public.firms
  ADD COLUMN website_url TEXT,
  ADD COLUMN linkedin_url TEXT,
  ADD COLUMN contact_email TEXT,
  ADD COLUMN contact_phone TEXT;

-- ============================================================
-- Marketplace Toggles
-- ============================================================
ALTER TABLE public.firms
  ADD COLUMN marketplace_visible BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN marketplace_approved_at TIMESTAMPTZ,
  ADD COLUMN seeking_split_partners BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN accepts_candidate_submissions BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- Visibility Controls
-- ============================================================
ALTER TABLE public.firms
  ADD COLUMN show_member_count BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN show_placement_stats BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN show_contact_info BOOLEAN NOT NULL DEFAULT true;

-- ============================================================
-- Split Partnership Terms
-- ============================================================
ALTER TABLE public.firms
  ADD COLUMN preferred_split_terms TEXT,
  ADD COLUMN guarantee_period_days SMALLINT;

-- ============================================================
-- Constraints
-- ============================================================
ALTER TABLE public.firms
  ADD CONSTRAINT firms_placement_types_check
    CHECK (placement_types <@ ARRAY['permanent','contract','contract_to_hire','executive_search']::text[]);

ALTER TABLE public.firms
  ADD CONSTRAINT firms_team_size_range_check
    CHECK (team_size_range IS NULL OR team_size_range IN ('solo','2_5','6_15','16_50','50_plus'));

ALTER TABLE public.firms
  ADD CONSTRAINT firms_founded_year_check
    CHECK (founded_year IS NULL OR (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM NOW())::smallint));

ALTER TABLE public.firms
  ADD CONSTRAINT firms_guarantee_period_days_check
    CHECK (guarantee_period_days IS NULL OR (guarantee_period_days >= 0 AND guarantee_period_days <= 365));

-- ============================================================
-- Indexes
-- ============================================================

-- Marketplace discovery (partial index for active, visible, approved firms)
CREATE INDEX idx_firms_marketplace ON public.firms (marketplace_visible, status)
  WHERE marketplace_visible = true AND marketplace_approved_at IS NOT NULL AND status = 'active';

-- Array field search via GIN
CREATE INDEX idx_firms_industries ON public.firms USING GIN (industries);
CREATE INDEX idx_firms_specialties ON public.firms USING GIN (specialties);
CREATE INDEX idx_firms_geo_focus ON public.firms USING GIN (geo_focus);
CREATE INDEX idx_firms_placement_types ON public.firms USING GIN (placement_types);

-- Slug lookup (unique partial — only non-null slugs)
CREATE UNIQUE INDEX idx_firms_slug ON public.firms (slug) WHERE slug IS NOT NULL;

-- ============================================================
-- Comments
-- ============================================================
COMMENT ON COLUMN public.firms.slug IS 'URL-friendly identifier for public firm profile page';
COMMENT ON COLUMN public.firms.tagline IS 'Short marketing tagline (max 160 chars) shown on cards and search';
COMMENT ON COLUMN public.firms.description IS 'Full markdown profile description for the firm detail page';
COMMENT ON COLUMN public.firms.industries IS 'Industry verticals the firm recruits in (same taxonomy as recruiters.industries)';
COMMENT ON COLUMN public.firms.specialties IS 'Functional specialties (same taxonomy as recruiters.specialties)';
COMMENT ON COLUMN public.firms.placement_types IS 'Types of placements: permanent, contract, contract_to_hire, executive_search';
COMMENT ON COLUMN public.firms.geo_focus IS 'Geographic markets the firm serves';
COMMENT ON COLUMN public.firms.marketplace_visible IS 'Firm opt-in to appear in Agency Marketplace';
COMMENT ON COLUMN public.firms.marketplace_approved_at IS 'Platform admin approval timestamp — both this and marketplace_visible must be set to appear';
COMMENT ON COLUMN public.firms.seeking_split_partners IS 'Whether the firm is actively seeking split partners';
COMMENT ON COLUMN public.firms.accepts_candidate_submissions IS 'Whether the firm accepts unsolicited candidate submissions';
COMMENT ON COLUMN public.firms.preferred_split_terms IS 'Free-text description of how splits work at this firm';
COMMENT ON COLUMN public.firms.guarantee_period_days IS 'Standard guarantee period offered in days';
