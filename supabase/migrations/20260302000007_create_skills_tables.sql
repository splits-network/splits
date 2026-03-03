-- ============================================================
-- Centralized Skills System
-- Master skills table + junction tables for candidates and jobs
-- ============================================================

-- Master skills table with slug-based deduplication
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigram index for typeahead search (pg_trgm already enabled)
CREATE INDEX idx_skills_slug ON skills(slug);
CREATE INDEX idx_skills_name_trgm ON skills USING gin(name gin_trgm_ops);

-- Candidate <> Skill junction
CREATE TABLE IF NOT EXISTS candidate_skills (
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'manual',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (candidate_id, skill_id)
);

CREATE INDEX idx_candidate_skills_candidate ON candidate_skills(candidate_id);
CREATE INDEX idx_candidate_skills_skill ON candidate_skills(skill_id);

-- Job <> Skill junction
CREATE TABLE IF NOT EXISTS job_skills (
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (job_id, skill_id)
);

CREATE INDEX idx_job_skills_job ON job_skills(job_id);
CREATE INDEX idx_job_skills_skill ON job_skills(skill_id);

-- RLS policies
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;

-- Skills: anyone authenticated can read, anyone can insert new skills
CREATE POLICY "skills_select" ON skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "skills_insert" ON skills FOR INSERT TO authenticated WITH CHECK (true);

-- Candidate skills: authenticated users can read all, service role manages writes
CREATE POLICY "candidate_skills_select" ON candidate_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "candidate_skills_insert" ON candidate_skills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "candidate_skills_update" ON candidate_skills FOR UPDATE TO authenticated USING (true);
CREATE POLICY "candidate_skills_delete" ON candidate_skills FOR DELETE TO authenticated USING (true);

-- Job skills: authenticated users can read all, service role manages writes
CREATE POLICY "job_skills_select" ON job_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "job_skills_insert" ON job_skills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "job_skills_update" ON job_skills FOR UPDATE TO authenticated USING (true);
CREATE POLICY "job_skills_delete" ON job_skills FOR DELETE TO authenticated USING (true);

-- Service role bypass (backend services use service_role key)
CREATE POLICY "skills_service_role" ON skills FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "candidate_skills_service_role" ON candidate_skills FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "job_skills_service_role" ON job_skills FOR ALL TO service_role USING (true) WITH CHECK (true);
