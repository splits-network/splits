-- =============================================================================
-- Add nullable call_id FK to interviews for Phase 46 migration
-- =============================================================================

-- Nullable FK: interviews can optionally reference a call record
ALTER TABLE interviews
    ADD COLUMN call_id UUID REFERENCES calls(id);

-- Unique partial index: one interview per call (1:1 relationship)
-- Partial index allows multiple NULLs (unmigrated interviews)
CREATE UNIQUE INDEX idx_interviews_call_id ON interviews(call_id)
    WHERE call_id IS NOT NULL;
