/**
 * Company Platform Invitation Types - V2
 * Types for recruiter-initiated company platform invitations
 */

import { Recruiter } from "@splits-network/shared-types";

export interface CompanyPlatformInvitation {
    id: string;
    recruiter_id: string;
    invite_code: string;
    invite_link_token: string;
    invited_email?: string;
    company_name_hint?: string;
    personal_message?: string;
    status: 'pending' | 'accepted' | 'expired' | 'revoked';
    expires_at: string;
    accepted_at?: string;
    accepted_by_user_id?: string;
    created_organization_id?: string;
    created_company_id?: string;
    email_sent_at?: string;
    created_at: string;
    updated_at: string;
    // Enriched data
    recruiter?: {
        id: string;
        name: string;
        tagline?: string;
        location?: string;
        years_experience?: number;
        industries?: string[];
        specialties?: string[];
        profile_image_url?: string;
        user: {
            name: string;
            email: string;
        };
    };
}

export interface CreateCompanyInvitationRequest {
    invited_email?: string;
    company_name_hint?: string;
    personal_message?: string;
    send_email?: boolean;
}

export interface AcceptCompanyInvitationRequest {
    company_name: string;
    industry?: string;
    company_size?: string;
    website?: string;
}

export interface CompanyInvitationFilters {
    recruiter_id?: string;
    status?: 'pending' | 'accepted' | 'expired' | 'revoked';
    invited_email?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface CompanyInvitationUpdate {
    status?: 'pending' | 'accepted' | 'expired' | 'revoked';
    email_sent_at?: string;
    accepted_at?: string;
    accepted_by_user_id?: string;
    created_organization_id?: string;
    created_company_id?: string;
}

export interface InvitationLookupResult {
    id: string;
    invite_code: string;
    company_name_hint?: string;
    personal_message?: string;
    status: 'pending' | 'accepted' | 'expired' | 'revoked';
    expires_at: string;
    recruiter: {
        name: string;
        tagline?: string;
        location?: string;
        years_experience?: number;
        industries?: string[];
        specialties?: string[];
        profile_image_url?: string;
    };
    is_valid: boolean;
    error_message?: string;
}
