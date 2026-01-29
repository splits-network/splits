"use client";

/**
 * Candidate Onboarding Context Provider
 * Manages state for the candidate onboarding wizard
 *
 * Includes fallback user/candidate creation for SSO sign-ups where
 * records may not have been created yet.
 */

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
    CandidateOnboardingState,
    CandidateOnboardingContextType,
    OnboardingStep,
    CandidateProfileData,
} from "./types";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    ensureUserAndCandidateInDatabase,
    type CandidateData,
} from "@/lib/user-registration";

/**
 * Parse desired_job_type from database (stored as comma-separated string) to string array
 */
function parseJobTypes(value: string | null | undefined): string[] {
    if (!value) return [];
    // Split by comma and trim whitespace
    return value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
}

/**
 * Serialize desired_job_type array to comma-separated string for database
 */
function serializeJobTypes(types: string[] | undefined): string | undefined {
    if (!types || types.length === 0) return undefined;
    return types.join(", ");
}

type InitStatus = "loading" | "creating_account" | "ready" | "error";

const OnboardingContext = createContext<CandidateOnboardingContextType | null>(
    null,
);

export function useOnboarding(): CandidateOnboardingContextType {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error(
            "useOnboarding must be used within an OnboardingProvider",
        );
    }
    return context;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { signOut } = useClerk();
    const pathname = usePathname();

    // Initialization state
    const [initStatus, setInitStatus] = useState<InitStatus>("loading");
    const [initMessage, setInitMessage] = useState<string>("Loading...");
    const [candidateId, setCandidateId] = useState<string | null>(null);

    const [state, setState] = useState<CandidateOnboardingState>({
        currentStep: 1,
        status: "pending",
        isModalOpen: false,
        profileData: {},
        submitting: false,
        error: null,
    });

    // Check if we're on invitation-related routes that should skip onboarding
    const isInvitationRoute = pathname?.startsWith("/portal/invitation/");

    // Fetch candidate's onboarding status on mount
    useEffect(() => {
        if (!user) return;

        // Skip onboarding logic for invitation routes
        if (isInvitationRoute) {
            console.log(
                "[OnboardingProvider] Skipping onboarding for invitation route:",
                pathname,
            );
            setInitStatus("ready");
            setInitMessage("");
            return;
        }

        const fetchOnboardingStatus = async () => {
            setInitStatus("loading");
            setInitMessage("Loading your profile...");

            try {
                const token = await getToken();
                if (!token) throw new Error("No authentication token");

                const apiClient = createAuthenticatedClient(token);
                let candidateData: CandidateData | null = null;

                // Step 1: Try /candidates/me endpoint first (most direct)
                try {
                    const meResponse = await apiClient.get<{
                        data: CandidateData;
                    }>("/candidates/me");
                    if (meResponse?.data) {
                        candidateData = meResponse.data;
                    }
                } catch (meError: any) {
                    // 404 or 500 - candidate doesn't exist, continue to fallback
                    console.log(
                        "[OnboardingProvider] /candidates/me failed, trying fallback...",
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
                            email: user.primaryEmailAddress?.emailAddress || "",
                            name: user.fullName || user.firstName || "",
                            image_url: user.imageUrl,
                        },
                    );

                    if (result.success && result.candidate) {
                        candidateData = result.candidate;
                    } else if (result.success && !result.candidate) {
                        // User exists but candidate doesn't - try creating candidate again
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

                setCandidateId(candidateData.id);

                // Check onboarding status and show modal if needed
                const shouldShowModal =
                    candidateData.onboarding_status === "pending";

                // Pre-fill profile data from existing candidate data
                const profileData: CandidateProfileData = {
                    // Basic info
                    full_name: candidateData.full_name || "",
                    phone: candidateData.phone || "",
                    location: candidateData.location || "",
                    // Professional background
                    current_title: candidateData.current_title || "",
                    current_company: candidateData.current_company || "",
                    bio: candidateData.bio || "",
                    // Online presence
                    linkedin_url: candidateData.linkedin_url || "",
                    github_url: candidateData.github_url || "",
                    portfolio_url: candidateData.portfolio_url || "",
                    // Job preferences
                    desired_job_type: parseJobTypes(
                        candidateData.desired_job_type,
                    ),
                    availability: candidateData.availability || "",
                    open_to_remote: candidateData.open_to_remote || false,
                    open_to_relocation:
                        candidateData.open_to_relocation || false,
                    desired_salary_min:
                        candidateData.desired_salary_min || undefined,
                    desired_salary_max:
                        candidateData.desired_salary_max || undefined,
                };

                setState((prev) => ({
                    ...prev,
                    currentStep: 1,
                    status:
                        (candidateData!
                            .onboarding_status as CandidateOnboardingState["status"]) ||
                        "pending",
                    isModalOpen: shouldShowModal,
                    profileData,
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
    }, [user, getToken, isInvitationRoute, pathname]);

    const handleRetry = () => {
        window.location.reload();
    };

    const handleSignOut = async () => {
        await signOut();
    };

    // Navigation actions
    const nextStep = () => {
        setState((prev) => {
            const next = Math.min(prev.currentStep + 1, 4) as OnboardingStep;
            return { ...prev, currentStep: next };
        });
    };

    const previousStep = () => {
        setState((prev) => {
            const prev_step = Math.max(
                prev.currentStep - 1,
                1,
            ) as OnboardingStep;
            return { ...prev, currentStep: prev_step };
        });
    };

    const goToStep = (step: OnboardingStep) => {
        setState((prev) => ({ ...prev, currentStep: step }));
    };

    const updateProfileData = (data: Partial<CandidateProfileData>) => {
        setState((prev) => ({
            ...prev,
            profileData: { ...prev.profileData, ...data },
        }));
    };

    const closeModal = () => {
        setState((prev) => ({ ...prev, isModalOpen: false }));
    };

    const openModal = () => {
        setState((prev) => ({ ...prev, isModalOpen: true, currentStep: 1 }));
    };

    const skipOnboarding = async () => {
        if (!candidateId) return;

        setState((prev) => ({ ...prev, submitting: true, error: null }));

        try {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");

            const apiClient = createAuthenticatedClient(token);

            // Update candidate's onboarding status to 'skipped'
            await apiClient.patch(`/candidates/${candidateId}`, {
                onboarding_status: "skipped",
            });

            setState((prev) => ({
                ...prev,
                status: "skipped",
                isModalOpen: false,
                submitting: false,
            }));
        } catch (error) {
            console.error(
                "[OnboardingProvider] Failed to skip onboarding:",
                error,
            );
            setState((prev) => ({
                ...prev,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to skip onboarding",
                submitting: false,
            }));
        }
    };

    const completeOnboarding = async () => {
        if (!candidateId) return;

        setState((prev) => ({ ...prev, submitting: true, error: null }));

        try {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");

            const apiClient = createAuthenticatedClient(token);
            const { profileData } = state;

            // Build update payload with only non-empty values
            const updatePayload: Record<string, any> = {
                onboarding_status: "completed",
            };

            // Basic info
            if (profileData.full_name) {
                updatePayload.full_name = profileData.full_name;
            }
            if (profileData.phone) {
                updatePayload.phone = profileData.phone;
            }
            if (profileData.location) {
                updatePayload.location = profileData.location;
            }

            // Professional background
            if (profileData.current_title) {
                updatePayload.current_title = profileData.current_title;
            }
            if (profileData.current_company) {
                updatePayload.current_company = profileData.current_company;
            }
            if (profileData.bio) {
                updatePayload.bio = profileData.bio;
            }

            // Online presence
            if (profileData.linkedin_url) {
                updatePayload.linkedin_url = profileData.linkedin_url;
            }
            if (profileData.github_url) {
                updatePayload.github_url = profileData.github_url;
            }
            if (profileData.portfolio_url) {
                updatePayload.portfolio_url = profileData.portfolio_url;
            }

            // Job preferences - serialize array to comma-separated string for database
            const serializedJobTypes = serializeJobTypes(
                profileData.desired_job_type,
            );
            if (serializedJobTypes) {
                updatePayload.desired_job_type = serializedJobTypes;
            }
            if (profileData.availability) {
                updatePayload.availability = profileData.availability;
            }
            if (profileData.open_to_remote !== undefined) {
                updatePayload.open_to_remote = profileData.open_to_remote;
            }
            if (profileData.open_to_relocation !== undefined) {
                updatePayload.open_to_relocation =
                    profileData.open_to_relocation;
            }
            if (profileData.desired_salary_min !== undefined) {
                updatePayload.desired_salary_min =
                    profileData.desired_salary_min;
            }
            if (profileData.desired_salary_max !== undefined) {
                updatePayload.desired_salary_max =
                    profileData.desired_salary_max;
            }

            // Update candidate profile
            await apiClient.patch(`/candidates/${candidateId}`, updatePayload);

            setState((prev) => ({
                ...prev,
                status: "completed",
                isModalOpen: false,
                submitting: false,
            }));

            // Optionally reload to refresh data
            // window.location.reload();
        } catch (error) {
            console.error(
                "[OnboardingProvider] Failed to complete onboarding:",
                error,
            );
            setState((prev) => ({
                ...prev,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to complete onboarding",
                submitting: false,
            }));
        }
    };

    const contextValue: CandidateOnboardingContextType = {
        state,
        candidateId,
        nextStep,
        previousStep,
        goToStep,
        updateProfileData,
        skipOnboarding,
        completeOnboarding,
        closeModal,
        openModal,
    };

    // Show loading overlay during initialization
    if (initStatus === "loading" || initStatus === "creating_account") {
        return (
            <OnboardingContext.Provider value={contextValue}>
                <div className="fixed inset-0 bg-base-300/80 z-[9999] flex items-center justify-center">
                    <div className="card bg-base-100 shadow-xl max-w-md w-full mx-4">
                        <div className="card-body items-center text-center">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <h2 className="card-title mt-4">{initMessage}</h2>
                            <p className="text-sm text-base-content/70">
                                {initStatus === "creating_account"
                                    ? "Setting up your profile for the first time..."
                                    : "Please wait while we load your data..."}
                            </p>
                        </div>
                    </div>
                </div>
                {children}
            </OnboardingContext.Provider>
        );
    }

    // Show error overlay
    if (initStatus === "error") {
        return (
            <OnboardingContext.Provider value={contextValue}>
                <div className="fixed inset-0 bg-base-300/80 z-[9999] flex items-center justify-center">
                    <div className="card bg-base-100 shadow-xl max-w-md w-full mx-4">
                        <div className="card-body items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-circle-exclamation text-3xl text-error"></i>
                            </div>
                            <h2 className="card-title mt-4 text-error">
                                Something went wrong
                            </h2>
                            <p className="text-sm text-base-content/70">
                                {initMessage}
                            </p>
                            <div className="card-actions mt-4 flex gap-2">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleRetry}
                                >
                                    <i className="fa-duotone fa-regular fa-rotate-right mr-2"></i>
                                    Try Again
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={handleSignOut}
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {children}
            </OnboardingContext.Provider>
        );
    }

    return (
        <OnboardingContext.Provider value={contextValue}>
            {children}
        </OnboardingContext.Provider>
    );
}
