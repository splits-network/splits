/**
 * Onboarding Wizard Types
 * Shared types for the onboarding wizard system
 */

import { OnboardingMetadata } from '@splits-network/shared-types';

export type { OnboardingMetadata };

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
  appliedDiscount?: any;
}

// Invitation reference when user came from a recruiter invitation
export interface FromInvitation {
  id: string;
  recruiter_id: string;
  company_name_hint?: string;
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

  // Invitation reference (when user came from recruiter invitation)
  fromInvitation?: FromInvitation;

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
    name?: string;
    website?: string;
    industry?: string;
    size?: string;
    description?: string;
    headquarters_location?: string;
    logo_url?: string;
    billing_terms?: 'immediate' | 'net_30' | 'net_60' | 'net_90';
    billing_email?: string;
  };

  // UI state
  submitting: boolean;
  error: string | null;
  loading?: boolean; // Loading state from database
  persisting?: boolean; // Auto-saving state to database
}

export interface OnboardingContextType {
  state: OnboardingState;
  loading: boolean;
  persisting: boolean;
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
