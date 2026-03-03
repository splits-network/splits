-- ============================================================
-- v7.0 Company Profile Enhancement
-- New lookup tables (perks, culture_tags), junction tables
-- (company_perks, company_culture_tags, company_skills), and
-- new scalar columns on the companies table.
-- Covers SCHEMA-01 through SCHEMA-10.
-- ============================================================

-- ============================================================
-- Section 1: Master lookup tables
-- ============================================================

-- Perks lookup table (mirrors skills table exactly)
CREATE TABLE IF NOT EXISTS perks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_perks_slug ON perks(slug);
-- Trigram index for typeahead search (pg_trgm already enabled)
CREATE INDEX idx_perks_name_trgm ON perks USING gin(name gin_trgm_ops);

-- Culture tags lookup table (mirrors skills table exactly)
CREATE TABLE IF NOT EXISTS culture_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_culture_tags_slug ON culture_tags(slug);
-- Trigram index for typeahead search (pg_trgm already enabled)
CREATE INDEX idx_culture_tags_name_trgm ON culture_tags USING gin(name gin_trgm_ops);

-- ============================================================
-- Section 2: Junction tables
-- ============================================================

-- Company <> Perk junction
CREATE TABLE IF NOT EXISTS company_perks (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    perk_id UUID NOT NULL REFERENCES perks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (company_id, perk_id)
);

CREATE INDEX idx_company_perks_company ON company_perks(company_id);
CREATE INDEX idx_company_perks_perk ON company_perks(perk_id);

-- Company <> Culture Tag junction
CREATE TABLE IF NOT EXISTS company_culture_tags (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    culture_tag_id UUID NOT NULL REFERENCES culture_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (company_id, culture_tag_id)
);

CREATE INDEX idx_company_culture_tags_company ON company_culture_tags(company_id);
CREATE INDEX idx_company_culture_tags_tag ON company_culture_tags(culture_tag_id);

-- Company <> Skill junction (reuses existing skills table)
CREATE TABLE IF NOT EXISTS company_skills (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (company_id, skill_id)
);

CREATE INDEX idx_company_skills_company ON company_skills(company_id);
CREATE INDEX idx_company_skills_skill ON company_skills(skill_id);

-- ============================================================
-- Section 3: New columns on companies table
-- ============================================================

ALTER TABLE public.companies
    ADD COLUMN stage TEXT DEFAULT NULL,
    ADD COLUMN founded_year SMALLINT DEFAULT NULL,
    ADD COLUMN tagline TEXT DEFAULT NULL,
    ADD COLUMN linkedin_url TEXT DEFAULT NULL,
    ADD COLUMN twitter_url TEXT DEFAULT NULL,
    ADD COLUMN glassdoor_url TEXT DEFAULT NULL;

ALTER TABLE public.companies
    ADD CONSTRAINT companies_stage_check
    CHECK (stage = ANY (ARRAY['Seed'::text, 'Series A'::text, 'Series B'::text, 'Series C'::text, 'Growth'::text, 'Public'::text, 'Bootstrapped'::text, 'Non-Profit'::text]));

-- ============================================================
-- Section 4: Row Level Security
-- ============================================================

ALTER TABLE perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_culture_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_skills ENABLE ROW LEVEL SECURITY;

-- Perks: anyone authenticated can read, anyone can insert new perks
CREATE POLICY "perks_select" ON perks FOR SELECT TO authenticated USING (true);
CREATE POLICY "perks_insert" ON perks FOR INSERT TO authenticated WITH CHECK (true);

-- Culture tags: anyone authenticated can read, anyone can insert new culture tags
CREATE POLICY "culture_tags_select" ON culture_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "culture_tags_insert" ON culture_tags FOR INSERT TO authenticated WITH CHECK (true);

-- Company perks: authenticated users can read all, manage writes
CREATE POLICY "company_perks_select" ON company_perks FOR SELECT TO authenticated USING (true);
CREATE POLICY "company_perks_insert" ON company_perks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "company_perks_update" ON company_perks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "company_perks_delete" ON company_perks FOR DELETE TO authenticated USING (true);

-- Company culture tags: authenticated users can read all, manage writes
CREATE POLICY "company_culture_tags_select" ON company_culture_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "company_culture_tags_insert" ON company_culture_tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "company_culture_tags_update" ON company_culture_tags FOR UPDATE TO authenticated USING (true);
CREATE POLICY "company_culture_tags_delete" ON company_culture_tags FOR DELETE TO authenticated USING (true);

-- Company skills: authenticated users can read all, manage writes
CREATE POLICY "company_skills_select" ON company_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "company_skills_insert" ON company_skills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "company_skills_update" ON company_skills FOR UPDATE TO authenticated USING (true);
CREATE POLICY "company_skills_delete" ON company_skills FOR DELETE TO authenticated USING (true);

-- Service role bypass (backend services use service_role key)
CREATE POLICY "perks_service_role" ON perks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "culture_tags_service_role" ON culture_tags FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "company_perks_service_role" ON company_perks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "company_culture_tags_service_role" ON company_culture_tags FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "company_skills_service_role" ON company_skills FOR ALL TO service_role USING (true) WITH CHECK (true);
