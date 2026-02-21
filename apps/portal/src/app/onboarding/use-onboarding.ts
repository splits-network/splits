"use client";

/**
 * Full-Page Onboarding State Hook
 *
 * Extracted from onboarding-provider.tsx — same business logic, persistence,
 * and API calls, but without modal/context overhead. This hook is consumed
 * directly by the onboarding page component (single consumer, no provider).
 *
 * State is persisted to onboarding_metadata JSONB on every step navigation,
 * so users can close the browser and resume exactly where they left off.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import type {
    OnboardingState,
    OnboardingActions,
    UserRole,
    SelectedPlan,
    StripePaymentInfo,
    FromInvitation,
} from "./types";

type InitStatus = "loading" | "ready" | "error";

export interface UseOnboardingReturn {
    state: OnboardingState;
    actions: OnboardingActions;
    initStatus: InitStatus;
    initMessage: string;
    persisting: boolean;
    handleRetry: () => void;
    handleSignOut: () => Promise<void>;
}

const INITIAL_STATE: OnboardingState = {
    currentStep: 1,
    status: "pending",
    selectedRole: null,
    selectedPlan: null,
    stripePaymentInfo: null,
    fromInvitation: undefined,
    recruiterProfile: {},
    companyInfo: {},
    submitting: false,
    error: null,
    loading: true,
};

export function useOnboarding(): UseOnboardingReturn {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { isAdmin, isLoading: profileLoading, logout } = useUserProfile();

    const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
    const [initStatus, setInitStatus] = useState<InitStatus>("loading");
    const [initMessage, setInitMessage] = useState("Loading your profile...");
    const [persisting, setPersisting] = useState(false);

    // Ref to hold latest state for persistence (avoids stale closures)
    const stateRef = useRef(state);
    stateRef.current = state;

    // ── Initialization ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!user || profileLoading) return;

        const init = async () => {
            try {
                const token = await getToken();
                if (!token) throw new Error("No authentication token");

                const client = createAuthenticatedClient(token);

                // Single call — creates user if missing, returns existing otherwise
                const initResponse = await client.post<{
                    data: { user: any };
                }>("/onboarding/init", {
                    email: user.primaryEmailAddress?.emailAddress || "",
                    name: user.fullName || user.firstName || "",
                    image_url: user.imageUrl,
                    source_app: "portal",
                });

                const data = initResponse?.data?.user ?? null;

                if (!data) {
                    throw new Error("Unable to load user profile");
                }

                // Admin or already completed → go to dashboard
                // Hard navigation to avoid stale UserProfile context redirect loop
                if (isAdmin || data.onboarding_status === "completed") {
                    window.location.href = "/portal/dashboard";
                    return;
                }

                // Restore state from onboarding_metadata
                let loadedState: Partial<OnboardingState> = {
                    currentStep: data.onboarding_step || 1,
                    status: data.onboarding_status || "pending",
                    selectedRole: null,
                    selectedPlan: null,
                    stripePaymentInfo: null,
                    fromInvitation: undefined,
                    recruiterProfile: {},
                    companyInfo: {},
                };

                if (
                    data.onboarding_metadata &&
                    Object.keys(data.onboarding_metadata).length > 0
                ) {
                    const md = data.onboarding_metadata;

                    const fromInvitation = md.from_invitation as
                        | FromInvitation
                        | undefined;

                    // Pre-fill company name from invitation hint
                    let companyInfo = md.company_info || {};
                    if (fromInvitation?.company_name_hint && !companyInfo.name) {
                        companyInfo = {
                            ...companyInfo,
                            name: fromInvitation.company_name_hint,
                        };
                    }

                    loadedState = {
                        currentStep:
                            md.current_step || data.onboarding_step || 1,
                        status:
                            md.status === "completed"
                                ? "completed"
                                : md.status === "in_progress"
                                  ? "in_progress"
                                  : "pending",
                        selectedRole: (md.user_type as UserRole) || null,
                        selectedPlan: md.selected_plan || null,
                        stripePaymentInfo: md.stripe_payment_info || null,
                        fromInvitation,
                        recruiterProfile: md.personal_info || {},
                        companyInfo,
                    };
                }

                setState((prev) => ({
                    ...prev,
                    ...loadedState,
                    loading: false,
                }));

                setInitStatus("ready");
            } catch (error) {
                console.error(
                    "[useOnboarding] Failed to initialize:",
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

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, profileLoading, isAdmin]);

    // ── Persistence ────────────────────────────────────────────────────────
    const persistState = useCallback(async () => {
        if (persisting || !user?.id) return;

        try {
            setPersisting(true);
            const token = await getToken();
            if (!token) return;

            const apiClient = createAuthenticatedClient(token);
            const s = stateRef.current;

            const metadata = {
                user_type: s.selectedRole,
                current_step: s.currentStep,
                completed_steps: Array.from(
                    { length: s.currentStep - 1 },
                    (_, i) => i + 1,
                ),
                last_active_step: s.currentStep,
                personal_info:
                    s.selectedRole === "recruiter"
                        ? s.recruiterProfile
                        : undefined,
                company_info:
                    s.selectedRole !== "recruiter" ? s.companyInfo : undefined,
                selected_plan: s.selectedPlan,
                stripe_payment_info: s.stripePaymentInfo,
                from_invitation: s.fromInvitation,
                personal_info_completed:
                    s.selectedRole === "recruiter" &&
                    !!s.recruiterProfile?.bio,
                company_info_completed:
                    s.selectedRole !== "recruiter" && !!s.companyInfo?.name,
                payment_completed:
                    !s.selectedPlan || !!s.stripePaymentInfo,
                started_at: new Date().toISOString(),
                last_updated_at: new Date().toISOString(),
                device_info: {
                    user_agent: navigator.userAgent,
                    platform: navigator.platform,
                },
            };

            await apiClient.patch("/users/me", {
                onboarding_metadata: metadata,
                onboarding_step: s.currentStep,
                onboarding_status: s.status,
            });
        } catch (error) {
            console.error("Failed to persist onboarding state:", error);
        } finally {
            setPersisting(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [persisting, user?.id]);

    // ── Actions ────────────────────────────────────────────────────────────
    const actions: OnboardingActions = {
        setStep: async (step: number) => {
            setState((prev) => ({
                ...prev,
                currentStep: step,
                status:
                    prev.status === "pending" && step > 1
                        ? "in_progress"
                        : prev.status,
            }));
            await persistState();
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

        setRecruiterProfile: (
            profile: OnboardingState["recruiterProfile"],
        ) => {
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
                fromInvitation,
            } = stateRef.current;
            const billingEmail = companyInfo?.billing_email?.trim();

            // ── Validation ──
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

                // ── Recruiter flow — single backend call ──
                if (selectedRole === "recruiter") {
                    if (!recruiterProfile) {
                        setState((prev) => ({
                            ...prev,
                            error: "Recruiter profile is required",
                            submitting: false,
                        }));
                        return;
                    }

                    const isPaidPlan =
                        selectedPlan &&
                        selectedPlan.tier !== "starter" &&
                        selectedPlan.price_monthly > 0;

                    const planData: any = {
                        plan_id: selectedPlan!.id,
                        tier: selectedPlan!.tier,
                    };

                    if (isPaidPlan && stripePaymentInfo) {
                        planData.payment_method_id =
                            stripePaymentInfo.paymentMethodId;
                        planData.customer_id =
                            stripePaymentInfo.customerId;
                        if (stripePaymentInfo.appliedDiscount?.code) {
                            planData.promotion_code =
                                stripePaymentInfo.appliedDiscount.code;
                        }
                    }

                    await client.post("/onboarding/recruiter", {
                        profile: {
                            bio: recruiterProfile?.bio,
                            phone: recruiterProfile?.phone,
                            industries: recruiterProfile?.industries || [],
                            specialties: recruiterProfile?.specialties || [],
                            location: recruiterProfile?.location || [],
                            tagline: recruiterProfile?.tagline || null,
                            years_experience:
                                recruiterProfile?.years_experience || null,
                        },
                        plan: planData,
                    });

                    // ── Company flow — single backend call ──
                } else if (selectedRole === "company_admin") {
                    if (!companyInfo?.name) {
                        throw new Error("Company name is required");
                    }

                    await client.post("/onboarding/business", {
                        company: {
                            name: companyInfo.name,
                            website: companyInfo?.website || null,
                            industry: companyInfo?.industry || null,
                            size: companyInfo?.size || null,
                            description: companyInfo?.description || null,
                            headquarters_location:
                                companyInfo?.headquarters_location || null,
                            logo_url: companyInfo?.logo_url || null,
                        },
                        billing: {
                            billing_terms:
                                companyInfo?.billing_terms || "net_30",
                            billing_email: billingEmail || "",
                            invoice_delivery_method: "email",
                        },
                        from_invitation: fromInvitation?.id
                            ? { id: fromInvitation.id }
                            : undefined,
                        referred_by_recruiter_id: undefined,
                    });
                } else {
                    throw new Error("Invalid role");
                }

                // Move to success step
                setState((prev) => ({
                    ...prev,
                    currentStep: 5,
                    status: "completed",
                    submitting: false,
                }));
            } catch (error: any) {
                setState((prev) => ({
                    ...prev,
                    error: error.message || "Failed to complete onboarding",
                    submitting: false,
                }));
            }
        },
    };

    const handleRetry = () => {
        window.location.reload();
    };

    const handleSignOut = async () => {
        await logout();
    };

    return {
        state,
        actions,
        initStatus,
        initMessage,
        persisting,
        handleRetry,
        handleSignOut,
    };
}
