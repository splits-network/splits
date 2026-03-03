-- ============================================================
-- Fix skills.created_by foreign key constraint
-- Should reference public.users(id), not auth.users(id)
-- ============================================================

-- Drop the incorrect constraint
ALTER TABLE skills
DROP CONSTRAINT IF EXISTS skills_created_by_fkey;

-- Add the correct constraint pointing to public.users
ALTER TABLE skills
ADD CONSTRAINT skills_created_by_fkey
FOREIGN KEY (created_by) REFERENCES public.users(id);
