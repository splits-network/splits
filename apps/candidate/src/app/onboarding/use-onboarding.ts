"use client";

/**
 * Full-Page Onboarding State Hook (Candidate)
 *
 * Streamlined for the 3-step flow: Welcome → Import Smart Resume → All Set.
 * State is persisted to onboarding_metadata JSONB on every step navigation.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import type { UserData } from "@/lib/user-registration";
import type {
    CandidateOnboardingState,
    CandidateOnboardingActions,
    CandidateOnboardingStep,
    CandidateProfileData,
} from "./types";

type InitStatus = "loading" | "creating_account" | "ready" | "error";

export interface UseOnboardingReturn {
    state: CandidateOnboardingState;
    actions: CandidateOnboardingActions;
    initStatus: InitStatus;
    initMessage: string;
    persisting: boolean;
    handleRetry: () => void;
    handleSignOut: () => Promise<void>;
}

const INITIAL_STATE: CandidateOnboardingState = {
    currentStep: 1,
    status: "pending",
    profileData: {},
    candidateId: null,
    submitting: false,
    error: null,
    loading: true,
};

interface UseOnboardingOptions {
    redirectUrl?: string;
}

export function useOnboarding(options?: UseOnboardingOptions): UseOnboardingReturn {
    const redirectUrl = options?.redirectUrl;
    const { user } = useUser();
    const { getToken } = useAuth();
    const { signOut } = useClerk();
    const { isAdmin, isLoading: profileLoading } = useUserProfile();

    const [state, setState] = useState<CandidateOnboardingState>(INITIAL_STATE);
    const [initStatus, setInitStatus] = useState<InitStatus>("loading");
    const [initMessage, setInitMessage] = useState("Loading your profile...");
    const [persisting, setPersisting] = useState(false);

    const stateRef = useRef(state);
    stateRef.current = state;

    // ── Initialization ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!user || profileLoading) return;

        let active = true;

        const init = async () => {
            try {
                const token = await getToken();
                if (!token) throw new Error("No authentication token");
                if (!active) return;

                const client = createAuthenticatedClient(token);

                setInitStatus("creating_account");
                setInitMessage("Setting up your account...");

                const initResponse = await client.post<{
                    data: {
                        user: UserData;
                        candidate: { id: string } | null;
                    };
                }>("/onboarding/init", {
                    email: user.primaryEmailAddress?.emailAddress || "",
                    name: user.fullName || user.firstName || "",
                    image_url: user.imageUrl,
                    source_app: "candidate",
                });

                if (!active) return;

                const userData = initResponse?.data?.user ?? null;
                const candidateData = initResponse?.data?.candidate ?? null;

                if (!candidateData) {
                    throw new Error(
                        "Failed to create candidate profile. Please try again.",
                    );
                }

                if (!active) return;

                // Already completed or admin → go to dashboard
                if (isAdmin || userData?.onboarding_status === "completed") {
                    window.location.href = redirectUrl || "/portal/dashboard";
                    return;
                }

                if (userData?.onboarding_status === "skipped") {
                    window.location.href = redirectUrl || "/portal/dashboard";
                    return;
                }

                // Restore state from onboarding_metadata
                let restoredStep: CandidateOnboardingStep = 1;
                let restoredProfileData: CandidateProfileData = {};

                const rawMetadata = (userData as any)?.onboarding_metadata;
                if (
                    rawMetadata &&
                    typeof rawMetadata === "object" &&
                    Object.keys(rawMetadata).length > 0
                ) {
                    restoredStep = (rawMetadata.current_step || 1) as CandidateOnboardingStep;
                    restoredProfileData = rawMetadata.profile_data || {};
                }

                if (!active) return;

                setState((prev) => ({
                    ...prev,
                    currentStep: restoredStep,
                    status: restoredStep > 1 ? "in_progress" : "pending",
                    profileData: {
                        resumeUploaded: restoredProfileData.resumeUploaded ?? false,
                        resumeDocumentId: restoredProfileData.resumeDocumentId ?? undefined,
                    },
                    candidateId: candidateData.id,
                    loading: false,
                }));

                setInitStatus("ready");
            } catch (error) {
                if (!active) return;
                console.error("[useOnboarding] Failed to initialize:", error);
                setInitStatus("error");
                setInitMessage(
                    error instanceof Error
                        ? error.message
                        : "Failed to load your profile",
                );
            }
        };

        init();
        return () => { active = false; };
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
                current_step: s.currentStep,
                completed_steps: Array.from(
                    { length: s.currentStep - 1 },
                    (_, i) => i + 1,
                ),
                last_active_step: s.currentStep,
                profile_data: s.profileData,
                started_at: new Date().toISOString(),
                last_updated_at: new Date().toISOString(),
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
    const actions: CandidateOnboardingActions = {
        setStep: async (step: number) => {
            setState((prev) => ({
                ...prev,
                currentStep: step as CandidateOnboardingStep,
                status:
                    prev.status === "pending" && step > 1
                        ? "in_progress"
                        : prev.status,
            }));
            setTimeout(() => persistState(), 0);
        },

        updateProfileData: (data: Partial<CandidateProfileData>) => {
            setState((prev) => ({
                ...prev,
                profileData: { ...prev.profileData, ...data },
            }));
        },

        submitOnboarding: async () => {
            setState((prev) => ({ ...prev, submitting: true, error: null }));

            try {
                const token = await getToken();
                if (!token) throw new Error("No authentication token");

                const apiClient = createAuthenticatedClient(token);

                // Mark onboarding as completed
                await apiClient.patch("/users/me", {
                    onboarding_status: "completed",
                });

                // Move to success step
                setState((prev) => ({
                    ...prev,
                    currentStep: 3,
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

        skipOnboarding: async () => {
            setState((prev) => ({ ...prev, submitting: true, error: null }));

            try {
                const token = await getToken();
                if (!token) throw new Error("No authentication token");

                const apiClient = createAuthenticatedClient(token);
                await apiClient.patch("/users/me", {
                    onboarding_status: "skipped",
                });

                window.location.href = redirectUrl || "/portal/dashboard";
            } catch (error: any) {
                setState((prev) => ({
                    ...prev,
                    error: error.message || "Failed to skip onboarding",
                    submitting: false,
                }));
            }
        },
    };

    const handleRetry = () => {
        window.location.reload();
    };

    const handleSignOut = async () => {
        await signOut();
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
