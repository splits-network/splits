/**
 * Business Onboarding Types
 * Types and JSON schemas for company/business onboarding flow.
 */

export interface BusinessOnboardingInput {
    company: {
        name: string;
        website?: string;
        industry?: string;
        size?: string;
        description?: string;
        headquarters_location?: string;
        logo_url?: string;
    };
    billing: {
        billing_terms?: string;
        billing_email: string;
        invoice_delivery_method?: string;
    };
    from_invitation?: { id: string };
    referred_by_recruiter_id?: string;
}

export interface OnboardingUser {
    id: string;
    clerk_user_id: string;
    email: string;
    name: string;
    onboarding_status: string;
    onboarding_step: number;
    onboarding_completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface OnboardingOrganization {
    id: string;
    name: string;
    type: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

export interface OnboardingMembership {
    id: string;
    user_id: string;
    organization_id: string;
    role_name: string;
    created_at: string;
    updated_at: string;
}

export interface OnboardingCompany {
    id: string;
    identity_organization_id: string;
    name: string;
    website: string | null;
    industry: string | null;
    company_size: string | null;
    description: string | null;
    headquarters_location: string | null;
    logo_url: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface OnboardingBillingProfile {
    id: string;
    company_id: string;
    billing_terms: string;
    billing_email: string;
    invoice_delivery_method: string;
    created_at: string;
    updated_at: string;
}

export interface BusinessOnboardingResult {
    user: OnboardingUser;
    organization: OnboardingOrganization;
    company: OnboardingCompany;
    membership: OnboardingMembership;
    billing_profile: OnboardingBillingProfile | null;
    invitation_completed: boolean;
    sourcer_connection_created: boolean;
}

export const businessOnboardingSchema = {
    type: 'object',
    required: ['company', 'billing'],
    properties: {
        company: {
            type: 'object',
            required: ['name'],
            properties: {
                name: { type: 'string', minLength: 1, maxLength: 500 },
                website: { type: 'string', maxLength: 500 },
                industry: { type: 'string', maxLength: 200 },
                size: { type: 'string', maxLength: 100 },
                description: { type: 'string', maxLength: 2000 },
                headquarters_location: { type: 'string', maxLength: 500 },
                logo_url: { type: 'string', maxLength: 1000 },
            },
            additionalProperties: false,
        },
        billing: {
            type: 'object',
            required: ['billing_email'],
            properties: {
                billing_terms: { type: 'string', maxLength: 100 },
                billing_email: { type: 'string', format: 'email', maxLength: 500 },
                invoice_delivery_method: { type: 'string', maxLength: 100 },
            },
            additionalProperties: false,
        },
        from_invitation: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
            },
            additionalProperties: false,
        },
        referred_by_recruiter_id: { type: 'string', format: 'uuid' },
    },
    additionalProperties: false,
};
