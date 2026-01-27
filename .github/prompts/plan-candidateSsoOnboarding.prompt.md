# Candidate App SSO User Creation & Onboarding Wizard Plan

## Problem Statement

The candidate app has the same SSO user creation gap as the portal app:
- SSO callback directory exists at `apps/candidate/src/app/sso-callback/` but is **empty** (no page.tsx)
- Email/password sign-up works correctly (creates user + candidate records)
- No onboarding wizard exists for candidates

## Design Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| When to show onboarding | Always for new users (`onboarding_status = 'pending'`) |
| Skip option | Yes, allow users to skip and complete later |
| Resume upload | Optional in onboarding (not required) |

---

## Solution Architecture

Same three-layer defense as portal, but creates both **user AND candidate** records:

```
┌─────────────────────────────────────────────────────────────────┐
│                 Candidate Signs Up via SSO                      │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Layer 1:       │  │  Layer 2:       │  │  Layer 3:       │
│  SSO Callback   │  │  Clerk Webhook  │  │  Onboarding     │
│  (Immediate)    │  │  (Background)   │  │  (Fallback)     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│     users table + candidates table (idempotent upsert)          │
│     - clerk_user_id (unique)                                    │
│     - onboarding_status: 'pending'                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Create User Registration Utility

**File**: `apps/candidate/src/lib/user-registration.ts`

```typescript
/**
 * User Registration Utility for Candidate App
 * Ensures both users AND candidate records exist in the database for SSO sign-ups
 * 
 * This module provides idempotent user/candidate creation that handles:
 * - First-time SSO sign-ups
 * - Race conditions with Clerk webhooks
 * - Duplicate key errors gracefully
 */

import { createAuthenticatedClient } from '@/lib/api-client';

export interface UserRegistrationData {
    clerk_user_id: string;
    email: string;
    name?: string;
    image_url?: string;
}

export interface UserData {
    id: string;
    clerk_user_id: string;
    email: string;
    name: string | null;
    onboarding_status: string;
    onboarding_step: number;
}

export interface CandidateData {
    id: string;
    user_id: string | null;
    email: string;
    full_name: string | null;
    onboarding_status?: string;
    phone?: string;
    location?: string;
    skills?: string[];
}

export interface UserCandidateRegistrationResult {
    success: boolean;
    user: UserData | null;
    candidate: CandidateData | null;
    error?: string;
    userWasExisting: boolean;
    candidateWasExisting: boolean;
}

/**
 * Ensures both a user AND candidate record exist in the database.
 * Idempotent - safe to call multiple times.
 * 
 * Flow:
 * 1. Check if user exists via /users/me
 * 2. If not, create via /users/register
 * 3. Check if candidate exists via /candidates/me
 * 4. If not, create via /candidates POST
 * 5. Handle duplicates gracefully
 */
export async function ensureUserAndCandidateInDatabase(
    token: string,
    data: UserRegistrationData
): Promise<UserCandidateRegistrationResult> {
    const apiClient = createAuthenticatedClient(token);
    
    let userData: UserData | null = null;
    let candidateData: CandidateData | null = null;
    let userWasExisting = false;
    let candidateWasExisting = false;

    try {
        // ===== STEP 1: Ensure User Exists =====
        try {
            const existingUserResponse = await apiClient.get<{ data: UserData }>('/users/me');
            if (existingUserResponse?.data) {
                console.log('[UserRegistration] User already exists:', existingUserResponse.data.id);
                userData = existingUserResponse.data;
                userWasExisting = true;
            }
        } catch (checkError: any) {
            const status = checkError?.response?.status || checkError?.status;
            if (status !== 404 && status !== 500) {
                console.warn('[UserRegistration] Error checking existing user:', checkError);
            }
        }

        // Create user if not exists
        if (!userData) {
            console.log('[UserRegistration] Creating new user for:', data.email);
            
            try {
                const createResponse = await apiClient.post<{ data: UserData }>('/users/register', {
                    clerk_user_id: data.clerk_user_id,
                    email: data.email,
                    name: data.name || '',
                    image_url: data.image_url,
                });

                if (createResponse?.data) {
                    console.log('[UserRegistration] User created successfully:', createResponse.data.id);
                    userData = createResponse.data;
                    userWasExisting = false;
                }
            } catch (createError: any) {
                const errorMessage = createError?.message || createError?.response?.data?.error?.message || '';
                const isDuplicateKey = 
                    errorMessage.toLowerCase().includes('already registered') ||
                    errorMessage.toLowerCase().includes('duplicate') ||
                    errorMessage.toLowerCase().includes('already exists') ||
                    createError?.response?.status === 409;

                if (isDuplicateKey) {
                    console.log('[UserRegistration] User created by webhook, fetching existing...');
                    const retryResponse = await apiClient.get<{ data: UserData }>('/users/me');
                    if (retryResponse?.data) {
                        userData = retryResponse.data;
                        userWasExisting = true;
                    }
                } else {
                    throw createError;
                }
            }
        }

        if (!userData) {
            throw new Error('Unable to load or create user profile');
        }

        // ===== STEP 2: Ensure Candidate Exists =====
        try {
            const existingCandidateResponse = await apiClient.get<{ data: CandidateData }>('/candidates/me');
            if (existingCandidateResponse?.data) {
                console.log('[UserRegistration] Candidate already exists:', existingCandidateResponse.data.id);
                candidateData = existingCandidateResponse.data;
                candidateWasExisting = true;
            }
        } catch (checkError: any) {
            const status = checkError?.response?.status || checkError?.status;
            if (status !== 404 && status !== 500) {
                console.warn('[UserRegistration] Error checking existing candidate:', checkError);
            }
        }

        // Create candidate if not exists
        if (!candidateData) {
            console.log('[UserRegistration] Creating new candidate for:', data.email);
            
            try {
                const createCandidateResponse = await apiClient.post<{ data: CandidateData }>('/candidates', {
                    user_id: userData.id,
                    email: data.email,
                    full_name: data.name || '',
                });

                if (createCandidateResponse?.data) {
                    console.log('[UserRegistration] Candidate created successfully:', createCandidateResponse.data.id);
                    candidateData = createCandidateResponse.data;
                    candidateWasExisting = false;
                }
            } catch (createError: any) {
                const errorMessage = createError?.message || createError?.response?.data?.error?.message || '';
                const isDuplicateKey = 
                    errorMessage.toLowerCase().includes('duplicate') ||
                    errorMessage.toLowerCase().includes('already exists') ||
                    createError?.response?.status === 409;

                if (isDuplicateKey) {
                    console.log('[UserRegistration] Candidate created by webhook, fetching existing...');
                    try {
                        const retryResponse = await apiClient.get<{ data: CandidateData }>('/candidates/me');
                        if (retryResponse?.data) {
                            candidateData = retryResponse.data;
                            candidateWasExisting = true;
                        }
                    } catch (retryError) {
                        const listResponse = await apiClient.get<{ data: CandidateData[] }>('/candidates', {
                            params: { limit: 1 }
                        });
                        if (listResponse?.data?.[0]) {
                            candidateData = listResponse.data[0];
                            candidateWasExisting = true;
                        }
                    }
                } else {
                    throw createError;
                }
            }
        }

        return {
            success: true,
            user: userData,
            candidate: candidateData,
            userWasExisting,
            candidateWasExisting,
        };

    } catch (error: any) {
        console.error('[UserRegistration] Failed to ensure user and candidate:', error);
        return {
            success: false,
            user: userData,
            candidate: candidateData,
            error: error?.message || 'Failed to create account',
            userWasExisting,
            candidateWasExisting,
        };
    }
}
```

---

### Phase 2: Create SSO Callback Page

**File**: `apps/candidate/src/app/sso-callback/page.tsx`

```tsx
'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ensureUserAndCandidateInDatabase } from '@/lib/user-registration';

type SSOStatus = 'authenticating' | 'creating_user' | 'creating_candidate' | 'redirecting' | 'error';

export default function SSOCallbackPage() {
    const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
    const { user, isLoaded: userLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [status, setStatus] = useState<SSOStatus>('authenticating');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const hasAttemptedRef = useRef(false);

    useEffect(() => {
        if (!authLoaded || !userLoaded) return;
        if (!isSignedIn || !user) return;
        if (hasAttemptedRef.current) return;
        hasAttemptedRef.current = true;

        async function ensureUserAndRedirect() {
            try {
                const token = await getToken();
                if (!token) {
                    throw new Error('Failed to get authentication token');
                }

                setStatus('creating_user');

                const result = await ensureUserAndCandidateInDatabase(token, {
                    clerk_user_id: user.id,
                    email: user.primaryEmailAddress?.emailAddress || '',
                    name: user.fullName || user.firstName || '',
                    image_url: user.imageUrl,
                });

                if (!result.success) {
                    console.warn('[SSOCallback] User/candidate creation warning:', result.error);
                }

                if (!result.candidateWasExisting && result.candidate) {
                    setStatus('creating_candidate');
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                setStatus('redirecting');

                const redirectUrl = searchParams.get('redirect_url');
                const invitationId = searchParams.get('invitation_id');
                
                if (invitationId) {
                    router.replace(`/portal/accept-invitation?invitation_id=${invitationId}`);
                } else if (redirectUrl && redirectUrl.startsWith('/')) {
                    router.replace(redirectUrl);
                } else {
                    router.replace('/portal/dashboard');
                }

            } catch (error: any) {
                console.error('[SSOCallback] Error:', error);
                setErrorMessage(error?.message || 'An error occurred during sign in');
                setStatus('error');
                
                setTimeout(() => {
                    router.replace('/portal/dashboard');
                }, 3000);
            }
        }

        ensureUserAndRedirect();
    }, [authLoaded, userLoaded, isSignedIn, user, getToken, router, searchParams]);

    const getStatusContent = () => {
        switch (status) {
            case 'authenticating':
                return { title: 'Completing sign in...', message: 'Verifying your credentials.', showSpinner: true };
            case 'creating_user':
                return { title: 'Setting up your account...', message: 'Just a moment while we prepare your profile.', showSpinner: true };
            case 'creating_candidate':
                return { title: 'Creating your candidate profile...', message: 'Almost there!', showSpinner: true };
            case 'redirecting':
                return { title: 'Welcome!', message: 'Redirecting you to your dashboard...', showSpinner: true };
            case 'error':
                return { title: 'Something went wrong', message: errorMessage || 'Redirecting anyway...', showSpinner: false };
            default:
                return { title: 'Please wait...', message: 'Processing your request.', showSpinner: true };
        }
    };

    const content = getStatusContent();

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md bg-base-100 shadow">
                <div className="card-body items-center text-center">
                    {content.showSpinner ? (
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-3xl text-error"></i>
                        </div>
                    )}
                    <h2 className="card-title mt-4">{content.title}</h2>
                    <p className="text-sm text-base-content/70">{content.message}</p>
                    {status === 'error' && (
                        <p className="text-xs text-base-content/50 mt-2">Redirecting in a few seconds...</p>
                    )}
                </div>
            </div>
            <AuthenticateWithRedirectCallback />
        </div>
    );
}
```

---

### Phase 3: Create Onboarding System

#### 3.1 Types

**File**: `apps/candidate/src/components/onboarding/types.ts`

```typescript
export type OnboardingStep = 1 | 2 | 3 | 4;
export type OnboardingStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface CandidateOnboardingState {
    currentStep: OnboardingStep;
    status: OnboardingStatus;
    isModalOpen: boolean;
    profileData: {
        full_name?: string;
        phone?: string;
        location?: string;
        resumeFile?: File | null;
        resumeUploaded?: boolean;
        desired_job_type?: string[];
        open_to_remote?: boolean;
        desired_salary_min?: number;
        desired_salary_max?: number;
    };
    submitting: boolean;
    error: string | null;
}

export interface CandidateOnboardingContextType {
    state: CandidateOnboardingState;
    candidateId: string | null;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: OnboardingStep) => void;
    updateProfileData: (data: Partial<CandidateOnboardingState['profileData']>) => void;
    skipOnboarding: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
    closeModal: () => void;
    openModal: () => void;
}

export const JOB_TYPE_OPTIONS = [
    { value: 'full_time', label: 'Full-time' },
    { value: 'part_time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
] as const;

export const SALARY_RANGES = [
    { min: 0, max: 50000, label: 'Under $50K' },
    { min: 50000, max: 75000, label: '$50K - $75K' },
    { min: 75000, max: 100000, label: '$75K - $100K' },
    { min: 100000, max: 150000, label: '$100K - $150K' },
    { min: 150000, max: 200000, label: '$150K - $200K' },
    { min: 200000, max: 300000, label: '$200K - $300K' },
    { min: 300000, max: null, label: '$300K+' },
] as const;
```

#### 3.2 Onboarding Provider

**File**: `apps/candidate/src/components/onboarding/onboarding-provider.tsx`

- Context provider with user/candidate creation fallback
- Track initStatus: 'loading' | 'creating_account' | 'ready' | 'error'
- Show loading overlay during initialization
- Show modal if onboarding_status is 'pending'
- Allow skip (sets status to 'skipped')

#### 3.3 Wizard Modal

**File**: `apps/candidate/src/components/onboarding/onboarding-wizard-modal.tsx`

- Modal with 4 steps and step indicator
- Progress bar showing completion percentage
- Next/Previous/Skip buttons
- Uses DaisyUI modal styling

#### 3.4 Step Components

| Step | File | Purpose |
|------|------|---------|
| 1 | `steps/welcome-step.tsx` | Welcome message, verify/edit name |
| 2 | `steps/contact-step.tsx` | Phone & location (both optional) |
| 3 | `steps/resume-step.tsx` | Resume upload (OPTIONAL, skip clearly visible) |
| 4 | `steps/preferences-step.tsx` | Job type, remote preference, salary range |

#### 3.5 Index Exports

**File**: `apps/candidate/src/components/onboarding/index.ts`

```typescript
export { OnboardingProvider, useOnboarding } from './onboarding-provider';
export { OnboardingWizardModal } from './onboarding-wizard-modal';
export { WelcomeStep } from './steps/welcome-step';
export { ContactStep } from './steps/contact-step';
export { ResumeStep } from './steps/resume-step';
export { PreferencesStep } from './steps/preferences-step';
export type { OnboardingStep, OnboardingStatus, CandidateOnboardingState, CandidateOnboardingContextType } from './types';
export { JOB_TYPE_OPTIONS, SALARY_RANGES } from './types';
```

---

### Phase 4: Update Portal Layout

**File**: `apps/candidate/src/app/portal/layout.tsx`

```tsx
import { ServiceStatusBanner } from '@/components/ServiceStatusBanner';
import { OnboardingProvider, OnboardingWizardModal } from '@/components/onboarding';

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <OnboardingProvider>
            <div className="bg-base-300 p-6">
                <ServiceStatusBanner />
                {children}
            </div>
            <OnboardingWizardModal />
        </OnboardingProvider>
    );
}
```

---

### Phase 5: Profile Completion Banner

**File**: `apps/candidate/src/components/profile-completion-banner.tsx`

Shows when onboarding was skipped:
- Displays profile completion percentage
- "Resume Setup" button to reopen wizard
- "Edit Profile" link
- Dismissible

Add to dashboard page after container div.

---

## Files Summary

### Files to Create (11)

1. `apps/candidate/src/lib/user-registration.ts`
2. `apps/candidate/src/app/sso-callback/page.tsx`
3. `apps/candidate/src/components/onboarding/types.ts`
4. `apps/candidate/src/components/onboarding/onboarding-provider.tsx`
5. `apps/candidate/src/components/onboarding/onboarding-wizard-modal.tsx`
6. `apps/candidate/src/components/onboarding/steps/welcome-step.tsx`
7. `apps/candidate/src/components/onboarding/steps/contact-step.tsx`
8. `apps/candidate/src/components/onboarding/steps/resume-step.tsx`
9. `apps/candidate/src/components/onboarding/steps/preferences-step.tsx`
10. `apps/candidate/src/components/onboarding/index.ts`
11. `apps/candidate/src/components/profile-completion-banner.tsx`

### Files to Update (2)

1. `apps/candidate/src/app/portal/layout.tsx` - Add OnboardingProvider
2. `apps/candidate/src/app/portal/dashboard/page.tsx` - Add ProfileCompletionBanner

---

## Database Considerations

Verify `candidates` table has these columns:
- `onboarding_status` (text: pending/in_progress/completed/skipped)
- `onboarding_step` (integer: 1-4)
- `desired_job_type` (text[] array)
- `open_to_remote` (boolean)
- `desired_salary_min` (integer)
- `desired_salary_max` (integer)

If not present, create migration.

---

## Testing Plan

1. **SSO Flow**: Test Google/Microsoft OAuth sign-up
2. **Onboarding Modal**: Verify appears for new users
3. **Skip Flow**: Test skip and verify banner appears
4. **Resume Upload**: Test file validation and upload
5. **Complete Flow**: Walk through all 4 steps
6. **Edge Cases**: User exists but candidate doesn't, race conditions
7. **Returning Users**: Verify no modal for completed/skipped status
