# Seamless Paid Plan Upgrade Flow

## Problem Statement

When a user without a Stripe customer ID or payment method tries to upgrade to a paid plan (Pro or Partner), they see an error: "Payment method and customer ID required for paid plans". 

This is a UX failure - users can't fix this themselves. The platform needs to seamlessly guide users through payment collection when upgrading to paid plans.

## Current State

### Backend: ✅ Complete
All Stripe endpoints exist and work correctly:

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `POST /subscriptions/setup-intent` | Create SetupIntent + Stripe Customer | ✅ Works |
| `POST /subscriptions/activate` | Create subscription with payment method | ✅ Works |
| `PATCH /subscriptions/:id` | Update plan/billing period | ✅ Works |
| `GET /subscriptions/payment-methods` | Fetch card details from Stripe | ✅ Works |

### Frontend: ❌ Gap
The Plan Change Modal (`plan-change-modal.tsx`) directly calls `/subscriptions/activate` without:
1. Checking if user has a payment method
2. Creating a Stripe customer first
3. Collecting payment details for paid plans

### Stripe Components: ✅ Exist
- `PaymentForm` component already exists at `apps/portal/src/app/portal/billing/components/payment-form.tsx`
- Uses Stripe Elements with DaisyUI styling
- Already used on billing page for updating payment methods

## Proposed Solution

### Approach: Extend Plan Change Modal with Inline Payment Collection

When users upgrade to a paid plan without a payment method, show Stripe Elements inline to collect payment before activating the subscription.

### User Flow

```
User clicks "View Plans" → Modal opens with plan cards
                              ↓
User selects paid plan (Pro or Partner)
                              ↓
         ┌─────────────────────────────────────┐
         │ Check: Does user have payment method? │
         └─────────────────────────────────────┘
                    ↓                    ↓
                  YES                   NO
                    ↓                    ↓
         Show "Use existing card"    Show payment form section
         with option to change       (Stripe Elements)
                    ↓                    ↓
         User clicks "Confirm"       User enters card details
                    ↓                    ↓
         Call PATCH or activate      Call setup-intent → 
         with existing payment       Confirm SetupIntent →
                                     Call activate with payment_method_id
                    ↓                    ↓
                 Success → Refresh billing page
```

### Implementation Details

#### 1. Add State Variables

```typescript
// Payment flow state
const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean | null>(null);
const [needsPaymentCollection, setNeedsPaymentCollection] = useState(false);
const [setupIntent, setSetupIntent] = useState<{
    client_secret: string;
    customer_id: string;
} | null>(null);
const [paymentLoading, setPaymentLoading] = useState(false);
```

#### 2. Check Payment Method on Modal Open

```typescript
// Add to fetchPlans or create separate function
const checkPaymentMethod = async () => {
    try {
        const response = await client.get("/subscriptions/payment-methods");
        setHasPaymentMethod(response.data?.has_payment_method ?? false);
    } catch {
        setHasPaymentMethod(false);
    }
};
```

#### 3. Handle Plan Selection for Paid Plans

```typescript
const handlePlanSelect = async (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find(p => p.id === planId);
    
    // Check if paid plan and no payment method
    if (plan && plan.price_monthly > 0 && !hasPaymentMethod) {
        setNeedsPaymentCollection(true);
        
        // Create setup intent to prepare for payment collection
        const response = await client.post("/subscriptions/setup-intent", {
            plan_id: planId,
        });
        setSetupIntent(response.data);
    } else {
        setNeedsPaymentCollection(false);
    }
};
```

#### 4. Show Payment Form Section

When `needsPaymentCollection` is true, show Stripe PaymentElement:

```tsx
{needsPaymentCollection && setupIntent && (
    <div className="mt-6 p-4 bg-base-200 rounded-lg">
        <h3 className="font-semibold mb-4">
            <i className="fa-duotone fa-regular fa-credit-card mr-2"></i>
            Add Payment Method
        </h3>
        <p className="text-sm text-base-content/70 mb-4">
            A payment method is required for paid plans. Your card will be charged 
            {formatPrice(newPrice)} when you confirm.
        </p>
        <Elements stripe={stripePromise} options={{ clientSecret: setupIntent.client_secret }}>
            <PaymentElementForm 
                onSuccess={handlePaymentSuccess}
                onError={setError}
            />
        </Elements>
    </div>
)}
```

#### 5. Handle Payment Success → Activate

```typescript
const handlePaymentSuccess = async (paymentMethodId: string) => {
    try {
        setSubmitting(true);
        
        await client.post("/subscriptions/activate", {
            plan_id: selectedPlanId,
            billing_period: billingPeriod,
            payment_method_id: paymentMethodId,
            customer_id: setupIntent?.customer_id,
        });
        
        onPlanChanged();
        onClose();
    } catch (err: any) {
        setError(err.message || "Failed to activate subscription");
    } finally {
        setSubmitting(false);
    }
};
```

#### 6. Update Confirm Button Logic

```typescript
// Confirm button should be disabled if:
// - Paid plan selected AND needs payment collection (payment form handles submission)
// - No plan selected
// - Submitting

const confirmDisabled = 
    submitting || 
    !selectedPlanId ||
    (needsPaymentCollection && !paymentMethodCollected);
```

### Files to Modify

| File | Changes |
|------|---------|
| `apps/portal/src/app/portal/billing/components/plan-change-modal.tsx` | Add payment collection flow, integrate PaymentForm |
| (possibly) `apps/portal/src/app/portal/billing/components/payment-form.tsx` | Minor adjustments if needed for reuse |

### No Backend Changes Required

All required endpoints already exist and function correctly.

## Edge Cases to Handle

1. **Free plan selected** → Skip payment entirely, call activate directly
2. **User already has payment method + selects paid plan** → Use existing card, show confirmation
3. **User wants to use different card** → Provide "Use different card" option
4. **Setup intent creation fails** → Show error, allow retry
5. **Payment fails** → Show Stripe error message, allow retry
6. **User cancels mid-payment** → Reset state, no charges made
7. **Downgrade from paid to free** → No payment needed, just update plan

## Success Criteria

- [x] User can upgrade from Free to Pro without seeing technical error messages
- [x] Payment collection happens seamlessly within the modal
- [x] User can complete upgrade in single flow (no page navigation)
- [x] Free plan selection never triggers payment collection
- [x] Users with existing payment methods can upgrade without re-entering card
- [x] Clear feedback on what will be charged and when

## Testing Scenarios

1. New user (no subscription, no Stripe customer) → Free plan ✅
2. New user (no subscription, no Stripe customer) → Pro plan ✅
3. Free user (has subscription, no payment method) → Pro plan ✅
4. Pro user (has subscription, has payment method) → Partner plan ✅
5. Pro user (has subscription, has payment method) → Free plan (downgrade) ✅
6. Payment fails (declined card) → Shows error, allows retry ✅

## Implementation Status: ✅ COMPLETE

**Completed January 27, 2026**

### What was implemented:
- 3-step wizard flow: Select Plan → Payment (if needed) → Confirm
- `checkPaymentMethod()` - Checks if user has existing payment method
- `createSetupIntent()` - Creates Stripe SetupIntent for payment collection
- Payment form integrated using existing `StripeProvider` and `PaymentForm` components
- Smart routing: Free plans skip payment, paid plans with existing card skip payment form
- Clear price preview and change summary on confirm step
- Error handling and loading states throughout

### Database migrations applied:
- Added `billing_period` column to subscriptions table
- Added `recruiter_id` to subscription records
- Backfilled existing subscription data
