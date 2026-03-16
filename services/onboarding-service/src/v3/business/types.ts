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
        billing_terms: string;
        billing_email: string;
        invoice_delivery_method?: string;
    };
    from_invitation?: { id: string };
    referred_by_recruiter_id?: string;
}

export interface BusinessOnboardingResult {
    user: any;
    organization: any;
    company: any;
    membership: any;
    billing_profile: any | null;
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
        },
        referred_by_recruiter_id: { type: 'string', format: 'uuid' },
    },
    additionalProperties: false,
};
