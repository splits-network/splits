```prompt
## Plan: Recruiter Stripe Subscription in Onboarding Wizard

Implement complete Stripe subscription flow for recruiters during onboarding using **Stripe Elements** for a branded payment experience, with **immediate charges for paid plans** and **no payment collection for Free tier**.

**IMPORTANT**: No trial periods allowed - this would enable gaming of the payout system (sign up, get trial with higher payouts, then cancel).

### Stripe IDs (Staging Environment)

| Plan | Product ID | Monthly Price ID | Annual Price ID |
|------|-----------|-----------------|-----------------|
| Starter (Free) | `prod_TqG19j3McxiOzx` | `price_1SsZVRCBZgvIZNvpOTBq43C9` | `price_1Su0wDCBZgvIZNvpsxQtliAj` |
| Pro ($99/mo) | `prod_TqG112WofMoleO` | `price_1SsZVSCBZgvIZNvpXmpImjMe` | `price_1Su0viCBZgvIZNvpl4kgNdik` |
| Partner ($249/mo) | `prod_TqG1jw9PJgwWnZ` | `price_1SsZVSCBZgvIZNvpNZse65k2` | `price_1Su0vOCBZgvIZNvp850nit2P` |

### Steps

1. ✅ **Seed database with final pricing copy and Stripe products** — Updated `public.plans` with features JSONB, Stripe IDs, and `trial_days = 0` for all plans. Added `stripe_price_id_monthly` and `stripe_price_id_annual` columns.

2. ✅ **Create reusable `PricingCard` component** — Extracted from pricing page into `apps/portal/src/components/pricing/` with `plan`, `isSelected`, `onSelect`, `isAnnual`, `variant` props.

3. ✅ **Install Stripe Elements and create payment form component** — Added `@stripe/stripe-js` and `@stripe/react-stripe-js`. Created `PaymentForm` component with DaisyUI styling.

4. ✅ **Add subscription creation endpoints with SetupIntent flow** — In billing-service:
   - `POST /v2/subscriptions/setup-intent` — Create Stripe Customer + SetupIntent, return `client_secret`
   - `POST /v2/subscriptions/activate` — After payment method confirmed, create Subscription immediately (no trial)

5. ✅ **Rebuild `subscription-plan-step.tsx` with two-phase flow** — Complete implementation:
   - **Phase 1**: Plan selection with `PricingCard` components
   - **Phase 2** (paid plans only): Show `PaymentForm` with Stripe Elements, collect card, charge immediately
   - **Free tier**: Skip Phase 2, proceed directly to profile step

6. ✅ **Update onboarding provider and completion flow** — Extended with `selectedPlanId`, `selectedPlanTier`, `stripeCustomerId`, `subscriptionId` state.

7. 🔄 **Migrate webhook processing to V2** — Pending - Update billing-service webhooks to handle:
   - `customer.subscription.created` — Confirm subscription record
   - `customer.subscription.updated` — Sync status changes
   - `customer.subscription.deleted` — Mark canceled
   - `invoice.payment_failed` — Handle failed payments

### Further Considerations

1. **Trial-to-paid conversion UX?** ~~When trial ends, Stripe auto-charges the card on file.~~ **NOT APPLICABLE** - No trials offered. Immediate charge on subscription.

2. **Upgrade/downgrade flow?** User may want to change plans later from billing page. Same Elements form can be reused, but need `PATCH /v2/subscriptions/:id` to call Stripe's subscription update API with proration. **Recommend: Include in scope** since billing page already exists.

```
