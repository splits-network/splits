/**
 * Firm Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface FirmFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
}

export interface FirmUpdate {
    name?: string;
    status?: string;
}

export interface CreateFirmRequest {
    name: string;
}

export interface FirmMemberFilters extends PaginationParams {
    status?: string;
    role?: string;
}

export interface CreateFirmInvitationRequest {
    email: string;
    role: 'admin' | 'member' | 'collaborator';
}

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}
