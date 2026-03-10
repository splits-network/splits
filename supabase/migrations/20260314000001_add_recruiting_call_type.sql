-- Add recruiting_call to call_types lookup table
INSERT INTO call_types (slug, label, default_duration_minutes, requires_recording_consent, supports_ai_summary) VALUES
    ('recruiting_call', 'Recruiting Call', 30, true, true)
ON CONFLICT (slug) DO NOTHING;
