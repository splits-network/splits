/**
 * Invitation Domain Types
 */

export interface InvitationFilters {
    organization_id?: string;
    company_id?: string | null;
    email?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export interface InvitationUpdate {
    status?: string;
}
