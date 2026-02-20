/**
 * Full-Page Onboarding Wizard Types (Candidate)
 *
 * Simpler than the portal types — no role selection, no Stripe, no company flow.
 * All candidates follow a single 6-step flow.
 */

export type OnboardingStatus = "pending" | "in_progress" | "completed" | "skipped";

export type CandidateOnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface CandidateProfileData {
    // Step 1: Welcome
    full_name?: string;

    // Step 2: Contact & Professional
    phone?: string;
    location?: string;
    current_title?: string;
    current_company?: string;
    bio?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;

    // Step 3: Resume
    resumeFile?: File | null;
    resumeUploaded?: boolean;
    resumeDocumentId?: string;

    // Step 4: Preferences
    desired_job_type?: string;
    availability?: string;
    open_to_remote?: boolean;
    open_to_relocation?: boolean;
    desired_salary_min?: number;
    desired_salary_max?: number;
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

export const JOB_TYPE_OPTIONS = [
    { value: "full_time", label: "Full-time" },
    { value: "part_time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
    { value: "internship", label: "Internship" },
] as const;

export const SALARY_RANGES = [
    { min: 0, max: 50000, label: "Under $50K" },
    { min: 50000, max: 75000, label: "$50K - $75K" },
    { min: 75000, max: 100000, label: "$75K - $100K" },
    { min: 100000, max: 150000, label: "$100K - $150K" },
    { min: 150000, max: 200000, label: "$150K - $200K" },
    { min: 200000, max: 300000, label: "$200K - $300K" },
    { min: 300000, max: null, label: "$300K+" },
] as const;

export const AVAILABILITY_OPTIONS = [
    { value: "immediately", label: "Immediately" },
    { value: "2_weeks", label: "Within 2 weeks" },
    { value: "1_month", label: "Within 1 month" },
    { value: "2_months", label: "Within 2 months" },
    { value: "3_months", label: "Within 3 months" },
    { value: "not_looking", label: "Not actively looking" },
] as const;
