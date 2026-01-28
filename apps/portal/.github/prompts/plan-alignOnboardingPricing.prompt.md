# Plan: Align Onboarding Pricing with Portal Billing

The onboarding flow uses a broken pricing implementation with incorrect types (`price_cents`, missing annual prices). The portal billing page (`src/app/portal/billing/components/plan-change-modal.tsx`) has a working implementation.

### 1. Fix Shared Types (`src/components/pricing/types.ts`)

- Update `Plan` interface to match the working version in `plan-change-modal.tsx`:
    - Add `price_annual: number;`
    - Ensure `price_monthly` is number.
    - Remove `price_cents`.
    - Add optional `stripe_price_id_monthly` / `stripe_price_id_annual` for reference.

### 2. Fix Pricing Card (`src/components/pricing/pricing-card.tsx`)

- Logic update:
    - Remove `price_cents / 100` logic.
    - Use `plan.price_monthly` and `plan.price_annual` as raw dollar amounts.
    - Implement simpler annual calculation: `displayPrice = isAnnual ? Math.round(plan.price_annual / 12) : plan.price_monthly`.
    - Fix `isFree` check using `plan.price_monthly === 0`.
- Display update:
    - Ensure formatting matches the dollar values safely.

### 3. Verification

- The `subscription-plan-step.tsx` is already updated to pass `isAnnual`, so these component fixes should automatically fix the step.

### Compatibility Note

- `PricingCardGrid` sorts by `price_cents`. I will update it to sort by `price_monthly`.
