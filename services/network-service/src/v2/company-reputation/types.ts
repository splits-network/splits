/**
 * Company Reputation Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination.js';

export interface CompanyReputationFilters extends PaginationParams, SortParams {
    company_id?: string;
}

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}
