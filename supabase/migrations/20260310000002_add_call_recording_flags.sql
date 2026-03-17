-- =============================================================================
-- Migration: Add per-call recording flags, remove call_type-level columns
-- Phase 53: Per-Call Recording & AI Controls
-- =============================================================================
--
-- Recording consent is now always required when recording_enabled = true
-- (per-call flag), so the call_types.requires_recording_consent column is
-- redundant and removed.
--
-- AI analysis is now gated by the creator's subscription tier AND a per-call
-- opt-in flag (ai_analysis_enabled). The call_types.supports_ai_summary column
-- is replaced by this per-call flag enforced at creation time in call-service.
-- =============================================================================

BEGIN;

-- Add per-call recording control flags to calls table
ALTER TABLE calls
    ADD COLUMN recording_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN transcription_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN ai_analysis_enabled BOOLEAN NOT NULL DEFAULT false;

-- Remove call_type-driven behavior columns (replaced by per-call flags above)
ALTER TABLE call_types
    DROP COLUMN IF EXISTS requires_recording_consent,
    DROP COLUMN IF EXISTS supports_ai_summary;

COMMIT;
