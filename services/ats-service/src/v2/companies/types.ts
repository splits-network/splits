/**
 * Company Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination.js';

export interface CompanyFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    organization_id?: string;
    identity_organization_id?: string;
    org_id?: string;
    /** When true, skips organization-based filtering to show all companies (marketplace browse) */
    browse_all?: string;
    industry?: string;
    company_size?: string;
    stage?: string;
    founded_year_range?: string;
    has_open_roles?: string;
}

export interface CompanyUpdate {
    name?: string;
    description?: string;
    website?: string;
    status?: string;
    stage?: string | null;
    founded_year?: number | null;
    tagline?: string | null;
    linkedin_url?: string | null;
    twitter_url?: string | null;
    glassdoor_url?: string | null;
    [key: string]: any;
}
