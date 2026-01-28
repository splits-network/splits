# Plan: Fix Onboarding Flow and Subscription Pricing UI

This plan addresses several key issues: ensuring only recruiters see the subscription step, fixing "NaN" pricing, correcting the grid layout, and adding an annual billing toggle.

### Steps

1.  **Restrict Subscription Step Access:**
    - In [role-selection-step.tsx](apps/portal/src/components/onboarding/steps/role-selection-step.tsx), update `handleRoleSelect` to check the `role`. If it's `'recruiter'`, go to step 2; otherwise, skip to step 3.
    - In [subscription-plan-step.tsx](apps/portal/src/components/onboarding/steps/subscription-plan-step.tsx), enable a `useEffect` redirect to step 3 if `state.role` is not `'recruiter'`.

2.  **Add Annual Billing Toggle:**
    - In [subscription-plan-step.tsx](apps/portal/src/components/onboarding/steps/subscription-plan-step.tsx):
        - Add state: `const [isAnnual, setIsAnnual] = useState(false);`.
        - Insert a daisyUI toggle switch component above the `PricingCardGrid`, labeled "Monthly / Yearly".
        - Pass `isAnnual={isAnnual}` prop to `<PricingCardGrid />`.

3.  **Fix Pricing Logic (NaN Fix):**
    - In [pricing-card.tsx](apps/portal/src/components/pricing/pricing-card.tsx):
        - Update `displayPrice` calculation to safely handle `undefined` or `null` values for `price_cents` / `annual_price_cents`.
        - Fallback logic: Use `plan.price_monthly` if `plan.price_cents` is missing.
        - Ensure `Math.round()` is never called on undefined.

4.  **Fix Grid Layout:**
    - In [pricing-card-grid.tsx](apps/portal/src/components/pricing/pricing-card-grid.tsx):
        - Change `grid-cols-1` to `md:grid-cols-3` inside the class logic for compact variant.
        - Remove `items-start` class from the grid container to allow cards to stretch to equal height.
        - Remove or simplify the plan sorting logic as requested ("don't have to keep current sort").

### Further Considerations

1.  **Safety Check**: Ensure `Plan` type in `types.ts` accurately reflects API response (specifically `price_monthly` vs `price_cents`).
2.  **Toggle UX**: Ensure the annual toggle prominently shows savings (e.g., "Save 20%") if such data is available in `plan.features.annual_savings_text`.
