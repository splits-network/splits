"use client";

/**
 * Full-Page Onboarding State Hook (Candidate)
 *
 * Adapted from portal's use-onboarding.ts — same persistence pattern,
 * but simplified for candidates (no role selection, no Stripe).
 *
 * State is persisted to onboarding_metadata JSONB on every step navigation,
 * so users can close the browser and resume exactly where they left off.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import {
    ensureUserAndCandidateInDatabase,
    type CandidateData,
    type UserData,
} from "@/lib/user-registration";
import { getCachedCurrentUserProfile } from "@/lib/current-user-profile";
import { buildCandidatePayload } from "@/lib/onboarding-actions";
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

export function useOnboarding(): UseOnboardingReturn {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { signOut } = useClerk();
    const { isAdmin, isLoading: profileLoading } = useUserProfile();

    const [state, setState] = useState<CandidateOnboardingState>(INITIAL_STATE);
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
                let candidateData: CandidateData | null = null;
                let userData: UserData | null = null;

                // Step 1: Try /candidates/me endpoint first
                try {
                    const meResponse = await client.get<{
                        data: CandidateData;
                    }>("/candidates/me");
                    if (meResponse?.data) {
                        candidateData = meResponse.data;
                    }
                } catch (meError: any) {
                    // 404 or 500 — candidate doesn't exist, continue to fallback
                    console.log(
                        "[useOnboarding] /candidates/me failed, trying fallback...",
                    );
                }

                // Step 2: If /me failed, create user and candidate via fallback
                if (!candidateData) {
                    setInitStatus("creating_account");
                    setInitMessage("Setting up your account...");

                    const result = await ensureUserAndCandidateInDatabase(
                        token,
                        {
                            clerk_user_id: user.id,
                            email:
                                user.primaryEmailAddress?.emailAddress || "",
                            name: user.fullName || user.firstName || "",
                            image_url: user.imageUrl,
                        },
                    );

                    if (result.success && result.candidate) {
                        candidateData = result.candidate;
                        userData = result.user;
                    } else if (result.success && !result.candidate) {
                        throw new Error(
                            "Failed to create candidate profile. Please try again.",
                        );
                    } else {
                        throw new Error(
                            result.error || "Failed to create user account",
                        );
                    }
                }

                if (!candidateData) {
                    throw new Error(
                        "Unable to load or create candidate profile",
                    );
                }

                // Step 3: If we don't have user data yet, fetch it
                if (!userData) {
                    userData = (await getCachedCurrentUserProfile(
                        async () => token,
                    )) as UserData | null;
                }

                // Admin or already completed → go to dashboard
                // Hard navigation to avoid stale UserProfile context redirect loop
                if (isAdmin || userData?.onboarding_status === "completed") {
                    window.location.href = "/portal/dashboard";
                    return;
                }

                // Skipped → also go to dashboard (user must explicitly come back via banner)
                if (userData?.onboarding_status === "skipped") {
                    window.location.href = "/portal/dashboard";
                    return;
                }

                // Restore state from onboarding_metadata (JSONB field not on the typed interface)
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

                // Pre-fill from existing candidate data (merge with restored)
                const profileData: CandidateProfileData = {
                    full_name:
                        restoredProfileData.full_name ||
                        candidateData.full_name ||
                        "",
                    phone:
                        restoredProfileData.phone ||
                        candidateData.phone ||
                        "",
                    location:
                        restoredProfileData.location ||
                        candidateData.location ||
                        "",
                    current_title:
                        restoredProfileData.current_title ||
                        candidateData.current_title ||
                        "",
                    current_company:
                        restoredProfileData.current_company ||
                        candidateData.current_company ||
                        "",
                    bio:
                        restoredProfileData.bio || candidateData.bio || "",
                    linkedin_url:
                        restoredProfileData.linkedin_url ||
                        candidateData.linkedin_url ||
                        "",
                    github_url:
                        restoredProfileData.github_url ||
                        candidateData.github_url ||
                        "",
                    portfolio_url:
                        restoredProfileData.portfolio_url ||
                        candidateData.portfolio_url ||
                        "",
                    desired_job_type:
                        restoredProfileData.desired_job_type ||
                        candidateData.desired_job_type ||
                        "",
                    availability:
                        restoredProfileData.availability ||
                        candidateData.availability ||
                        "",
                    open_to_remote:
                        restoredProfileData.open_to_remote ??
                        candidateData.open_to_remote ??
                        false,
                    open_to_relocation:
                        restoredProfileData.open_to_relocation ??
                        candidateData.open_to_relocation ??
                        false,
                    desired_salary_min:
                        restoredProfileData.desired_salary_min ??
                        candidateData.desired_salary_min ??
                        undefined,
                    desired_salary_max:
                        restoredProfileData.desired_salary_max ??
                        candidateData.desired_salary_max ??
                        undefined,
                    // Resume state is not pre-filled from candidate (File objects don't persist)
                    resumeUploaded:
                        restoredProfileData.resumeUploaded ?? false,
                    resumeDocumentId:
                        restoredProfileData.resumeDocumentId ?? undefined,
                };

                setState((prev) => ({
                    ...prev,
                    currentStep: restoredStep,
                    status:
                        restoredStep > 1 ? "in_progress" : "pending",
                    profileData,
                    candidateId: candidateData!.id,
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
                current_step: s.currentStep,
                completed_steps: Array.from(
                    { length: s.currentStep - 1 },
                    (_, i) => i + 1,
                ),
                last_active_step: s.currentStep,
                profile_data: s.profileData,
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
            // Persist after a tick so stateRef picks up the new state
            setTimeout(() => persistState(), 0);
        },

        updateProfileData: (data: Partial<CandidateProfileData>) => {
            setState((prev) => ({
                ...prev,
                profileData: { ...prev.profileData, ...data },
            }));
        },

        submitOnboarding: async () => {
            const s = stateRef.current;
            if (!s.candidateId) {
                setState((prev) => ({
                    ...prev,
                    error: "No candidate profile found",
                }));
                return;
            }

            setState((prev) => ({ ...prev, submitting: true, error: null }));

            try {
                const token = await getToken();
                if (!token) throw new Error("No authentication token");

                const apiClient = createAuthenticatedClient(token);
                const candidatePayload = buildCandidatePayload(
                    s.profileData,
                );

                // Update candidate profile and user status in parallel
                await Promise.all([
                    Object.keys(candidatePayload).length > 0
                        ? apiClient.patch(
                              `/candidates/${s.candidateId}`,
                              candidatePayload,
                          )
                        : Promise.resolve(),
                    apiClient.patch("/users/me", {
                        onboarding_status: "completed",
                        onboarding_completed_at: new Date().toISOString(),
                    }),
                ]);

                // Move to success step
                setState((prev) => ({
                    ...prev,
                    currentStep: 6,
                    status: "completed",
                    submitting: false,
                }));
            } catch (error: any) {
                setState((prev) => ({
                    ...prev,
                    error:
                        error.message || "Failed to complete onboarding",
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

                // Hard navigation to dashboard
                window.location.href = "/portal/dashboard";
            } catch (error: any) {
                setState((prev) => ({
                    ...prev,
                    error:
                        error.message || "Failed to skip onboarding",
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
