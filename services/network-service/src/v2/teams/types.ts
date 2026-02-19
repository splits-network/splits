/**
 * Team Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface TeamFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
}

export interface TeamUpdate {
    name?: string;
    status?: string;
}

export interface CreateTeamRequest {
    name: string;
}

export interface TeamMemberFilters extends PaginationParams {
    status?: string;
    role?: string;
}

export interface CreateTeamInvitationRequest {
    email: string;
    role: 'admin' | 'member' | 'collaborator';
}

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}
