-- Smart Resume tables
-- Normalized career profile data owned by candidates, replacing the flat resume_metadata JSONB.
-- All tables prefixed with smart_resume_ to clearly delineate this data domain.

-- ── 1. smart_resume_profiles ────────────────────────────────────────────────
-- Master record per candidate (1:1)

CREATE TABLE smart_resume_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL UNIQUE REFERENCES candidates(id) ON DELETE CASCADE,
    professional_summary TEXT,
    headline TEXT,
    total_years_experience NUMERIC(4,1),
    highest_degree TEXT,
    completion_score INTEGER NOT NULL DEFAULT 0,
    last_ai_parse_at TIMESTAMPTZ,
    source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_srp_candidate ON smart_resume_profiles(candidate_id);
CREATE INDEX idx_srp_deleted ON smart_resume_profiles(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE smart_resume_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "srp_select" ON smart_resume_profiles
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "srp_service_role" ON smart_resume_profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ── 2. smart_resume_experiences ─────────────────────────────────────────────
-- Work history entries

CREATE TABLE smart_resume_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES smart_resume_profiles(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT,
    start_date TEXT,
    end_date TEXT,
    is_current BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    achievements JSONB NOT NULL DEFAULT '[]',
    visible_to_matching BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_sre_profile ON smart_resume_experiences(profile_id);
CREATE INDEX idx_sre_deleted ON smart_resume_experiences(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE smart_resume_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sre_select" ON smart_resume_experiences
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "sre_service_role" ON smart_resume_experiences
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ── 3. smart_resume_projects ────────────────────────────────────────────────
-- Projects, optionally linked to an experience

CREATE TABLE smart_resume_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES smart_resume_profiles(id) ON DELETE CASCADE,
    experience_id UUID REFERENCES smart_resume_experiences(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    outcomes TEXT,
    url TEXT,
    start_date TEXT,
    end_date TEXT,
    skills_used JSONB NOT NULL DEFAULT '[]',
    visible_to_matching BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_srpr_profile ON smart_resume_projects(profile_id);
CREATE INDEX idx_srpr_experience ON smart_resume_projects(experience_id) WHERE experience_id IS NOT NULL;
CREATE INDEX idx_srpr_deleted ON smart_resume_projects(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE smart_resume_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "srpr_select" ON smart_resume_projects
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "srpr_service_role" ON smart_resume_projects
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ── 4. smart_resume_tasks ───────────────────────────────────────────────────
-- Granular tasks linked to experience and/or project

CREATE TABLE smart_resume_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES smart_resume_profiles(id) ON DELETE CASCADE,
    experience_id UUID REFERENCES smart_resume_experiences(id) ON DELETE SET NULL,
    project_id UUID REFERENCES smart_resume_projects(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    impact TEXT,
    skills_used JSONB NOT NULL DEFAULT '[]',
    visible_to_matching BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_srt_profile ON smart_resume_tasks(profile_id);
CREATE INDEX idx_srt_experience ON smart_resume_tasks(experience_id) WHERE experience_id IS NOT NULL;
CREATE INDEX idx_srt_project ON smart_resume_tasks(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_srt_deleted ON smart_resume_tasks(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE smart_resume_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "srt_select" ON smart_resume_tasks
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "srt_service_role" ON smart_resume_tasks
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ── 5. smart_resume_education ───────────────────────────────────────────────

CREATE TABLE smart_resume_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES smart_resume_profiles(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree TEXT,
    field_of_study TEXT,
    start_date TEXT,
    end_date TEXT,
    gpa TEXT,
    honors TEXT,
    visible_to_matching BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_sred_profile ON smart_resume_education(profile_id);
CREATE INDEX idx_sred_deleted ON smart_resume_education(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE smart_resume_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sred_select" ON smart_resume_education
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "sred_service_role" ON smart_resume_education
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ── 6. smart_resume_certifications ──────────────────────────────────────────

CREATE TABLE smart_resume_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES smart_resume_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuer TEXT,
    date_obtained TEXT,
    expiry_date TEXT,
    credential_url TEXT,
    visible_to_matching BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_src_profile ON smart_resume_certifications(profile_id);
CREATE INDEX idx_src_deleted ON smart_resume_certifications(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE smart_resume_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "src_select" ON smart_resume_certifications
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "src_service_role" ON smart_resume_certifications
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ── 7. smart_resume_skills ──────────────────────────────────────────────────

CREATE TABLE smart_resume_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES smart_resume_profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT,
    proficiency TEXT,
    years_used NUMERIC(4,1),
    visible_to_matching BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT chk_srs_proficiency CHECK (
        proficiency IS NULL OR proficiency IN ('expert', 'advanced', 'intermediate', 'beginner')
    ),
    CONSTRAINT uq_srs_profile_name UNIQUE (profile_id, name)
);

CREATE INDEX idx_srs_profile ON smart_resume_skills(profile_id);
CREATE INDEX idx_srs_skill ON smart_resume_skills(skill_id) WHERE skill_id IS NOT NULL;
CREATE INDEX idx_srs_deleted ON smart_resume_skills(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE smart_resume_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "srs_select" ON smart_resume_skills
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "srs_service_role" ON smart_resume_skills
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ── 8. smart_resume_publications ────────────────────────────────────────────

CREATE TABLE smart_resume_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES smart_resume_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    publication_type TEXT,
    publisher TEXT,
    url TEXT,
    published_date TEXT,
    description TEXT,
    visible_to_matching BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT chk_srpub_type CHECK (
        publication_type IS NULL OR publication_type IN ('paper', 'article', 'talk', 'patent', 'book', 'other')
    )
);

CREATE INDEX idx_srpub_profile ON smart_resume_publications(profile_id);
CREATE INDEX idx_srpub_deleted ON smart_resume_publications(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE smart_resume_publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "srpub_select" ON smart_resume_publications
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "srpub_service_role" ON smart_resume_publications
    FOR ALL TO service_role USING (true) WITH CHECK (true);
