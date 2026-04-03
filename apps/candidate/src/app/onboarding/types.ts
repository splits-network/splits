/**
 * Full-Page Onboarding Wizard Types (Candidate)
 *
 * Streamlined 3-step flow: Welcome → Import Smart Resume → All Set.
 */

export type OnboardingStatus = "pending" | "in_progress" | "completed" | "skipped";

export type CandidateOnboardingStep = 1 | 2 | 3;

export interface CandidateProfileData {
    // Step 2: Smart Resume Import
    resumeFile?: File | null;
    resumeUploaded?: boolean;
    resumeDocumentId?: string;
}

export interface CandidateOnboardingState {
    currentStep: CandidateOnboardingStep;
    status: OnboardingStatus;
    profileData: CandidateProfileData;
    candidateId: string | null;
    submitting: boolean;
    error: string | null;
    loading: boolean;
}

export interface CandidateOnboardingActions {
    setStep: (step: number) => Promise<void>;
    updateProfileData: (data: Partial<CandidateProfileData>) => void;
    submitOnboarding: () => Promise<void>;
    skipOnboarding: () => Promise<void>;
}
