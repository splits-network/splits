-- Create placement_payout_transactions table for execution tracking
-- This replaces the 'payouts' table with a cleaner model keyed to placement_splits
-- Migration: 003_create_placement_payout_transactions
-- Date: 2026-01-17

CREATE TABLE IF NOT EXISTS placement_payout_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core references
    placement_split_id UUID NOT NULL REFERENCES placement_splits(id) ON DELETE RESTRICT,
    placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE RESTRICT,
    recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE RESTRICT,
    
    -- Money tracking
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Created, awaiting processing
        'processing',   -- Transfer initiated
        'paid',         -- Successfully paid
        'failed',       -- Transfer failed
        'reversed',     -- Payment reversed/refunded
        'on_hold'       -- Temporarily held
    )),
    
    -- Stripe integration
    stripe_transfer_id TEXT,
    stripe_payout_id TEXT,
    stripe_connect_account_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    
    -- Failure tracking
    failure_reason TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    
    -- Idempotency: one transaction per split
    CONSTRAINT unique_split_transaction UNIQUE (placement_split_id)
);

-- Indexes for common queries
CREATE INDEX idx_payout_transactions_placement ON placement_payout_transactions(placement_id);
CREATE INDEX idx_payout_transactions_recruiter ON placement_payout_transactions(recruiter_id);
CREATE INDEX idx_payout_transactions_status ON placement_payout_transactions(status);
CREATE INDEX idx_payout_transactions_stripe_transfer ON placement_payout_transactions(stripe_transfer_id) WHERE stripe_transfer_id IS NOT NULL;
CREATE INDEX idx_payout_transactions_created_at ON placement_payout_transactions(created_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_placement_payout_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_placement_payout_transaction_updated_at
    BEFORE UPDATE ON placement_payout_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_placement_payout_transaction_updated_at();

-- Comments
COMMENT ON TABLE placement_payout_transactions IS 'Execution tracking for money movement (Stripe transfers) - one transaction per placement split';
COMMENT ON COLUMN placement_payout_transactions.placement_split_id IS 'References the attribution allocation this transaction pays';
COMMENT ON COLUMN placement_payout_transactions.amount IS 'Amount to pay in USD';
COMMENT ON COLUMN placement_payout_transactions.status IS 'Current state of payment processing';
COMMENT ON COLUMN placement_payout_transactions.stripe_transfer_id IS 'Stripe Transfer ID for this payout';
COMMENT ON COLUMN placement_payout_transactions.stripe_payout_id IS 'Stripe Payout ID (when transfer reaches bank)';
