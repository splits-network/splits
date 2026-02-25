-- Update CHECK constraint: replace 'forfeited' with 'cancelled' to match application code.
-- The service layer uses 'cancelled' for admin-cancelled holds, not 'forfeited'.
ALTER TABLE public.escrow_holds DROP CONSTRAINT IF EXISTS valid_hold_status;
ALTER TABLE public.escrow_holds ADD CONSTRAINT valid_hold_status
  CHECK (status IN ('active', 'released', 'cancelled'));

-- Migrate any existing 'forfeited' rows to 'cancelled'
UPDATE public.escrow_holds SET status = 'cancelled' WHERE status = 'forfeited';
