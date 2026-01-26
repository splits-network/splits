'use client';

/**
 * Onboarding Context Provider
 * Manages state for the onboarding wizard across components
 * 
 * Includes fallback user creation for SSO sign-ups where
 * the user record may not have been created yet.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import { OnboardingState, OnboardingContextType, UserRole } from './types';
import { ApiClient, createAuthenticatedClient } from '@/lib/api-client';
import { useUserProfile } from '@/contexts';
import { ensureUserInDatabase } from '@/lib/user-registration';

type InitStatus = 'loading' | 'creating_account' | 'ready' | 'error';

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { signOut } = useClerk();
    const { isAdmin, isLoading: profileLoading } = useUserProfile();
    
    // Initialization state
    const [initStatus, setInitStatus] = useState<InitStatus>('loading');
    const [initMessage, setInitMessage] = useState<string>('Loading...');
    
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
            setInitMessage('Loading your profile...');
            
            try {
                const token = await getToken();
                if (!token) throw new Error('No authentication token');

                const apiClient = createAuthenticatedClient(token);
                let userData = null;

                // Step 1: Try /users/me endpoint first (most direct)
                try {
                    const meResponse = await apiClient.get('/users/me');
                    if (meResponse?.data) {
                        userData = meResponse.data;
                    }
                } catch (meError: any) {
                    // 404 or 500 - user doesn't exist, continue to fallback
                    console.log('[OnboardingProvider] /users/me failed, trying fallback...');
                }

                // Step 2: If /me failed, try list endpoint with limit: 1
                if (!userData) {
                    try {
                        const listResponse = await apiClient.get('/users', { params: { limit: 1 } });
                        if (listResponse?.data) {
                            userData = Array.isArray(listResponse.data) 
                                ? listResponse.data[0] 
                                : listResponse.data;
                        }
                    } catch (listError) {
                        console.log('[OnboardingProvider] /users list failed, will create user...');
                    }
                }

                // Step 3: If still no user, create via fallback
                if (!userData) {
                    setInitStatus('creating_account');
                    setInitMessage('Setting up your account...');
                    
                    const result = await ensureUserInDatabase(token, {
                        clerk_user_id: user.id,
                        email: user.primaryEmailAddress?.emailAddress || '',
                        name: user.fullName || user.firstName || '',
                        image_url: user.imageUrl,
                    });

                    if (result.success && result.user) {
                        userData = result.user;
                    } else {
                        throw new Error(result.error || 'Failed to create user account');
                    }
                }

                if (!userData) {
                    throw new Error('Unable to load or create user profile');
                }

                // Skip onboarding modal for platform_admin users (use context value)
                if (isAdmin) {
                    setState(prev => ({
                        ...prev,
                        currentStep: userData.onboarding_step || 1,
                        status: 'completed', // Mark as completed so modal never shows
                        isModalOpen: false,
                    }));
                    setInitStatus('ready');
                    return;
                }

                // Show modal if onboarding is pending or in progress
                const shouldShowModal = userData.onboarding_status === 'pending' || userData.onboarding_status === 'in_progress';

                setState(prev => ({
                    ...prev,
                    currentStep: userData.onboarding_step || 1,
                    status: userData.onboarding_status || 'pending',
                    isModalOpen: shouldShowModal,
                }));
                
                setInitStatus('ready');
            } catch (error) {
                console.error('[OnboardingProvider] Failed to fetch onboarding status:', error);
                setInitStatus('error');
                setInitMessage(error instanceof Error ? error.message : 'Failed to load your profile');
            }
        };

        fetchOnboardingStatus();
    }, [user, getToken, profileLoading, isAdmin]);

    const handleRetry = () => {
        window.location.reload();
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const actions = {
        setStep: async (step: number) => {
            setState(prev => ({
                ...prev,
                currentStep: step,
                status: step === 2 ? 'in_progress' : prev.status
            }));

            // Update backend with new step
            try {
                const token = await getToken();
                if (!token) return;

                const apiClient = new ApiClient(token);

                // Get current user data using V2 API
                const response = await apiClient.get('/users', { params: { limit: 1 } });
                if (!response?.data) return;

                // Handle both array and single object responses
                const userData = Array.isArray(response.data) ? response.data[0] : response.data;
                if (!userData) return;

                // Update onboarding step using API client
                await apiClient.patch(`/users/${userData.id}`, { onboarding_step: step });
            } catch (error) {
                console.error('Failed to update onboarding step:', error);
            }
        },

        setRole: (role: UserRole) => {
            setState(prev => ({ ...prev, selectedRole: role }));
        },

        setRecruiterProfile: (profile: OnboardingState['recruiterProfile']) => {
            setState(prev => ({ ...prev, recruiterProfile: profile }));
        },

        setCompanyInfo: (info: OnboardingState['companyInfo']) => {
            setState(prev => ({ ...prev, companyInfo: info }));
        },

        submitOnboarding: async () => {
            const { selectedRole, recruiterProfile, companyInfo } = state;

            if (!selectedRole) {
                setState(prev => ({ ...prev, error: 'Please select a role' }));
                return;
            }

            if (selectedRole === 'company_admin' && !companyInfo?.name) {
                setState(prev => ({ ...prev, error: 'Company name is required' }));
                return;
            }

            setState(prev => ({ ...prev, submitting: true, error: null }));

            try {
                const token = await getToken();
                if (!token) throw new Error('No authentication token');

                const apiClient = new ApiClient(token);

                // Get current user data
                const response = await apiClient.get('/users', { params: { limit: 1 } });
                if (!response?.data) throw new Error('No user data found');
                const userData = Array.isArray(response.data) ? response.data[0] : response.data;
                if (!userData) throw new Error('No user data found');

                // Sequential API calls following V2 architecture

                // Step 1: Create organization
                let organizationName: string;
                let organizationType: 'recruiter' | 'company';

                if (selectedRole === 'recruiter' && !recruiterProfile) {
                    setState(prev => ({ ...prev, error: 'Recruiter profile is required', submitting: false }));
                    return;
                }
                if (selectedRole === 'recruiter') {
                    try {
                        const { data: recruiter } = await apiClient.post('/recruiters', {
                            user_id: userData.id,
                            bio: recruiterProfile?.bio,
                            phone: recruiterProfile?.phone,
                            industries: recruiterProfile?.industries || [],
                            specialties: recruiterProfile?.specialties || [],
                            location: recruiterProfile?.location || [],
                            tagline: recruiterProfile?.tagline || null,
                            years_experience: recruiterProfile?.years_experience || null,
                        });
                    } catch (error: any) {
                        setState(prev => ({
                            ...prev,
                            error: error.message || 'Failed to complete onboarding',
                            submitting: false,
                        }));
                    }
                    // organizationName = userData.name || userData.email?.split('@')[0] || 'Recruiter';
                    // organizationType = 'recruiter';
                } else if (selectedRole === 'company_admin') {
                    if (!companyInfo?.name) {
                        throw new Error('Company name is required');
                    }
                    organizationName = companyInfo.name;
                    organizationType = 'company';
                    const orgSlug = organizationName
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');

                    const { data: organization } = await apiClient.post('/organizations', {
                        name: organizationName,
                        type: organizationType,
                        slug: orgSlug,
                    });

                    const { data: company } = await apiClient.post('/companies', {
                        identity_organization_id: organization.id,
                        name: organizationName,
                        website: companyInfo?.website || null,
                        industry: companyInfo?.industry || null,
                        company_size: companyInfo?.size || null,
                    });

                    // Step 2: Create membership
                    await apiClient.post('/memberships', {
                        user_id: userData.id,
                        organization_id: organization.id,
                        role: selectedRole,
                    });
                } else {
                    throw new Error('Invalid role');
                }


                // Step 3: Update user onboarding status
                await apiClient.patch(`/users/${userData.id}`, {
                    onboarding_status: 'completed',
                    onboarding_step: 4,
                    onboarding_completed_at: new Date().toISOString(),
                });

                // Move to completion step
                setState(prev => ({
                    ...prev,
                    currentStep: 4,
                    status: 'completed',
                    submitting: false,
                }));

                // Close modal after 2 seconds
                setTimeout(() => {
                    setState(prev => ({ ...prev, isModalOpen: false }));
                    // Reload to refresh user data
                    window.location.reload();
                }, 2000);

            } catch (error: any) {
                setState(prev => ({
                    ...prev,
                    error: error.message || 'Failed to complete onboarding',
                    submitting: false,
                }));
            }
        },

        closeModal: () => {
            // Only allow closing if completed
            if (state.status === 'completed') {
                setState(prev => ({ ...prev, isModalOpen: false }));
            }
        },
    };

    // Show loading/creating account overlay during initialization
    if (initStatus === 'loading' || initStatus === 'creating_account') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="card w-full max-w-md bg-base-100 shadow-xl">
                    <div className="card-body items-center text-center">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <h2 className="card-title mt-4">
                            {initStatus === 'creating_account' ? 'Setting Up Your Account' : 'Loading...'}
                        </h2>
                        <p className="text-base-content/70">
                            {initStatus === 'creating_account' 
                                ? 'Finalizing your account setup...' 
                                : initMessage}
                        </p>
                        {initStatus === 'creating_account' && (
                            <p className="text-sm text-base-content/50 mt-2">
                                This only takes a moment...
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Show error state with retry options
    if (initStatus === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="card w-full max-w-md bg-base-100 shadow-xl">
                    <div className="card-body items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-3xl text-error"></i>
                        </div>
                        <h2 className="card-title mt-4">Unable to Load Profile</h2>
                        <p className="text-base-content/70">
                            {initMessage}
                        </p>
                        <p className="text-sm text-base-content/50 mt-2">
                            Please try again or sign out and sign back in.
                        </p>
                        <div className="card-actions mt-4 gap-2">
                            <button 
                                className="btn btn-primary"
                                onClick={handleRetry}
                            >
                                <i className="fa-duotone fa-regular fa-arrows-rotate mr-2"></i>
                                Try Again
                            </button>
                            <button 
                                className="btn btn-ghost"
                                onClick={handleSignOut}
                            >
                                <i className="fa-duotone fa-regular fa-right-from-bracket mr-2"></i>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <OnboardingContext.Provider value={{ state, actions }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within OnboardingProvider');
    }
    return context;
}
