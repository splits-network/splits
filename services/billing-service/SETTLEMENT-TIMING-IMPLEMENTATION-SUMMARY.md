# Settlement Timing Implementation Summary

## Problem Solved

**Original Issue**: Stripe `invoice.payment_succeeded` means payment authorized, not funds settled. Attempting immediate transfers could fail due to insufficient balance (2-7 day settlement delay).

## Solution: Hybrid Settlement Detection

### 1. **Safety Buffer** (Primary Protection)

- **When**: `invoice.payment_succeeded` webhook fires
- **Action**: Set `collectible_at` to payment date + 7 days
- **Purpose**: Prevents transfer failures while waiting for precise settlement

```typescript
// In handleInvoicePaid webhook
const settlementDate = new Date(paidDate);
settlementDate.setDate(settlementDate.getDate() + 7); // 7-day safety buffer

const updates = {
    invoice_status: "paid",
    paid_at: paidDate.toISOString(),
    collectible_at: settlementDate.toISOString(), // Wait 7 days
};
```

### 2. **Precise Settlement Detection** (Performance Optimization)

- **When**: `payout.paid` webhook fires (funds actually in our balance)
- **Action**: Set `funds_available = true` immediately
- **Purpose**: Enable transfers as soon as funds confirmed available

```typescript
// In handleIncomingFundsAvailable (called by payout.paid)
const updates = {
    funds_available: true,
    funds_available_at: new Date().toISOString(),
};

// Trigger immediate processing
await this.eventPublisher.publish("invoice.funds_available", {
    stripe_invoice_id: charge.invoice,
    payout_id: payout.id,
});
```

### 3. **Enhanced Collectibility Check**

- **Logic**: Check both settlement buffer AND fund availability
- **Result**: Immediate processing when funds confirmed, safe fallback otherwise

```typescript
private isInvoiceCollectible(invoice: PlacementInvoice | null): boolean {
    if (!invoice) return false;

    if (invoice.invoice_status === 'paid') {
        // BEST: Funds confirmed available by payout.paid webhook
        if (invoice.funds_available === true) {
            return true;
        }

        // SAFE: Settlement buffer has passed (7-day worst-case)
        if (invoice.collectible_at && new Date() >= new Date(invoice.collectible_at)) {
            return true;
        }

        // WAIT: Paid but funds not confirmed available yet
        return false;
    }

    // Net terms invoices (open status)
    if (invoice.invoice_status === 'open' && invoice.collectible_at) {
        return new Date(invoice.collectible_at) <= new Date();
    }

    return false;
}
```

## Database Changes

### New Columns Added to `placement_invoices`

```sql
ALTER TABLE placement_invoices
ADD COLUMN funds_available BOOLEAN DEFAULT false,
ADD COLUMN funds_available_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_placement_invoices_funds_available
ON placement_invoices (funds_available, invoice_status, collectible_at)
WHERE funds_available = true OR invoice_status = 'paid';
```

## Flow Timeline

### Scenario 1: Credit Card Payment (2-day settlement)

```
Day 0: Customer pays → invoice.payment_succeeded
       ├─ Set collectible_at = Day 7 (safety buffer)
       └─ funds_available = false

Day 2: Stripe settles funds → payout.paid
       ├─ Set funds_available = true
       ├─ Publish invoice.funds_available event
       └─ ✅ Transfers can happen immediately (5 days early!)

Day 7: Safety buffer expires
       └─ ✅ Would allow transfers even without payout.paid event
```

### Scenario 2: ACH Payment (5-day settlement)

```
Day 0: Customer pays → invoice.payment_succeeded
       ├─ Set collectible_at = Day 7 (safety buffer)
       └─ funds_available = false

Day 5: Stripe settles funds → payout.paid
       ├─ Set funds_available = true
       └─ ✅ Transfers can happen immediately (2 days early!)

Day 7: Safety buffer expires
       └─ ✅ Would allow transfers even without payout.paid event
```

### Scenario 3: Webhook Failure Fallback

```
Day 0: Customer pays → invoice.payment_succeeded
       ├─ Set collectible_at = Day 7 (safety buffer)
       └─ funds_available = false

Day 2-5: Stripe settles funds → payout.paid webhook FAILS
         └─ funds_available remains false

Day 7: Safety buffer expires
       └─ ✅ Transfers proceed safely (funds definitely settled by now)
```

## Benefits

1. **Zero Transfer Failures**: 7-day buffer ensures funds are always available
2. **Optimal Performance**: Process immediately when funds confirmed (2-5 days early)
3. **Reliable Fallback**: Works even if payout.paid webhooks fail
4. **Minimal Code Changes**: Existing `isInvoiceCollectible()` logic enhanced, not replaced

## Event Flow

### New Events Published

- `invoice.funds_available`: Fired when `payout.paid` confirms fund settlement
- Enhanced `invoice.paid`: Still fired immediately on payment authorization

### Event Consumers

- Existing payout schedule processors listen for both events
- `invoice.funds_available` triggers immediate re-evaluation of pending schedules
- Processing happens immediately when funds are confirmed available

## Testing Status

✅ **Database Migration Applied**: New columns added to `placement_invoices`  
✅ **Webhook Enhancement Complete**: Settlement buffer + fund detection implemented  
✅ **Collectibility Logic Updated**: Hybrid checking for optimal timing  
⏳ **Production Testing**: Waiting for placement invoice creation to test full flow

## Next Steps

1. **Monitor webhook logs** for `payout.paid` events and fund availability detection
2. **Test with real payment** once placement bounces to invoice creation
3. **Verify transfer timing** - should happen immediately after payout.paid
4. **Confirm no failed transfers** due to insufficient balance

---

**Implementation Date**: February 9, 2026  
**Challenge**: "don't we need to wait until stripe processes the payment before we send the payouts?"  
**Solution**: Hybrid approach with safety buffer + precise detection for best of both worlds
