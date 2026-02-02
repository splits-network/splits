"use client";

/**
 * Onboarding Context Provider
 * Manages state for the onboarding wizard across components
 *
 * Includes fallback user creation for SSO sign-ups where
 * the user record may not have been created yet.
 */

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import {
    OnboardingState,
    OnboardingContextType,
    UserRole,
    SelectedPlan,
    StripePaymentInfo,
} from "./types";
import { ApiClient, createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import { ensureUserInDatabase } from "@/lib/user-registration";
import {
    getCachedCurrentUserProfile,
    setCachedCurrentUserProfile,
} from "@/lib/current-user-profile";

type InitStatus = "loading" | "creating_account" | "ready" | "error";

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { signOut } = useClerk();
    const { isAdmin, isLoading: profileLoading } = useUserProfile();

    // Initialization state
    const [initStatus, setInitStatus] = useState<InitStatus>("loading");
    const [initMessage, setInitMessage] = useState<string>("Loading...");
    const [persisting, setPersisting] = useState(false);

    const [state, setState] = useState<OnboardingState>({
        currentStep: 1,
        status: "pending",
        isModalOpen: false,
        selectedRole: null,
        selectedPlan: null,
        stripePaymentInfo: null,
        recruiterProfile: {},
        companyInfo: {},
        submitting: false,
        error: null,
        loading: true,
        persisting: false,
    });

    // Fetch user's onboarding status on mount
    useEffect(() => {
        if (!user || profileLoading) return;

        const fetchOnboardingStatus = async () => {
            setInitStatus("loading");
            setInitMessage("Loading your profile...");

            try {
                const token = await getToken();
                if (!token) throw new Error("No authentication token");

                const apiClient = createAuthenticatedClient(token);
                let userData = null;

                // Step 1: Try /users/me endpoint first (most direct)
                try {
                    const cached = await getCachedCurrentUserProfile(getToken);
                    if (cached) {
                        userData = cached;
                    }
                } catch (meError: any) {
                    // 404 or 500 - user doesn't exist, continue to fallback
                    console.log(
                        "[OnboardingProvider] /users/me failed, trying fallback...",
                    );
                }

                // Step 2: If /me failed, try list endpoint with limit: 1
                if (!userData) {
                    try {
                        const listResponse = await apiClient.get("/users", {
                            params: { limit: 1 },
                        });
                        if (listResponse?.data) {
                            userData = Array.isArray(listResponse.data)
                                ? listResponse.data[0]
                                : listResponse.data;
                        }
                    } catch (listError) {
                        console.log(
                            "[OnboardingProvider] /users list failed, will create user...",
                        );
                    }
                }

                // Step 3: If still no user, create via fallback
                if (!userData) {
                    setInitStatus("creating_account");
                    setInitMessage("Setting up your account...");

                    const result = await ensureUserInDatabase(token, {
                        clerk_user_id: user.id,
                        email: user.primaryEmailAddress?.emailAddress || "",
                        name: user.fullName || user.firstName || "",
                        image_url: user.imageUrl,
                    });

                    if (result.success && result.user) {
                        userData = result.user;
                        setCachedCurrentUserProfile(result.user);
                    } else {
                        throw new Error(
                            result.error || "Failed to create user account",
                        );
                    }
                }

                if (!userData) {
                    throw new Error("Unable to load or create user profile");
                }

                // Load onboarding state from metadata if available
                let loadedState = {
                    currentStep: userData.onboarding_step || 1,
                    status: userData.onboarding_status || "pending",
                    selectedRole: null as UserRole | null,
                    selectedPlan: null,
                    stripePaymentInfo: null,
                    recruiterProfile: {},
                    companyInfo: {},
                };

                // Restore state from onboarding_metadata if exists
                if (
                    userData.onboarding_metadata &&
                    Object.keys(userData.onboarding_metadata).length > 0
                ) {
                    const metadata = userData.onboarding_metadata;
                    loadedState = {
                        currentStep:
                            metadata.current_step ||
                            userData.onboarding_step ||
                            1,
                        status:
                            metadata.status === "completed"
                                ? "completed"
                                : metadata.status === "in_progress"
                                  ? "in_progress"
                                  : "pending",
                        selectedRole: (metadata.user_type as UserRole) || null,
                        selectedPlan: metadata.selected_plan || null,
                        stripePaymentInfo: metadata.stripe_payment_info || null,
                        recruiterProfile: metadata.personal_info || {},
                        companyInfo: metadata.company_info || {},
                    };
                }

                // Skip onboarding modal for platform_admin users (use context value)
                if (isAdmin) {
                    setState((prev) => ({
                        ...prev,
                        ...loadedState,
                        status: "completed", // Mark as completed so modal never shows
                        isModalOpen: false,
                        loading: false,
                    }));
                    setInitStatus("ready");
                    return;
                }

                // Show modal if onboarding is pending or in progress
                const shouldShowModal =
                    loadedState.status === "pending" ||
                    loadedState.status === "in_progress";

                setState((prev) => ({
                    ...prev,
                    ...loadedState,
                    isModalOpen: shouldShowModal,
                    loading: false,
                }));

                setInitStatus("ready");
            } catch (error) {
                console.error(
                    "[OnboardingProvider] Failed to fetch onboarding status:",
                    error,
                );
                setInitStatus("error");
                setInitMessage(
                    error instanceof Error
                        ? error.message
                        : "Failed to load your profile",
                );
            }
        };

        fetchOnboardingStatus();
    }, [user, getToken, profileLoading, isAdmin]);

    // Auto-save state changes to database (debounced)
    useEffect(() => {
        if (
            initStatus !== "ready" ||
            state.loading ||
            state.status === "completed"
        )
            return;
        if (!user?.id) return;

        const timeoutId = setTimeout(() => {
            persistOnboardingState();
        }, 1000); // Debounce 1 second

        return () => clearTimeout(timeoutId);
    }, [
        state.currentStep,
        state.selectedRole,
        state.selectedPlan,
        state.stripePaymentInfo,
        state.recruiterProfile,
        state.companyInfo,
        initStatus,
        state.loading,
        state.status,
        user?.id,
    ]);

    const persistOnboardingState = async () => {
        if (persisting || !user?.id) return; // Prevent concurrent saves

        try {
            setPersisting(true);
            const token = await getToken();
            if (!token) return;

            const apiClient = createAuthenticatedClient(token);

            const metadata = {
                user_type: state.selectedRole,
                current_step: state.currentStep,
                completed_steps: Array.from(
                    { length: state.currentStep - 1 },
                    (_, i) => i + 1,
                ),
                last_active_step: state.currentStep,

                // Form data
                personal_info:
                    state.selectedRole === "recruiter"
                        ? state.recruiterProfile
                        : undefined,
                company_info:
                    state.selectedRole !== "recruiter"
                        ? state.companyInfo
                        : undefined,
                selected_plan: state.selectedPlan,
                stripe_payment_info: state.stripePaymentInfo,

                // Completion tracking
                personal_info_completed:
                    state.selectedRole === "recruiter" &&
                    !!state.recruiterProfile?.bio,
                company_info_completed:
                    state.selectedRole !== "recruiter" &&
                    !!state.companyInfo?.name,
                payment_completed:
                    !state.selectedPlan || !!state.stripePaymentInfo,

                // Session metadata
                started_at: new Date().toISOString(),
                last_updated_at: new Date().toISOString(),
                device_info: {
                    user_agent: navigator.userAgent,
                    platform: navigator.platform,
                },
            };

            await apiClient.patch("/users/me", {
                onboarding_metadata: metadata,
                onboarding_step: state.currentStep,
                onboarding_status: state.status,
            });

            console.log("Onboarding state persisted to database");
        } catch (error) {
            console.error("Failed to persist onboarding state:", error);
        } finally {
            setPersisting(false);
        }
    };

    const handleRetry = () => {
        window.location.reload();
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const actions = {
        setStep: async (step: number) => {
            setState((prev) => ({
                ...prev,
                currentStep: step,
                status: step === 2 ? "in_progress" : prev.status,
            }));
            // State will auto-persist via useEffect
        },

        setRole: (role: UserRole) => {
            setState((prev) => ({ ...prev, selectedRole: role }));
        },

        setSelectedPlan: (plan: SelectedPlan | null) => {
            setState((prev) => ({ ...prev, selectedPlan: plan }));
        },

        setStripePaymentInfo: (info: StripePaymentInfo | null) => {
            setState((prev) => ({ ...prev, stripePaymentInfo: info }));
        },

        setRecruiterProfile: (profile: OnboardingState["recruiterProfile"]) => {
            setState((prev) => ({ ...prev, recruiterProfile: profile }));
        },

        setCompanyInfo: (info: OnboardingState["companyInfo"]) => {
            setState((prev) => ({ ...prev, companyInfo: info }));
        },

        submitOnboarding: async () => {
            const {
                selectedRole,
                recruiterProfile,
                companyInfo,
                selectedPlan,
                stripePaymentInfo,
            } = state;
            const billingEmail = companyInfo?.billing_email?.trim();

            if (!selectedRole) {
                setState((prev) => ({
                    ...prev,
                    error: "Please select a role",
                }));
                return;
            }

            if (selectedRole === "company_admin" && !companyInfo?.name) {
                setState((prev) => ({
                    ...prev,
                    error: "Company name is required",
                }));
                return;
            }
            if (
                selectedRole === "company_admin" &&
                !companyInfo?.billing_terms
            ) {
                setState((prev) => ({
                    ...prev,
                    error: "Billing terms are required",
                }));
                return;
            }
            if (selectedRole === "company_admin" && !billingEmail) {
                setState((prev) => ({
                    ...prev,
                    error: "Billing email is required",
                }));
                return;
            }

            // For recruiters, a plan must be selected
            if (selectedRole === "recruiter" && !selectedPlan) {
                setState((prev) => ({
                    ...prev,
                    error: "Please select a subscription plan",
                }));
                return;
            }

            setState((prev) => ({ ...prev, submitting: true, error: null }));

            try {
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);

                // Get current user data
                const response = await client.get("/users", {
                    params: { limit: 1 },
                });
                if (!response?.data) throw new Error("No user data found");
                const userData = Array.isArray(response.data)
                    ? response.data[0]
                    : response.data;
                if (!userData) throw new Error("No user data found");

                // Sequential API calls following V2 architecture

                // Step 1: Create organization
                let organizationName: string;
                let organizationType: "recruiter" | "company";

                if (selectedRole === "recruiter" && !recruiterProfile) {
                    setState((prev) => ({
                        ...prev,
                        error: "Recruiter profile is required",
                        submitting: false,
                    }));
                    return;
                }
                if (selectedRole === "recruiter") {
                    try {
                        // Create recruiter profile
                        const { data: recruiter } = await client.post(
                            "/recruiters",
                            {
                                user_id: userData.id,
                                bio: recruiterProfile?.bio,
                                phone: recruiterProfile?.phone,
                                industries: recruiterProfile?.industries || [],
                                specialties:
                                    recruiterProfile?.specialties || [],
                                location: recruiterProfile?.location || [],
                                tagline: recruiterProfile?.tagline || null,
                                years_experience:
                                    recruiterProfile?.years_experience || null,
                            },
                        );

                        // Activate subscription if plan selected
                        if (selectedPlan) {
                            const isPaidPlan =
                                selectedPlan.tier !== "starter" &&
                                selectedPlan.price_monthly > 0;

                            const activateData: any = {
                                plan_id: selectedPlan.id,
                            };

                            // Include payment info for paid plans
                            if (isPaidPlan && stripePaymentInfo) {
                                activateData.payment_method_id =
                                    stripePaymentInfo.paymentMethodId;
                                activateData.customer_id =
                                    stripePaymentInfo.customerId;

                                // Include promotion code if discount was applied
                                if (stripePaymentInfo.appliedDiscount?.code) {
                                    activateData.promotion_code =
                                        stripePaymentInfo.appliedDiscount.code;
                                }
                            }

                            await client.post(
                                "/subscriptions/activate",
                                activateData,
                            );
                        }
                    } catch (error: any) {
                        setState((prev) => ({
                            ...prev,
                            error:
                                error.message ||
                                "Failed to complete onboarding",
                            submitting: false,
                        }));
                    }
                    // organizationName = userData.name || userData.email?.split('@')[0] || 'Recruiter';
                    // organizationType = 'recruiter';
                } else if (selectedRole === "company_admin") {
                    if (!companyInfo?.name) {
                        throw new Error("Company name is required");
                    }
                    organizationName = companyInfo.name;
                    organizationType = "company";
                    const orgSlug = organizationName
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");

                    const { data: organization } = await client.post(
                        "/organizations",
                        {
                            name: organizationName,
                            type: organizationType,
                            slug: orgSlug,
                        },
                    );

                    const { data: company } = await client.post("/companies", {
                        identity_organization_id: organization.id,
                        name: organizationName,
                        website: companyInfo?.website || null,
                        industry: companyInfo?.industry || null,
                        company_size: companyInfo?.size || null,
                        description: companyInfo?.description || null,
                        headquarters_location:
                            companyInfo?.headquarters_location || null,
                        logo_url: companyInfo?.logo_url || null,
                    });

                    // Step 2: Create membership BEFORE billing profile
                    // This ensures the user has company_admin role for billing operations
                    await client.post("/memberships", {
                        user_id: userData.id,
                        organization_id: organization.id,
                        role: selectedRole,
                    });

                    await client.post(
                        `/company-billing-profiles/${company.id}`,
                        {
                            billing_terms:
                                companyInfo?.billing_terms || "net_30",
                            billing_email: billingEmail || "",
                            invoice_delivery_method: "email",
                        },
                    );
                } else {
                    throw new Error("Invalid role");
                }

                // Step 3: Update user onboarding status
                await client.patch(`/users/${userData.id}`, {
                    onboarding_status: "completed",
                    onboarding_step: 4,
                    onboarding_completed_at: new Date().toISOString(),
                });

                // Move to completion step
                setState((prev) => ({
                    ...prev,
                    currentStep: 4,
                    status: "completed",
                    submitting: false,
                }));

                // Close modal after 2 seconds
                setTimeout(() => {
                    setState((prev) => ({ ...prev, isModalOpen: false }));
                    // Reload to refresh user data
                    window.location.reload();
                }, 2000);
            } catch (error: any) {
                setState((prev) => ({
                    ...prev,
                    error: error.message || "Failed to complete onboarding",
                    submitting: false,
                }));
            }
        },

        closeModal: () => {
            // Only allow closing if completed
            if (state.status === "completed") {
                setState((prev) => ({ ...prev, isModalOpen: false }));
            }
        },
    };

    // Show loading/creating account overlay during initialization
    if (initStatus === "loading" || initStatus === "creating_account") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="card w-full max-w-md bg-base-100 shadow-xl">
                    <div className="card-body items-center text-center">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <h2 className="card-title mt-4">
                            {initStatus === "creating_account"
                                ? "Setting Up Your Account"
                                : "Loading..."}
                        </h2>
                        <p className="text-base-content/70">
                            {initStatus === "creating_account"
                                ? "Finalizing your account setup..."
                                : initMessage}
                        </p>
                        {initStatus === "creating_account" && (
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
    if (initStatus === "error") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="card w-full max-w-md bg-base-100 shadow-xl">
                    <div className="card-body items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-3xl text-error"></i>
                        </div>
                        <h2 className="card-title mt-4">
                            Unable to Load Profile
                        </h2>
                        <p className="text-base-content/70">{initMessage}</p>
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
        <OnboardingContext.Provider
            value={{
                state,
                loading: state.loading || false,
                persisting: persisting,
                actions,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding must be used within OnboardingProvider");
    }
    return context;
}
