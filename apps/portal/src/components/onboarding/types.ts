/**
 * Onboarding Wizard Types
 * Shared types for the onboarding wizard system
 */

export type OnboardingStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export type UserRole = 'recruiter' | 'company_admin';

export type PlanTier = 'starter' | 'pro' | 'partner';

export interface SelectedPlan {
  id: string;
  tier: PlanTier;
  name: string;
  price_monthly: number;
  trial_days?: number;
}

export interface StripePaymentInfo {
  customerId: string;
  paymentMethodId: string;
}

export interface OnboardingState {
  // From database
  currentStep: number; // 1-4
  status: OnboardingStatus;

  // Wizard state
  isModalOpen: boolean;
  selectedRole: UserRole | null;

  // Plan selection state
  selectedPlan: SelectedPlan | null;
  stripePaymentInfo: StripePaymentInfo | null;

  // Form data
  recruiterProfile?: {
    bio?: string;
    phone?: string;
    industries?: string[];
    specialties?: string[];
    location?: string;
    tagline?: string;
    years_experience?: number;
    teamInviteCode?: string;
  };
  companyInfo?: {
    name: string;
    website?: string;
    industry?: string;
    size?: string;
    description?: string;
    headquarters_location?: string;
    logo_url?: string;
  };

  // UI state
  submitting: boolean;
  error: string | null;
}

export interface OnboardingContextType {
  state: OnboardingState;
  actions: {
    setStep: (step: number) => void;
    setRole: (role: UserRole) => void;
    setSelectedPlan: (plan: SelectedPlan | null) => void;
    setStripePaymentInfo: (info: StripePaymentInfo | null) => void;
    setRecruiterProfile: (profile: OnboardingState['recruiterProfile']) => void;
    setCompanyInfo: (info: OnboardingState['companyInfo']) => void;
    submitOnboarding: () => Promise<void>;
    closeModal: () => void;
  };
}
