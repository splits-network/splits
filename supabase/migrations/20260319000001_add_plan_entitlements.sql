-- Add entitlements JSONB column to plans table
-- Entitlements drive feature gating (separate from features which is marketing copy for pricing cards)

ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS entitlements jsonb DEFAULT '{}'::jsonb;

-- Populate entitlements per tier

UPDATE public.plans SET entitlements = '{
  "messaging_initiations_per_month": 5,
  "max_saved_candidates": 10,
  "max_saved_jobs": 10,
  "max_referral_codes": 1,
  "email_notifications": false,
  "email_integration": false,
  "calendar_integration": false,
  "early_access_roles": false,
  "priority_roles": false,
  "ai_match_scoring": false,
  "ai_call_summary": false,
  "call_recording": false,
  "call_transcription": false,
  "firm_creation": false,
  "api_access": false,
  "advanced_analytics": false,
  "data_export": false,
  "marketplace_priority": "standard"
}'::jsonb
WHERE tier = 'starter';

UPDATE public.plans SET entitlements = '{
  "messaging_initiations_per_month": -1,
  "max_saved_candidates": 100,
  "max_saved_jobs": 50,
  "max_referral_codes": 5,
  "email_notifications": true,
  "email_integration": true,
  "calendar_integration": true,
  "early_access_roles": true,
  "priority_roles": false,
  "ai_match_scoring": false,
  "ai_call_summary": false,
  "call_recording": true,
  "call_transcription": true,
  "firm_creation": false,
  "api_access": false,
  "advanced_analytics": true,
  "data_export": true,
  "marketplace_priority": "boosted"
}'::jsonb
WHERE tier = 'pro';

UPDATE public.plans SET entitlements = '{
  "messaging_initiations_per_month": -1,
  "max_saved_candidates": -1,
  "max_saved_jobs": -1,
  "max_referral_codes": -1,
  "email_notifications": true,
  "email_integration": true,
  "calendar_integration": true,
  "early_access_roles": true,
  "priority_roles": true,
  "ai_match_scoring": true,
  "ai_call_summary": true,
  "call_recording": true,
  "call_transcription": true,
  "firm_creation": true,
  "api_access": true,
  "advanced_analytics": true,
  "data_export": true,
  "marketplace_priority": "featured"
}'::jsonb
WHERE tier = 'partner';
