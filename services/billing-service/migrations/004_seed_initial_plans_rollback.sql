-- Rollback Migration 004: Remove seeded plans
-- Date: 2026-01-24

-- Remove the seeded plans
DELETE FROM billing.plans WHERE slug IN ('free', 'pro', 'partner');
