# Stripe Balance Events Analysis

## `balance_settings.updated` Event Analysis

### What it provides:

- **Account-level configuration changes** (payout schedules, thresholds)
- **Settlement preferences** (daily vs weekly payouts from Stripe to bank accounts)
- **Payout timing configuration** (automatic vs manual)

### What it DOESN'T provide:

- ❌ **Transaction-specific settlement timing** (when specific invoice funds are available)
- ❌ **Real-time balance available amounts**
- ❌ **Individual payment settlement status**

### Why it won't solve our problem:

Our issue is **transaction-specific**: "When are the funds from invoice X available for transfer?"

`balance_settings.updated` is **account-level**: "What are the general payout settings for this account?"

## Better Alternative: `payout.paid` Events

### What `payout.paid` provides:

- ✅ **Actual fund settlement notification** - when Stripe moves money into available balance
- ✅ **Transaction-specific data** - which payments were included in the payout
- ✅ **Real settlement timing** - not estimated, but actual

### Proposed Implementation:

```typescript
// Additional webhook handler in billing service
private async handlePayoutPaid(payout: Stripe.Payout): Promise<void> {
    // Get all balance transactions included in this payout
    const balanceTransactions = await this.stripe.balanceTransactions.list({
        payout: payout.id,
        limit: 100
    });

    for (const transaction of balanceTransactions.data) {
        if (transaction.type === 'charge' && transaction.source) {
            // Find invoice associated with this charge
            const charge = await this.stripe.charges.retrieve(transaction.source as string);
            if (charge.invoice) {
                // Mark this invoice as funds-available
                await this.supabase
                    .from('placement_invoices')
                    .update({
                        funds_available: true,
                        funds_available_at: new Date().toISOString()
                    })
                    .eq('stripe_invoice_id', charge.invoice);

                // Trigger immediate payout processing for this specific invoice
                await this.eventPublisher.publish('invoice.funds_available', {
                    stripe_invoice_id: charge.invoice
                });
            }
        }
    }
}
```

### Updated `isInvoiceCollectible()` logic:

```typescript
// Check both paid status AND funds availability
return (
    invoice.invoice_status === "paid" &&
    invoice.funds_available === true &&
    new Date() >= new Date(invoice.collectible_at || invoice.paid_at)
);
```

## Recommendation

**Hybrid Approach**: Keep our current 7-day settlement buffer as a **safety net**, but add `payout.paid` webhook handling for **precise settlement detection**.

- **Immediate safety**: 7-day buffer prevents transfers until funds likely available
- **Optimal performance**: `payout.paid` events allow earlier processing when funds actually arrive
- **Reliability**: Falls back to time-based logic if webhook events are missed

This gives us both safety (no failed transfers) and efficiency (process as soon as funds are actually available).
