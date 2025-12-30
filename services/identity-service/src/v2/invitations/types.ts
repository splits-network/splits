/**
 * Invitation Domain Types
 */

export interface InvitationFilters {
    organization_id?: string;
    email?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export interface InvitationUpdate {
    status?: string;
}
