/**
 * Company Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface CompanyFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
}

export interface CompanyUpdate {
    name?: string;
    description?: string;
    website?: string;
    status?: string;
    [key: string]: any;
}
