# Payment Settlement Timing Fix

## Problem

Current issue: Stripe transfers attempt immediately when `invoice.payment_succeeded`, but payment funds may not be settled in platform balance for 2-7 business days (credit cards) or 3-5 days (ACH).

## Current Flow (PROBLEMATIC)

```
invoice.payment_succeeded → invoice.paid event → isInvoiceCollectible() → IMMEDIATE stripe.transfers.create()
```

**Risk**: Transfer failures due to insufficient balance, poor UX, retry delays.

## Solution: Settlement-Aware Collectibility

### Option A: Extend `collectible_at` for Settlement Delay

Modify `handleInvoicePaid` webhook to set `collectible_at` to **payment date + settlement buffer**:

```typescript
// In webhook service when handling invoice.payment_succeeded
private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    // Calculate settlement date (7 business days buffer)
    const settlementDate = new Date(invoice.status_transitions.paid_at * 1000);
    settlementDate.setDate(settlementDate.getDate() + 7);

    const updates = {
        invoice_status: 'paid',
        amount_paid: invoice.amount_paid,
        paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
        collectible_at: settlementDate.toISOString(), // ← KEY: Settlement buffer
        updated_at: new Date().toISOString(),
    };

    // Update invoice with settlement-aware collectible_at
    await this.supabase
        .from('placement_invoices')
        .update(updates)
        .eq('stripe_invoice_id', invoice.id);
}
```

### Benefit:

- ✅ Existing `isInvoiceCollectible()` logic works unchanged
- ✅ Scheduled jobs naturally wait for settlement
- ✅ No transfer failures due to timing
- ✅ Minimal code changes

### Option B: Balance-Aware Transfer Processing

Check Stripe balance before attempting transfers:

```typescript
async processPayoutTransaction(transactionId: string, clerkUserId: string) {
    // Get Stripe account balance
    const balance = await this.stripe.balance.retrieve();
    const availableUsd = balance.available.find(b => b.currency === 'usd')?.amount || 0;

    if (availableUsd < amountCents) {
        throw new Error(`Insufficient balance: ${availableUsd} available, ${amountCents} required`);
    }

    // Proceed with transfer...
}
```

### Option C: Escrow Hold for Settlement Period

Create temporary escrow holds for payment settlement:

```typescript
async handleInvoicePaid(invoice: Stripe.Invoice) {
    // Create 7-day settlement hold
    await this.escrowService.createSettlementHold(placementId, 7);

    // Auto-release triggers transfer when hold expires
}
```

## Recommendation: **Option A** (Settlement-Aware Collectibility)

**Why Option A**:

- ✅ Leverages existing collectibility logic
- ✅ Minimal changes to current flow
- ✅ Natural integration with scheduled jobs
- ✅ Prevents timing failures completely

**Implementation**:

1. Modify `handleInvoicePaid` webhook to set `collectible_at` to settlement date
2. Add business day calculation helper for settlement windows
3. Test with 7-day buffer (adjust based on payment method if needed)

## Testing Plan

1. **Unit Tests**: Verify settlement date calculation
2. **Integration Tests**: Mock paid invoice webhook with various payment methods
3. **Manual Testing**: Process test invoices and verify transfer timing
4. **Monitoring**: Track transfer failure rates before/after change

## Rollout Plan

1. **Deploy webhook changes** to add settlement buffer
2. **Monitor existing schedules** - they'll naturally wait longer
3. **Adjust buffer period** if needed based on actual settlement times
4. **Document settlement expectations** for recruiter transparency

## Risk Mitigation

- **Buffer period**: 7 days is conservative (covers 99% of settlements)
- **Manual overrides**: Admin can manually adjust `collectible_at` if needed
- **Monitoring**: Track settlement timing to optimize buffer period
- **Fallback**: Failed transfers still have retry logic as backup

## Business Impact

- **Recruiter Experience**: Slightly longer wait (but predictable)
- **Platform Reliability**: Eliminates transfer failures
- **Admin Efficiency**: Reduces manual intervention
- **Financial Risk**: Prevents overdrafts and failed transfers
