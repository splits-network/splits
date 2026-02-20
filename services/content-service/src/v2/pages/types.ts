/**
 * Content Pages — Filter and Update Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface PageFilters extends PaginationParams, SortParams {
    app?: string;
    category?: string;
    status?: string;
    search?: string;
}

export interface PageCreate {
    slug: string;
    app: string;
    title: string;
    description?: string;
    og_image?: string;
    category?: string;
    status?: string;
    published_at?: string;
    author?: string;
    read_time?: string;
    blocks: any[];
    meta?: Record<string, any>;
}

export interface PageUpdate {
    title?: string;
    slug?: string;
    description?: string;
    og_image?: string;
    category?: string;
    status?: string;
    published_at?: string;
    author?: string;
    read_time?: string;
    blocks?: any[];
    meta?: Record<string, any>;
}
