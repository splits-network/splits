# Plan: Fix Pricing Data Structure and Display

The database inspection reveals that the `plans` table uses `price_monthly` and `price_annual` (in dollars/units), NOT `price_cents`. The `features` JSON also lacks `annual_price_cents`. The frontend code relies on `price_cents` or `features.annual_price_cents`, causing issues (previously NaN, now potentially 0 or incorrect fallbacks).

### 1. Verification (Backend)

- Check `services/billing-service/src/v2/plans/repository.ts` (or similar) to confirm if it returns raw DB rows or transforms them.
- If it returns raw rows, the frontend receives `price_monthly` and `price_annual`.

### 2. Frontend Updates (`apps/portal`)

#### A. Update Types (`src/components/pricing/types.ts`)

- Add `price_annual?: number;` to the `Plan` interface.
- Mark `price_cents` as optional or remove it if unused.

#### B. Update Pricing Card Logic (`src/components/pricing/pricing-card.tsx`)

- **Fix `isFree` check**:
    ```typescript
    const isFree = plan.price_monthly === 0 || plan.price_monthly === "0"; // Handle string/number
    ```
- **Fix `displayPrice` calculation**:
    - **Annual**:
        - Priority 1: `plan.features.annual_price_cents` (if legacy exists)
        - Priority 2: `plan.price_annual` (divide by 12 for monthly equivalent). _Note: Ensure we handle string conversion if needed._
    - **Monthly**:
        - Priority 1: `plan.price_cents` (legacy, / 100)
        - Priority 2: `plan.price_monthly`.

#### C. Update Subscription Step (`subscription-plan-step.tsx`)

- Ensure `isAnnual` state correctly triggers the re-render.
- Verify `PricingCardGrid` passes `isAnnual` down.

### 3. Data Integrity

- The DB inspection showed `price_monthly` values are "0", "99", "249".
- `price_annual` values are "0", "999", "2499".
- These values are correct, we just need to use them.

### 4. Implementation Details

- Ensure strict type handling (parsing strings to floats if API returns strings (Postgres numeric often returns as string in JS)).
- Update the toggle to actively show the savings if possible (e.g. `(price_monthly * 12 - price_annual)`).

### 5. Final Verification

- Verify "Starter" is Free.
- Verify "Pro" is $99/mo or $83/mo (999/12).
- Verify "Partner" is $249/mo or $208/mo (2499/12).
