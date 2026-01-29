# Onboarding State Persistence Implementation Plan

## Problem Statement

The current onboarding wizard loses state when users refresh the browser or switch devices, causing them to restart the process. This creates a poor user experience, especially for recruiters who may start onboarding on mobile and complete it on desktop.

## Root Cause Analysis

1. **State Storage**: Onboarding state is currently stored in React Context (OnboardingProvider) using useState
2. **Session Dependency**: State is lost on browser refresh, tab close, or device switch
3. **Cross-Device Issues**: Users cannot continue onboarding on different devices
4. **Debugging Challenges**: No persistence makes troubleshooting user issues difficult

## Proposed Solution: Database-Backed Onboarding State

### 1. Database Schema Changes

Add `onboarding_metadata` JSONB field to `identity.users` table:

```sql
-- Migration: Add onboarding_metadata to users table
ALTER TABLE identity.users
ADD COLUMN onboarding_metadata JSONB DEFAULT '{}';

-- Index for efficient queries on onboarding status
CREATE INDEX idx_users_onboarding_metadata
ON identity.users USING GIN (onboarding_metadata);
```

### 2. Onboarding Metadata Structure

The `onboarding_metadata` JSONB field will store:

```typescript
interface OnboardingMetadata {
    status: "not_started" | "in_progress" | "completed";
    currentStep: number;
    selectedRole?: "recruiter" | "company_admin" | "hiring_manager";
    completedSteps: number[];

    // Plan selection data (for recruiters)
    selectedPlan?: {
        id: string;
        tier: "starter" | "pro" | "partner";
        name: string;
        price_monthly: number;
        trial_days?: number;
    };

    stripePaymentInfo?: {
        customerId?: string;
        paymentMethodId?: string;
    };

    // Recruiter profile data
    recruiterData?: {
        bio?: string;
        phone?: string;
        location?: string;
        tagline?: string;
        years_experience?: number;
        teamInviteCode?: string;

        // Marketplace profile data (rich content)
        marketplace_profile?: {
            bio_rich?: string;
            specialties?: string[];
            industries?: string[];
        };
    };

    // Company information data
    companyData?: {
        name?: string;
        website?: string;
        industry?: string;
        size?: string;
        description?: string;
        headquarters_location?: string;
        logo_url?: string;
    };

    // Metadata
    startedAt: string; // ISO timestamp
    lastUpdatedAt: string; // ISO timestamp
    deviceInfo?: {
        userAgent: string;
        platform: string;
    };
}
```

### 3. Frontend Implementation

#### Enhanced OnboardingProvider

```typescript
// apps/portal/src/components/onboarding/onboarding-provider.tsx

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [state, setState] = useState<OnboardingState>(initialState);
  const [loading, setLoading] = useState(true);
  const [persisting, setPersisting] = useState(false);

  // Load onboarding state from database on mount
  useEffect(() => {
    if (user?.id) {
      loadOnboardingState();
    }
  }, [user?.id]);

  // Auto-save state changes to database (debounced)
  useEffect(() => {
    if (!loading && user?.id) {
      const timeoutId = setTimeout(() => {
        persistOnboardingState();
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [state, loading, user?.id]);

  const loadOnboardingState = async () => {
    try {
      const client = await createAuthenticatedClient();
      const response = await client.get('/api/v2/users/me');
      const userData = response.data;

      if (userData.onboarding_metadata && Object.keys(userData.onboarding_metadata).length > 0) {
        const metadata = userData.onboarding_metadata as OnboardingMetadata;

        // Restore state from database
        setState({
          currentStep: metadata.currentStep,
          selectedRole: metadata.selectedRole,
          completedSteps: metadata.completedSteps,
          selectedPlan: metadata.selectedPlan || null,
          stripePaymentInfo: metadata.stripePaymentInfo || null,
          recruiterProfile: metadata.recruiterData || {},
          companyInfo: metadata.companyData || {},
          isComplete: metadata.status === 'completed'
        });
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
    } finally {
      setLoading(false);
    }
  };

  const persistOnboardingState = async () => {
    if (persisting) return; // Prevent concurrent saves

    try {
      setPersisting(true);
      const client = await createAuthenticatedClient();

      const metadata: OnboardingMetadata = {
        status: state.isComplete ? 'completed' : 'in_progress',
        currentStep: state.currentStep,
        selectedRole: state.selectedRole,
        completedSteps: state.completedSteps,
        selectedPlan: state.selectedPlan,
        stripePaymentInfo: state.stripePaymentInfo,
        recruiterData: state.selectedRole === 'recruiter' ? state.recruiterProfile : undefined,
        companyData: state.selectedRole !== 'recruiter' ? state.companyInfo : undefined,
        startedAt: new Date().toISOString(), // Will be overwritten by backend if exists
        lastUpdatedAt: new Date().toISOString(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        }
      };

      await client.patch('/api/v2/users/me', {
        onboarding_metadata: metadata
      });

      console.log('Onboarding state persisted to database');
    } catch (error) {
      console.error('Failed to persist onboarding state:', error);
    } finally {
      setPersisting(false);
    }
  };

  // Enhanced navigation methods with persistence
  const goToStep = useCallback(async (step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: step
    }));
    // State will auto-persist via useEffect
  }, []);

  const completeStep = useCallback(async (step: number) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, step])]
    }));
    // State will auto-persist via useEffect
  }, []);

  // Clear onboarding state when completed
  const markOnboardingComplete = useCallback(async () => {
    try {
      const client = await createAuthenticatedClient();
      await client.patch('/api/v2/users/me', {
        onboarding_metadata: {
          status: 'completed',
          completedAt: new Date().toISOString()
        }
      });

      setState(prev => ({ ...prev, isComplete: true }));
    } catch (error) {
      console.error('Failed to mark onboarding complete:', error);
    }
  }, []);

  const value = {
    ...state,
    loading,
    persisting,
    goToStep,
    completeStep,
    markOnboardingComplete,
    setSelectedRole: (role: UserRole) => {
      setState(prev => ({ ...prev, selectedRole: role }));
    },
    setRecruiterProfile: (profile: Partial<RecruiterProfile>) => {
      setState(prev => ({
        ...prev,
        recruiterProfile: { ...prev.recruiterProfile, ...profile }
      }));
    },
    setCompanyProfile: (profile: Partial<CompanyProfile>) => {
      setState(prev => ({
        ...prev,
        companyInfo: { ...prev.companyInfo, ...profile }
      }));
    },
    setSelectedPlan: (plan: SelectedPlan | null) => {
      setState(prev => ({ ...prev, selectedPlan: plan }));
    },
    setStripePaymentInfo: (info: StripePaymentInfo | null) => {
      setState(prev => ({ ...prev, stripePaymentInfo: info }));
    }
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
```

#### Enhanced Onboarding Modal

```typescript
// apps/portal/src/components/onboarding/onboarding-wizard-modal.tsx

export function OnboardingWizardModal() {
  const {
    currentStep,
    selectedRole,
    isComplete,
    loading,
    persisting
  } = useOnboarding();

  // Show loading spinner while loading state from database
  if (loading) {
    return (
      <dialog id="onboarding_modal" className="modal modal-open">
        <div className="modal-box w-11/12 max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
            <span className="ml-3">Loading your progress...</span>
          </div>
        </div>
      </dialog>
    );
  }

  // Rest of component remains the same
  // Add persistence indicator in footer
  return (
    <dialog id="onboarding_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        {/* Header with progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Complete Your Profile</h3>
            {persisting && (
              <div className="flex items-center text-sm text-base-content/60">
                <span className="loading loading-spinner loading-xs mr-1"></span>
                Saving...
              </div>
            )}
          </div>
          <progress
            className="progress progress-primary w-full"
            value={currentStep}
            max={4}
          ></progress>
          <p className="text-sm text-base-content/60 mt-1">
            Step {currentStep} of 4
          </p>
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="modal-action mt-6">
          <div className="text-xs text-base-content/60">
            Your progress is automatically saved and synced across devices
          </div>
        </div>
      </div>
    </dialog>
  );
}
```

### 4. Backend Implementation

#### Identity Service Updates

Add endpoint to handle onboarding metadata updates:

```typescript
// services/identity-service/src/v2/users/service.ts

async updateOnboardingMetadata(
  userId: string,
  metadata: Partial<OnboardingMetadata>
): Promise<void> {
  // Merge with existing metadata, preserving startedAt
  const { data: currentUser } = await this.supabase
    .from('users')
    .select('onboarding_metadata')
    .eq('clerk_user_id', userId)
    .single();

  const existingMetadata = currentUser?.onboarding_metadata || {};
  const mergedMetadata = {
    ...existingMetadata,
    ...metadata,
    startedAt: existingMetadata.startedAt || new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString()
  };

  await this.supabase
    .from('users')
    .update({ onboarding_metadata: mergedMetadata })
    .eq('clerk_user_id', userId);

  // Publish event for analytics
  await this.eventPublisher?.publish('user.onboarding.updated', {
    userId,
    step: metadata.currentStep,
    role: metadata.selectedRole,
    status: metadata.status
  });
}
```

#### API Gateway Route Updates

Add onboarding-specific endpoints:

```typescript
// services/api-gateway/src/routes/users.ts

// GET /api/v2/users/me/onboarding - Get onboarding state
app.get(
    "/users/me/onboarding",
    {
        preHandler: requireAuth,
    },
    async (request, reply) => {
        const userId = request.auth.clerkUserId;
        const response = await services.identity.get(
            `/users/by-clerk-id/${userId}`,
        );
        const user = response.data;

        return reply.send({
            data: {
                onboarding_metadata: user.onboarding_metadata || {},
                onboarding_complete:
                    !!user.onboarding_metadata?.status === "completed",
            },
        });
    },
);

// PATCH /api/v2/users/me/onboarding - Update onboarding state
app.patch(
    "/users/me/onboarding",
    {
        preHandler: requireAuth,
    },
    async (request, reply) => {
        const userId = request.auth.clerkUserId;
        const metadata = request.body;

        await services.identity.patch(
            `/users/by-clerk-id/${userId}/onboarding`,
            metadata,
        );

        return reply.send({ data: { success: true } });
    },
);
```

### 5. Benefits

#### User Experience

- **Seamless continuation**: Users can pick up where they left off on any device
- **No lost progress**: Browser refresh or accidental closure doesn't reset onboarding
- **Cross-device support**: Start on mobile, finish on desktop
- **Visual feedback**: Loading states and save indicators provide clarity

#### Developer Experience

- **Debugging capabilities**: Full onboarding history available in database
- **Analytics insights**: Track step completion rates, abandonment points
- **Support efficiency**: Customer support can see exactly where users are stuck
- **A/B testing**: Can analyze onboarding flow effectiveness

#### Technical Benefits

- **Scalability**: Database storage scales with user growth
- **Reliability**: No dependency on localStorage or session storage
- **Consistency**: Single source of truth for onboarding state
- **Performance**: Debounced saves prevent excessive API calls

### 6. Implementation Timeline

1. **Week 1**: Database schema migration and backend API updates
2. **Week 2**: Frontend OnboardingProvider enhancement and testing
3. **Week 3**: Integration testing, error handling, and edge case coverage
4. **Week 4**: User testing, analytics implementation, and production deployment

### 7. Rollout Strategy

1. **Feature flag**: Deploy behind feature flag for gradual rollout
2. **A/B test**: Compare completion rates between old and new flows
3. **Monitor metrics**: Track API performance and error rates
4. **Gradual rollout**: 10% → 50% → 100% user adoption
5. **Legacy cleanup**: Remove old state management after successful rollout

### 8. Success Metrics

- **Completion rate increase**: Target 25% improvement in onboarding completion
- **Cross-device usage**: Track users continuing onboarding on different devices
- **Support ticket reduction**: Fewer onboarding-related support requests
- **User satisfaction**: Improved onboarding experience scores
- **Technical performance**: <200ms API response times for state persistence

This approach transforms the onboarding experience from a fragile single-session process into a robust, user-friendly journey that adapts to modern user behavior patterns.

## ✅ Key Improvements: Complete Field Coverage

### Recruiter Fields (15+ fields):

**Basic Profile:**

- `bio` - Text area for recruiting experience
- `phone` - Required phone number
- `industries` - Array of selected industries (17 options)
- `specialties` - Array of selected specialties (13 options)
- `location` - Primary work location
- `tagline` - Brief headline about expertise
- `years_experience` - Number of years in recruiting
- `teamInviteCode` - Optional team invitation code

**Marketplace Profile Settings:**

- `marketplace_enabled` - Boolean for marketplace visibility toggle
- `marketplace_visibility` - 'public', 'limited', or 'hidden'
- `show_success_metrics` - Boolean to display success metrics
- `show_contact_info` - Boolean to display contact information

**Marketplace Profile Rich Data:**

- `marketplace_profile.bio_rich` - Rich text/markdown bio for marketplace
- `marketplace_profile.specialties` - Enhanced specialty descriptions
- `marketplace_profile.industries` - Enhanced industry descriptions

### Company Fields (7 fields):

- `name` - Required company name
- `website` - Required company website URL
- `industry` - Selected industry from dropdown (17 options)
- `size` - Company size range (7 options)
- `description` - Optional company description text
- `headquarters_location` - Company headquarters location
- `logo_url` - Optional company logo URL

### Plan/Payment Fields (for recruiters):

- `selectedPlan` - Complete plan object (id, tier, name, price, trial_days)
- `stripePaymentInfo` - Stripe customer and payment method IDs

**Critical Enhancement**: The updated plan now includes marketplace profile settings that allow recruiters to configure their marketplace presence during onboarding, ensuring they can immediately participate in the marketplace with proper visibility controls and rich profile content.
