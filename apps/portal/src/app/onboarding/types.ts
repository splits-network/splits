/**
 * Full-Page Onboarding Wizard Types
 * Re-exports shared types and defines page-specific types
 */

export type {
    OnboardingMetadata,
} from "@splits-network/shared-types";

export type OnboardingStatus = "pending" | "in_progress" | "completed" | "skipped";

export type UserRole = "recruiter" | "company_admin";

export type PlanTier = "starter" | "pro" | "partner";

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

export interface FromInvitation {
    id: string;
    recruiter_id: string;
    company_name_hint?: string;
}

export interface OnboardingState {
    currentStep: number;
    status: OnboardingStatus;
    selectedRole: UserRole | null;
    selectedPlan: SelectedPlan | null;
    stripePaymentInfo: StripePaymentInfo | null;
    fromInvitation?: FromInvitation;
    recruiterProfile: {
        bio?: string;
        phone?: string;
        industries?: string[];
        specialties?: string[];
        location?: string;
        tagline?: string;
        years_experience?: number;
        teamInviteCode?: string;
    };
    companyInfo: {
        name?: string;
        website?: string;
        industry?: string;
        size?: string;
        description?: string;
        headquarters_location?: string;
        logo_url?: string;
        billing_terms?: "immediate" | "net_30" | "net_60" | "net_90";
        billing_email?: string;
    };
    submitting: boolean;
    error: string | null;
    loading: boolean;
}

export interface OnboardingActions {
    setStep: (step: number) => Promise<void>;
    setRole: (role: UserRole) => void;
    setSelectedPlan: (plan: SelectedPlan | null) => void;
    setStripePaymentInfo: (info: StripePaymentInfo | null) => void;
    setRecruiterProfile: (profile: OnboardingState["recruiterProfile"]) => void;
    setCompanyInfo: (info: OnboardingState["companyInfo"]) => void;
    submitOnboarding: () => Promise<void>;
}
