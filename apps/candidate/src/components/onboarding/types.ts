/**
 * Candidate Onboarding Types
 * Type definitions for the candidate onboarding wizard
 */

export type OnboardingStep = 1 | 2 | 3 | 4;

export type OnboardingStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface CandidateProfileData {
    // Basic Info (Step 1)
    full_name?: string;

    // Contact Info (Step 2)
    phone?: string;
    location?: string;

    // Resume (Step 3)
    resumeFile?: File | null;
    resumeUploaded?: boolean;
    resumeDocumentId?: string;

    // Professional Info (Step 4 - expanded)
    current_title?: string;
    current_company?: string;
    bio?: string;

    // Social/Portfolio Links (Step 4)
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;

    // Job Preferences (Step 4)
    desired_job_type?: string;
    open_to_remote?: boolean;
    open_to_relocation?: boolean;
    desired_salary_min?: number;
    desired_salary_max?: number;
    availability?: string;
}

export interface CandidateOnboardingState {
    currentStep: OnboardingStep;
    status: OnboardingStatus;
    isModalOpen: boolean;
    profileData: CandidateProfileData;
    submitting: boolean;
    error: string | null;
}

export interface CandidateOnboardingContextType {
    state: CandidateOnboardingState;
    candidateId: string | null;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: OnboardingStep) => void;
    updateProfileData: (data: Partial<CandidateProfileData>) => void;
    skipOnboarding: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
    closeModal: () => void;
    openModal: () => void;
}

export const JOB_TYPE_OPTIONS = [
    { value: 'full_time', label: 'Full-time' },
    { value: 'part_time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
] as const;

export const SALARY_RANGES = [
    { min: 0, max: 50000, label: 'Under $50K' },
    { min: 50000, max: 75000, label: '$50K - $75K' },
    { min: 75000, max: 100000, label: '$75K - $100K' },
    { min: 100000, max: 150000, label: '$100K - $150K' },
    { min: 150000, max: 200000, label: '$150K - $200K' },
    { min: 200000, max: 300000, label: '$200K - $300K' },
    { min: 300000, max: null, label: '$300K+' },
] as const;

export const AVAILABILITY_OPTIONS = [
    { value: 'immediately', label: 'Immediately' },
    { value: '2_weeks', label: 'Within 2 weeks' },
    { value: '1_month', label: 'Within 1 month' },
    { value: '2_months', label: 'Within 2 months' },
    { value: '3_months', label: 'Within 3 months' },
    { value: 'not_looking', label: 'Not actively looking' },
] as const;

export type JobTypeOption = (typeof JOB_TYPE_OPTIONS)[number];
export type SalaryRange = (typeof SALARY_RANGES)[number];
export type AvailabilityOption = (typeof AVAILABILITY_OPTIONS)[number];
