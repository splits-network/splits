# Comprehensive Plan: SSO User Creation & Onboarding Resilience

## Problem Statement

When users sign in via SSO (Google, GitHub, Microsoft), the user record is not being created in our database. The current implementation has gaps in:

1. **SSO Callback Page** - Only shows a loading spinner, no user creation logic
2. **Clerk Webhook Reliability** - Webhook may not fire or may be delayed
3. **Onboarding Wizard** - Not resilient to missing user records

## Current State Analysis

### SSO Callback (`apps/portal/src/app/sso-callback/page.tsx`)
```tsx
// Current: Only renders loading state and Clerk's redirect callback
export default function SSOCallbackPage() {
    return (
        <div>
            <AuthenticateWithRedirectCallback />
        </div>
    );
}
```
**Problem**: No user creation logic after SSO completion.

### Email/Password Sign-Up (`apps/portal/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`)
```tsx
// After email verification, creates user in database
const newUser = await apiClient.post('/users/register', {
    clerk_user_id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
});
```
**Working**: Email/password flow correctly creates users.

### Clerk Webhook (`services/identity-service/src/v2/webhooks/service.ts`)
```tsx
// Handles user.created, user.updated, user.deleted events
async handleClerkWebhook(event: ClerkWebhookEvent): Promise<void> {
    switch (event.type) {
        case 'user.created':
        case 'user.updated':
            await this.handleUserCreatedOrUpdated(event.data);
            break;
    }
}
```
**Exists but unreliable**: Webhooks can be delayed, fail, or not be configured properly.

### Onboarding Provider (`apps/portal/src/components/onboarding/onboarding-provider.tsx`)
```tsx
// Fetches user data but doesn't handle missing user
const response = await apiClient.get('/users', { params: { limit: 1 } });
const userData = Array.isArray(response.data) ? response.data[0] : response.data;
if (!userData) throw new Error('No user data found');
```
**Problem**: Throws error instead of creating user if missing.

---

## Solution Architecture

### Multi-Layer User Creation Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Signs Up via SSO                        │
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
│              users table (idempotent upsert)                    │
│              - clerk_user_id (unique)                           │
│              - onboarding_status: 'pending'                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Create Shared User Registration Utility

**File**: `apps/portal/src/lib/user-registration.ts`

```typescript
/**
 * User Registration Utility
 * 
 * Handles user creation in the database after authentication.
 * Designed to be idempotent - safe to call multiple times.
 */

import { createAuthenticatedClient } from './api-client';

export interface UserRegistrationData {
    clerkUserId: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
}

export interface UserRegistrationResult {
    success: boolean;
    user?: {
        id: string;
        clerk_user_id: string;
        email: string;
        name?: string;
        onboarding_status: string;
    };
    alreadyExists?: boolean;
    error?: string;
}

/**
 * Ensures user exists in database after authentication.
 * Safe to call multiple times (idempotent).
 * 
 * Flow:
 * 1. Check if user already exists (by clerk_user_id via /users/me)
 * 2. If exists, return existing user
 * 3. If not exists, create via /users/register
 * 4. Return created user
 */
export async function ensureUserInDatabase(
    token: string,
    data: UserRegistrationData
): Promise<UserRegistrationResult> {
    const apiClient = createAuthenticatedClient(token);
    
    // Build full name from parts if not provided
    const fullName = data.name || 
        (data.firstName && data.lastName 
            ? `${data.firstName} ${data.lastName}`.trim()
            : data.firstName || data.email.split('@')[0]);

    try {
        // Step 1: Check if user already exists
        const existingUserResponse = await apiClient.get('/users/me');
        
        if (existingUserResponse?.data) {
            // User already exists - return it
            console.log('[UserRegistration] User already exists:', existingUserResponse.data.id);
            return {
                success: true,
                user: existingUserResponse.data,
                alreadyExists: true,
            };
        }
    } catch (error: any) {
        // 404 or similar means user doesn't exist - continue to create
        if (error?.response?.status !== 404 && !error.message?.includes('not found')) {
            console.warn('[UserRegistration] Error checking existing user:', error.message);
        }
    }

    try {
        // Step 2: Create user via registration endpoint
        console.log('[UserRegistration] Creating new user for:', data.clerkUserId);
        
        const newUserResponse = await apiClient.post('/users/register', {
            clerk_user_id: data.clerkUserId,
            email: data.email,
            name: fullName,
        });

        if (newUserResponse?.data) {
            console.log('[UserRegistration] User created successfully:', newUserResponse.data.id);
            return {
                success: true,
                user: newUserResponse.data,
                alreadyExists: false,
            };
        }

        return {
            success: false,
            error: 'No user data returned from registration',
        };
    } catch (error: any) {
        // Handle duplicate key error (user already exists - race condition)
        if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
            console.log('[UserRegistration] User already exists (race condition), fetching...');
            
            try {
                const existingUserResponse = await apiClient.get('/users/me');
                if (existingUserResponse?.data) {
                    return {
                        success: true,
                        user: existingUserResponse.data,
                        alreadyExists: true,
                    };
                }
            } catch (fetchError) {
                // Fall through to error return
            }
        }

        console.error('[UserRegistration] Failed to create user:', error.message);
        return {
            success: false,
            error: error.message || 'Failed to create user',
        };
    }
}
```

---

### Phase 2: Update SSO Callback Page

**File**: `apps/portal/src/app/sso-callback/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser, AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { ensureUserInDatabase } from '@/lib/user-registration';

type CallbackStatus = 'authenticating' | 'creating_user' | 'redirecting' | 'error';

export default function SSOCallbackPage() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [status, setStatus] = useState<CallbackStatus>('authenticating');
    const [error, setError] = useState<string | null>(null);

    // Determine redirect destination
    const invitationId = searchParams.get('invitation_id');
    const redirectUrl = invitationId 
        ? `/accept-invitation/${invitationId}`
        : '/portal/dashboard';

    useEffect(() => {
        async function handlePostAuth() {
            // Wait for Clerk to finish loading
            if (!isLoaded) return;
            
            // If not signed in, let Clerk callback handle it
            if (!isSignedIn || !user) return;

            setStatus('creating_user');

            try {
                const token = await getToken();
                if (!token) {
                    throw new Error('Failed to get authentication token');
                }

                // Get user data from Clerk
                const primaryEmail = user.primaryEmailAddress?.emailAddress;
                if (!primaryEmail) {
                    throw new Error('No email address found');
                }

                // Ensure user exists in our database
                const result = await ensureUserInDatabase(token, {
                    clerkUserId: user.id,
                    email: primaryEmail,
                    firstName: user.firstName || undefined,
                    lastName: user.lastName || undefined,
                });

                if (!result.success) {
                    // Log but don't block - webhook may handle it
                    console.warn('[SSOCallback] User creation warning:', result.error);
                }

                // Redirect to destination
                setStatus('redirecting');
                router.push(redirectUrl);
            } catch (err: any) {
                console.error('[SSOCallback] Error during post-auth:', err);
                // Don't block on errors - redirect anyway, onboarding will catch it
                setStatus('redirecting');
                router.push(redirectUrl);
            }
        }

        handlePostAuth();
    }, [isLoaded, isSignedIn, user, getToken, router, redirectUrl]);

    const statusMessages: Record<CallbackStatus, { title: string; description: string }> = {
        authenticating: {
            title: 'Completing sign in...',
            description: 'Please wait while we verify your account.',
        },
        creating_user: {
            title: 'Setting up your account...',
            description: 'Just a moment while we prepare your workspace.',
        },
        redirecting: {
            title: 'Success!',
            description: 'Redirecting you to your dashboard...',
        },
        error: {
            title: 'Something went wrong',
            description: error || 'Please try signing in again.',
        },
    };

    const currentStatus = statusMessages[status];

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md bg-base-100 shadow">
                <div className="card-body items-center text-center">
                    {status !== 'error' ? (
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    ) : (
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-4xl text-error"></i>
                    )}
                    <h2 className="card-title mt-4">{currentStatus.title}</h2>
                    <p className="text-sm text-base-content/70">
                        {currentStatus.description}
                    </p>
                    {status === 'error' && (
                        <div className="card-actions mt-4">
                            <button 
                                onClick={() => router.push('/sign-in')}
                                className="btn btn-primary"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Clerk's callback component handles the OAuth exchange */}
            <AuthenticateWithRedirectCallback />
        </div>
    );
}
```

---

### Phase 3: Update Onboarding Provider with Fallback User Creation

**File**: `apps/portal/src/components/onboarding/onboarding-provider.tsx`

Update the `fetchOnboardingStatus` function to handle missing users with user-facing feedback:

```tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { OnboardingState, OnboardingContextType, UserRole } from './types';
import { ApiClient, createAuthenticatedClient } from '@/lib/api-client';
import { ensureUserInDatabase } from '@/lib/user-registration';
import { useUserProfile } from '@/contexts';

const OnboardingContext = createContext<OnboardingContextType | null>(null);

// Loading status for user feedback during initialization
type InitializationStatus = 'loading' | 'creating_account' | 'ready' | 'error';

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { isAdmin, isLoading: profileLoading } = useUserProfile();
    
    // Track initialization status for user feedback
    const [initStatus, setInitStatus] = useState<InitializationStatus>('loading');
    const [initMessage, setInitMessage] = useState<string>('Loading your account...');
    
    const [state, setState] = useState<OnboardingState>({
        currentStep: 1,
        status: 'pending',
        isModalOpen: false,
        selectedRole: null,
        submitting: false,
        error: null,
    });

    // Fetch user's onboarding status on mount
    useEffect(() => {
        if (!user || profileLoading) return;

        const fetchOnboardingStatus = async () => {
            setInitStatus('loading');
            setInitMessage('Loading your account...');
            
            try {
                const token = await getToken();
                if (!token) throw new Error('No authentication token');

                const apiClient = createAuthenticatedClient(token);

                // Try to get current user data
                let userData = null;
                
                try {
                    // First, try /users/me endpoint
                    const meResponse = await apiClient.get('/users/me');
                    userData = meResponse?.data;
                } catch (meError: any) {
                    console.log('[Onboarding] /users/me failed, trying list endpoint');
                    
                    // Fallback to list endpoint
                    try {
                        const response = await apiClient.get('/users', { params: { limit: 1 } });
                        userData = Array.isArray(response.data) ? response.data[0] : response.data;
                    } catch (listError) {
                        console.log('[Onboarding] List endpoint also failed');
                    }
                }

                // If no user data found, create user as fallback
                if (!userData) {
                    console.log('[Onboarding] No user found in database, creating via fallback...');
                    
                    // Update UI to show account creation in progress
                    setInitStatus('creating_account');
                    setInitMessage('Finalizing your account setup...');
                    
                    const primaryEmail = user.primaryEmailAddress?.emailAddress;
                    if (!primaryEmail) {
                        throw new Error('No email address found for user');
                    }

                    const registrationResult = await ensureUserInDatabase(token, {
                        clerkUserId: user.id,
                        email: primaryEmail,
                        firstName: user.firstName || undefined,
                        lastName: user.lastName || undefined,
                    });

                    if (registrationResult.success && registrationResult.user) {
                        userData = registrationResult.user;
                        console.log('[Onboarding] Fallback user creation successful:', userData.id);
                    } else {
                        throw new Error(registrationResult.error || 'Failed to create user');
                    }
                }

                // Mark initialization as complete
                setInitStatus('ready');
                setInitMessage('');

                // Skip onboarding modal for platform_admin users
                if (isAdmin) {
                    setState(prev => ({
                        ...prev,
                        currentStep: userData.onboarding_step || 1,
                        status: 'completed',
                        isModalOpen: false,
                    }));
                    return;
                }

                // Show modal if onboarding is pending or in progress
                const shouldShowModal = 
                    userData.onboarding_status === 'pending' || 
                    userData.onboarding_status === 'in_progress';

                setState(prev => ({
                    ...prev,
                    currentStep: userData.onboarding_step || 1,
                    status: userData.onboarding_status || 'pending',
                    isModalOpen: shouldShowModal,
                }));
            } catch (error: any) {
                console.error('[Onboarding] Failed to fetch/create user:', error);
                setInitStatus('error');
                setInitMessage(error.message || 'Failed to load your account');
                setState(prev => ({
                    ...prev,
                    error: error.message || 'Failed to load user data',
                }));
            }
        };

        fetchOnboardingStatus();
    }, [user, getToken, profileLoading, isAdmin]);

    // Show loading overlay during initialization
    if (initStatus === 'loading' || initStatus === 'creating_account') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-200">
                <div className="card w-full max-w-md bg-base-100 shadow-xl">
                    <div className="card-body items-center text-center">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <h2 className="card-title mt-4">
                            {initStatus === 'creating_account' 
                                ? 'Setting Up Your Account' 
                                : 'Loading...'}
                        </h2>
                        <p className="text-sm text-base-content/70">
                            {initMessage}
                        </p>
                        {initStatus === 'creating_account' && (
                            <p className="text-xs text-base-content/50 mt-2">
                                This only takes a moment...
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if initialization failed
    if (initStatus === 'error') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-200">
                <div className="card w-full max-w-md bg-base-100 shadow-xl">
                    <div className="card-body items-center text-center">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-4xl text-error"></i>
                        <h2 className="card-title mt-4">Account Setup Issue</h2>
                        <p className="text-sm text-base-content/70">
                            {initMessage}
                        </p>
                        <div className="card-actions mt-4 gap-2">
                            <button 
                                onClick={() => window.location.reload()}
                                className="btn btn-primary"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-rotate-right mr-2"></i>
                                Try Again
                            </button>
                            <button 
                                onClick={() => window.location.href = '/sign-in'}
                                className="btn btn-ghost"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ... rest of the provider implementation remains the same (render children when ready)
```

---

### Phase 4: Update Backend Registration Endpoint

Ensure the `/users/register` endpoint handles duplicates gracefully:

**File**: `services/identity-service/src/v2/users/service.ts`

```typescript
/**
 * Register user (self-registration during sign-up)
 * Handles both new user creation and idempotent calls for existing users.
 */
async registerUser(clerkUserId: string, userData: any) {
    this.logger.info({ clerkUserId }, 'UserService.registerUser - starting');

    // Check if user already exists
    const existingUser = await this.repository.findByClerkId(clerkUserId);
    
    if (existingUser) {
        this.logger.info({ 
            id: existingUser.id, 
            clerkUserId 
        }, 'UserService.registerUser - user already exists, returning existing');
        
        return existingUser;
    }

    // Validate required fields
    if (!userData.email) {
        throw new Error('Email is required for registration');
    }

    const createData = {
        id: uuidv4(),
        clerk_user_id: clerkUserId,
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        onboarding_status: 'pending',
        onboarding_step: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    try {
        const user = await this.repository.create(clerkUserId, createData);

        // Publish event for other services
        await this.eventPublisher?.publish('user.registered', {
            userId: user.id,
            clerkUserId,
            email: user.email,
        });

        this.logger.info({ id: user.id }, 'UserService.registerUser - user registered');
        return user;
    } catch (error: any) {
        // Handle race condition - user might have been created by webhook
        if (error.code === '23505' || error.message?.includes('duplicate')) {
            this.logger.info({ clerkUserId }, 'UserService.registerUser - duplicate detected, fetching existing');
            
            const existingUser = await this.repository.findByClerkId(clerkUserId);
            if (existingUser) {
                return existingUser;
            }
        }
        throw error;
    }
}
```

---

### Phase 5: Add `/users/me` Endpoint to Identity Service

**File**: `services/identity-service/src/v2/users/routes.ts`

The `/users/me` endpoint already exists based on the code excerpts. Ensure it works correctly:

```typescript
// GET /api/v2/users/me - Get current authenticated user
app.get('/api/v2/users/me', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { clerkUserId } = requireUserContext(request);
        
        const user = await userService.getCurrentUser(clerkUserId);
        
        if (!user) {
            return reply.code(404).send({ 
                error: { message: 'User not found' } 
            });
        }
        
        reply.send({ data: user });
    } catch (error) {
        logError('GET /api/v2/users/me failed', error);
        reply.code(500).send({ 
            error: { message: 'Failed to fetch current user' } 
        });
    }
});
```

---

### Phase 6: Verify Clerk Webhook Configuration

Ensure the Clerk webhook is properly configured to handle SSO users:

**File**: `services/identity-service/src/v2/webhooks/routes.ts`

```typescript
// POST /api/v2/webhooks/clerk
app.post('/api/v2/webhooks/clerk', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        // Verify webhook signature with Svix
        const svix = new Webhook(config.clerkWebhookSecret);
        
        const payload = request.body as string;
        const headers = {
            'svix-id': request.headers['svix-id'] as string,
            'svix-timestamp': request.headers['svix-timestamp'] as string,
            'svix-signature': request.headers['svix-signature'] as string,
        };

        const event = svix.verify(payload, headers) as ClerkWebhookEvent;
        
        // Handle the event
        await webhookService.handleClerkWebhook(event);
        
        reply.code(200).send({ received: true });
    } catch (error) {
        logger.error({ error }, 'Webhook verification failed');
        reply.code(400).send({ error: 'Invalid webhook signature' });
    }
});
```

---

## Testing Plan

### Test Case 1: Fresh SSO Sign-Up
1. Clear all user data for test email
2. Sign up via Google OAuth
3. **Expected**: User created during SSO callback
4. **Verify**: User exists in database with `onboarding_status: 'pending'`
5. **Verify**: Onboarding wizard modal appears

### Test Case 2: SSO with Webhook Failure
1. Temporarily disable webhook endpoint
2. Sign up via GitHub OAuth
3. **Expected**: SSO callback creates user (Layer 1)
4. **Verify**: User exists even though webhook didn't fire

### Test Case 3: SSO with Callback Failure
1. Simulate network error during SSO callback
2. **Expected**: Onboarding provider creates user (Layer 3)
3. **Verify**: Modal appears with user created

### Test Case 4: Existing User SSO Sign-In
1. Create user via email/password
2. Sign in via SSO (same email)
3. **Expected**: No duplicate user created
4. **Verify**: Existing user returned, onboarding status preserved

### Test Case 5: Race Condition
1. Trigger simultaneous user creation (webhook + callback)
2. **Expected**: Only one user created (idempotent)
3. **Verify**: No database errors, correct user returned

---

## Deployment Checklist

### Pre-Deployment
- [ ] Backup database
- [ ] Verify Clerk webhook secret is configured
- [ ] Review API Gateway routes for `/users/register` and `/users/me`

### Deployment Steps
1. Deploy `services/identity-service` with updated registration logic
2. Deploy `apps/portal` with updated SSO callback and onboarding provider
3. Verify webhook endpoint is accessible

### Post-Deployment Verification
- [ ] Test Google OAuth sign-up
- [ ] Test GitHub OAuth sign-up
- [ ] Test Microsoft OAuth sign-up
- [ ] Verify existing users can still sign in
- [ ] Verify onboarding wizard appears for new users
- [ ] Check logs for any registration errors

---

## Summary

This plan implements a **three-layer defense** for user creation:

| Layer | Trigger | Purpose |
|-------|---------|---------|
| **Layer 1** | SSO Callback | Immediate user creation after OAuth |
| **Layer 2** | Clerk Webhook | Background sync (backup) |
| **Layer 3** | Onboarding Provider | Fallback for any missed users |

All layers use **idempotent operations** - safe to call multiple times without creating duplicates. This ensures users are always created in the database regardless of which component succeeds first.
