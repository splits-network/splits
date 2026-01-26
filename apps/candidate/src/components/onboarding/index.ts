/**
 * Candidate Onboarding Components
 * Export all onboarding-related components and types
 */

export { OnboardingProvider, useOnboarding } from './onboarding-provider';
export { OnboardingWizardModal } from './onboarding-wizard-modal';
export { WelcomeStep } from './steps/welcome-step';
export { ContactStep } from './steps/contact-step';
export { ResumeStep } from './steps/resume-step';
export { PreferencesStep } from './steps/preferences-step';

export type { 
    OnboardingStep, 
    OnboardingStatus, 
    CandidateOnboardingState, 
    CandidateOnboardingContextType,
    CandidateProfileData,
    JobTypeOption,
    SalaryRange,
    AvailabilityOption,
} from './types';

export { JOB_TYPE_OPTIONS, SALARY_RANGES, AVAILABILITY_OPTIONS } from './types';
