# Stripe Integration Implementation Plan

## Current State Analysis

### ✅ What's Already Built
- **V2 Billing Service**: Complete with plans, subscriptions, payouts domains
- **Database Schema**: `plans`, `subscriptions`, `payouts`, `placement_splits`, `placement_payout_transactions`
- **API Endpoints**: V2 CRUD for all billing resources
- **Payout Architecture**: 4-layer canonical payout system (Phase 6 complete)
- **Commission Structure**: 5-role commission system implemented
- **UI Placeholders**: Billing page with "Coming Soon" placeholders

### ❌ What's Missing
- **Stripe Integration**: No actual Stripe API integration in V2 services
- **Webhook Handling**: V1 webhook code exists but needs V2 migration
- **Frontend Flows**: No Stripe Checkout, payment method management
- **Plan Data**: No actual plans in database
- **Subscription Creation**: Onboarding step is placeholder

---

## Implementation Phases

### Phase 1: Foundation & Plans Setup (Week 1)
**Goal**: Get basic subscription infrastructure working

#### 1.1 Database Seeding
```sql
-- Seed initial plans
INSERT INTO plans (name, slug, description, price_cents, currency, billing_interval, features, status) VALUES
('Free', 'free', 'Free plan for new recruiters', 0, 'usd', 'monthly', '{"job_access": "limited", "commission_rate": 20, "support": "community"}', 'active'),
('Pro', 'pro', 'Professional plan for active recruiters', 9900, 'usd', 'monthly', '{"job_access": "full", "commission_rate": 30, "support": "email"}', 'active'),
('Partner', 'partner', 'Premium plan for high-volume recruiters', 24900, 'usd', 'monthly', '{"job_access": "priority", "commission_rate": 40, "support": "priority"}', 'active');
```

#### 1.2 Stripe Product/Price Setup
```typescript
// services/billing-service/src/v2/plans/stripe-sync.ts
export class StripePlanSync {
  async createStripeProducts() {
    // Create Stripe products and prices
    // Update plans table with stripe_price_id
  }
}
```

#### 1.3 Environment Configuration
```bash
# Add to all environments
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
```

### Phase 2: V2 Stripe Service Integration (Week 1-2)
**Goal**: Replace placeholder subscription logic with real Stripe integration

#### 2.1 Stripe Service Layer
```typescript
// services/billing-service/src/v2/shared/stripe.ts
export class StripeService {
  async createCheckoutSession(planId: string, userId: string): Promise<string>
  async createCustomer(userEmail: string, userName: string): Promise<string>
  async cancelSubscription(stripeSubId: string): Promise<void>
  async updateSubscription(stripeSubId: string, newPriceId: string): Promise<void>
}
```

#### 2.2 Update Subscription Service
```typescript
// services/billing-service/src/v2/subscriptions/service.ts
export class SubscriptionServiceV2 {
  async createCheckoutSession(planId: string, clerkUserId: string): Promise<{ checkout_url: string }>
  async handleSuccessfulPayment(stripeSessionId: string): Promise<Subscription>
  async cancelSubscription(id: string, clerkUserId: string): Promise<Subscription>
}
```

#### 2.3 New API Endpoints
```typescript
// Add to billing service V2 routes
POST /v2/subscriptions/checkout-session
POST /v2/subscriptions/portal-session
GET /v2/subscriptions/me  // Current user's subscription
```

### Phase 3: Webhook Migration to V2 (Week 2)
**Goal**: Replace V1 webhook handling with proper V2 event processing

#### 3.1 V2 Webhook Domain
```typescript
// services/billing-service/src/v2/webhooks/
├── types.ts           // Webhook event types
├── repository.ts      // Webhook log storage
├── service.ts         // V2 webhook processing
└── handlers/
    ├── subscription.ts  // Subscription lifecycle
    ├── payment.ts      // Payment events
    └── connect.ts      // Connect account events
```

#### 3.2 Event Processing
```typescript
export class WebhookServiceV2 {
  async handleSubscriptionCreated(event: Stripe.Event): Promise<void>
  async handleSubscriptionUpdated(event: Stripe.Event): Promise<void>
  async handleSubscriptionDeleted(event: Stripe.Event): Promise<void>
  async handlePaymentSucceeded(event: Stripe.Event): Promise<void>
  async handlePaymentFailed(event: Stripe.Event): Promise<void>
}
```

### Phase 4: Frontend Integration (Week 2-3)
**Goal**: Build complete subscription management UI

#### 4.1 Onboarding Step Update
```tsx
// apps/portal/src/components/onboarding/steps/subscription-plan-step.tsx
export function SubscriptionPlanStep() {
  // Real plan selection with Stripe Checkout
  // Plan comparison cards
  // Stripe Checkout integration
}
```

#### 4.2 Billing Management Page
```tsx
// apps/portal/src/app/portal/billing/page.tsx
export default function BillingPage() {
  return (
    <div>
      <CurrentPlanSection />      // Active subscription details
      <PaymentMethodSection />    // Stripe payment methods
      <BillingHistorySection />   // Invoice history
      <UsageMetricsSection />     // Commission tracking
    </div>
  )
}
```

#### 4.3 Plan Upgrade/Downgrade Flow
```tsx
// apps/portal/src/app/portal/billing/change-plan/page.tsx
export default function ChangePlanPage() {
  // Plan comparison
  // Upgrade/downgrade logic
  // Proration explanation
}
```

#### 4.4 API Client Integration
```tsx
// V2 API Client Pattern - Use this pattern in all billing components
const { getToken } = useAuth();

// Load subscription data
const loadBillingData = async () => {
    const token = await getToken();
    if (!token) return;
    
    const client = createAuthenticatedClient(token);
    
    // Get current subscription using V2 endpoints
    const subscription = await client.get('/subscriptions/me');
    const plans = await client.get('/plans', { params: { active: true } });
};

// Create subscription directly (no Stripe checkout)
const handleUpgrade = async (planId: string) => {
    const token = await getToken();
    if (!token) return;
    
    const client = createAuthenticatedClient(token);
    
    // Create new subscription
    await client.post('/subscriptions', {
        plan_id: planId,
        status: 'active'
    });
};

// Update existing subscription
const handlePlanChange = async (subscriptionId: string, planId: string) => {
    const token = await getToken();
    if (!token) return;
    
    const client = createAuthenticatedClient(token);
    
    // Update subscription plan
    await client.patch(`/subscriptions/${subscriptionId}`, {
        plan_id: planId,
        status: 'active'
    });
};

// Cancel subscription (downgrade to free)
const handleCancel = async (subscriptionId: string) => {
    const token = await getToken();
    if (!token) return;
    
    const client = createAuthenticatedClient(token);
    
    // Find free plan
    const plans = await client.get('/plans', { params: { active: true } });
    const freePlan = plans.find(p => p.slug === 'free');
    
    // Downgrade to free plan
    await client.patch(`/subscriptions/${subscriptionId}`, {
        plan_id: freePlan.id,
        status: 'active'
    });
};
```

### Phase 5: Company Billing (Week 3-4)
**Goal**: Implement placement fee billing for companies

#### 5.1 Company Billing Domain
```typescript
// services/billing-service/src/v2/company-billing/
├── types.ts           // Invoice, payment terms
├── repository.ts      // Company billing data
├── service.ts         // Invoice generation
└── stripe-invoicing.ts // Stripe invoicing API
```

#### 5.2 Placement Event Integration
```typescript
// Listen to placement.guarantee_completed event
// Generate Stripe invoice based on placement fee
// Handle payment terms (immediate, Net 30/60/90)
// Send invoice to company billing contact
```

#### 5.3 Company Billing UI
```tsx
// apps/portal/src/app/portal/company/billing/
├── page.tsx                    // Billing overview
├── invoices/page.tsx          // Invoice history
├── payment-terms/page.tsx     // Configure payment terms
└── components/
    ├── invoice-card.tsx       // Individual invoice
    ├── payment-status.tsx     // Payment tracking
    └── terms-selector.tsx     // Payment terms config
```

### Phase 6: Recruiter Payouts via Stripe Connect (Week 4-5)
**Goal**: Implement automated recruiter payouts

#### 6.1 Stripe Connect Integration
```typescript
// services/billing-service/src/v2/connect/
├── types.ts           // Connect account types
├── repository.ts      // Account linking
├── service.ts         // Account creation/verification
└── payouts.ts         // Transfer processing
```

#### 6.2 Connect Onboarding Flow
```tsx
// apps/portal/src/app/portal/connect/
├── setup/page.tsx             // Connect account setup
├── verification/page.tsx      // Identity verification
└── components/
    ├── connect-onboarding.tsx // Stripe Connect onboarding
    ├── verification-status.tsx // KYC status
    └── payout-schedule.tsx    // Payout preferences
```

#### 6.3 Automated Payout Processing
```typescript
// Update existing payout automation
// services/billing-service/src/v2/payouts/service.ts
export class PayoutServiceV2 {
  async processPayoutViaStripe(payoutId: string): Promise<void>
  async handleStripeTransferWebhook(event: Stripe.Event): Promise<void>
}
```

### Phase 7: Role Promotion Billing (Week 5)
**Goal**: One-time charges for job role promotions

#### 7.1 Promotion Billing Domain
```typescript
// services/billing-service/src/v2/promotions/
├── types.ts           // Promotion charges
├── repository.ts      // Promotion billing records
└── service.ts         // One-time charge processing
```

#### 7.2 Role Promotion UI
```tsx
// apps/portal/src/app/portal/jobs/[id]/promote/page.tsx
export default function PromoteJobPage() {
  // Promotion duration selector
  // Pricing calculator
  // Stripe Payment Element
  // Promotion confirmation
}
```

---

## Database Schema Updates

### New Tables Needed

#### 1. Company Payment Terms
```sql
CREATE TABLE company_payment_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('immediate', 'net_30', 'net_60', 'net_90')),
    stripe_customer_id TEXT,
    default_terms BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Stripe Connect Accounts
```sql
CREATE TABLE stripe_connect_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    stripe_account_id TEXT NOT NULL UNIQUE,
    account_status TEXT NOT NULL CHECK (account_status IN ('pending', 'restricted', 'enabled')),
    charges_enabled BOOLEAN DEFAULT false,
    payouts_enabled BOOLEAN DEFAULT false,
    verification_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. Promotion Charges
```sql
CREATE TABLE promotion_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id),
    user_id UUID NOT NULL REFERENCES users(id),
    stripe_payment_intent_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    duration_days INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Schema Updates

#### 1. Add Stripe Fields to Existing Tables
```sql
-- Update plans table
ALTER TABLE plans ADD COLUMN stripe_product_id TEXT;
ALTER TABLE plans ADD COLUMN stripe_price_id TEXT;

-- Update subscriptions table
ALTER TABLE subscriptions ADD COLUMN stripe_customer_id TEXT;

-- Update companies table  
ALTER TABLE companies ADD COLUMN stripe_customer_id TEXT;
```

---

## API Gateway Integration

### New Proxy Routes
```typescript
// services/api-gateway/src/routes/billing/routes.ts

// Subscription management
GET /api/v2/subscriptions/me -> billing-service
POST /api/v2/subscriptions/checkout-session -> billing-service
POST /api/v2/subscriptions/portal-session -> billing-service

// Company billing
GET /api/v2/company-billing/invoices -> billing-service
POST /api/v2/company-billing/payment-terms -> billing-service

// Stripe Connect
POST /api/v2/connect/onboard -> billing-service
GET /api/v2/connect/status -> billing-service

// Role promotions
POST /api/v2/promotions/charge -> billing-service
GET /api/v2/promotions/history -> billing-service
```

---

## Testing Strategy

### 1. Stripe Test Mode Integration
- Use Stripe test keys for all development
- Test webhook endpoints with Stripe CLI
- Validate subscription lifecycle events

### 2. Frontend Testing
```typescript
// Test Stripe Elements integration
// Test checkout flow end-to-end  
// Test subscription management UI
// Test Connect onboarding flow
```

### 3. Backend Testing
```typescript
// Test webhook event processing
// Test subscription creation/cancellation
// Test payout processing
// Test company invoice generation
```

---

## Security Considerations

### 1. API Security
- Stripe webhook signature verification
- PCI compliance for payment data
- Secure storage of Stripe customer/account IDs

### 2. Access Control
- Role-based subscription access
- Company billing data isolation  
- Connect account ownership verification

### 3. Data Protection
- No credit card data stored locally
- Stripe tokenization for payment methods
- Audit logging for all financial operations

---

## Monitoring & Analytics

### 1. Stripe Dashboard Integration
- Monitor subscription metrics
- Track payout volumes
- Monitor failed payments

### 2. Application Metrics
```typescript
// Subscription conversion rates
// Payout success rates  
// Invoice payment times
// Connect account verification rates
```

---

## Rollout Plan

### Week 1: Foundation
- [ ] Database schema updates
- [ ] Seed plan data
- [ ] Stripe product setup
- [ ] Environment configuration

### Week 2: Core Integration  
- [ ] V2 Stripe service implementation
- [ ] Webhook migration to V2
- [ ] Basic subscription CRUD

### Week 3: Frontend
- [ ] Onboarding subscription step
- [ ] Billing management page
- [ ] Plan upgrade/downgrade flows

### Week 4: Company Billing
- [ ] Invoice generation system
- [ ] Company billing UI
- [ ] Payment terms management

### Week 5: Payouts & Promotions
- [ ] Stripe Connect integration
- [ ] Automated payout processing
- [ ] Role promotion billing

### Week 6: Testing & Launch
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Production deployment
- [ ] Monitoring setup

---

This implementation plan leverages the existing V2 billing service architecture and builds comprehensive Stripe integration while maintaining the clean separation of concerns established in the current codebase.
