# Stripe Balance Events Comparison

## `balance.available` vs `payout.paid` for Settlement Detection

### `balance.available` Event

- **Fires**: When available balance changes (funds become available for use)
- **Granularity**: Real-time balance updates
- **Data**: Exact available amounts per currency
- **Timing**: Immediate when funds settle (not batched)

### `payout.paid` Event

- **Fires**: When Stripe pays out to external accounts (bank transfers)
- **Granularity**: Batched transactions in payout
- **Data**: Which specific transactions were paid out
- **Timing**: When funds leave our Stripe account

## Key Insight

`balance.available` tells us when funds **enter** our available balance.
`payout.paid` tells us when funds **leave** our available balance.

For our use case (knowing when customer payments are available for transfers), **`balance.available` is more direct and precise**.

## Potential Implementation

### Option A: Replace `payout.paid` with `balance.available`

```typescript
case 'balance.available':
    await this.handleBalanceAvailable(event.data.object as Stripe.Balance);
    break;
```

### Option B: Use Both Events

- `balance.available`: Fast detection of fund availability
- `payout.paid`: Backup validation via transaction association

## Questions to Resolve

1. **Does `balance.available` give us enough detail** to associate balance changes with specific invoices?
2. **How frequently does it fire** - too noisy for our webhook processing?
3. **Is it reliable** - are there edge cases where it might not fire?

## Next Steps

1. Examine `balance.available` event structure
2. Compare precision vs our current hybrid approach
3. Determine if it's worth switching or adding as complement
