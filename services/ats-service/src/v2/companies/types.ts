/**
 * Company Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface CompanyFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    organization_id?: string;
    identity_organization_id?: string;
    org_id?: string;
}

export interface CompanyUpdate {
    name?: string;
    description?: string;
    website?: string;
    status?: string;
    [key: string]: any;
}
