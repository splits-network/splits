-- Create pre_screen_question_templates table
-- Stores reusable pre-screen question templates (system defaults + company custom)

CREATE TABLE pre_screen_question_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    label TEXT NOT NULL,
    question TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'yes_no',
    is_required BOOLEAN NOT NULL DEFAULT true,
    options JSONB DEFAULT '[]',
    disclaimer TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_by TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_system_or_company CHECK (
        (is_system = true AND company_id IS NULL) OR
        (is_system = false AND company_id IS NOT NULL)
    ),
    CONSTRAINT chk_question_type CHECK (
        question_type IN ('text', 'yes_no', 'select', 'multi_select')
    ),
    CONSTRAINT chk_category CHECK (
        category IN ('compliance', 'experience', 'logistics', 'role_info')
    )
);

CREATE INDEX idx_psqt_category ON pre_screen_question_templates(category);
CREATE INDEX idx_psqt_company ON pre_screen_question_templates(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_psqt_system ON pre_screen_question_templates(is_system) WHERE is_system = true;

-- RLS
ALTER TABLE pre_screen_question_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "psqt_select" ON pre_screen_question_templates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "psqt_insert" ON pre_screen_question_templates
    FOR INSERT TO authenticated WITH CHECK (is_system = false);

CREATE POLICY "psqt_delete" ON pre_screen_question_templates
    FOR DELETE TO authenticated USING (is_system = false);

CREATE POLICY "psqt_service_role" ON pre_screen_question_templates
    FOR ALL TO service_role USING (true) WITH CHECK (true);
