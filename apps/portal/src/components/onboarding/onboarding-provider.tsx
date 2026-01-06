'use client';

/**
 * Onboarding Context Provider
 * Manages state for the onboarding wizard across components
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { OnboardingState, OnboardingContextType, UserRole } from './types';
import { ApiClient, createAuthenticatedClient } from '@/lib/api-client';

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const { getToken } = useAuth();
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
        if (!user) return;

        const fetchOnboardingStatus = async () => {
            try {
                const token = await getToken();
                if (!token) throw new Error('No authentication token');

                const apiClient = createAuthenticatedClient(token);

                // Get current user data using V2 API
                const response = await apiClient.get('/users', { params: { limit: 1 } });
                if (!response?.data) throw new Error('No user data found');

                // Handle both array and single object responses
                const userData = Array.isArray(response.data) ? response.data[0] : response.data;
                if (!userData) throw new Error('No user data found');

                // Skip onboarding modal for platform_admin users
                const isPlatformAdmin = userData.memberships?.some((m: any) => m.role === 'platform_admin');
                if (isPlatformAdmin) {
                    setState(prev => ({
                        ...prev,
                        currentStep: userData.onboarding_step || 1,
                        status: 'completed', // Mark as completed so modal never shows
                        isModalOpen: false,
                    }));
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
            } catch (error) {
                console.error('Failed to fetch onboarding status:', error);
            }
        };

        fetchOnboardingStatus();
    }, [user, getToken]);

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

                const payload: any = { role: selectedRole };
                if (selectedRole === 'recruiter') {
                    payload.profile = recruiterProfile;
                } else {
                    payload.company = companyInfo;
                }

                const apiClient = new ApiClient(token);

                // Get current user data using V2 API
                const userResponse = await apiClient.get('/users', { params: { limit: 1 } });
                if (!userResponse?.data) throw new Error('No user data found');

                // Handle both array and single object responses
                const userData = Array.isArray(userResponse.data) ? userResponse.data[0] : userResponse.data;
                if (!userData) throw new Error('No user data found');

                // Call completion endpoint using ApiClient
                await apiClient.post(`/users/${userData.id}/complete-onboarding`, payload);

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
