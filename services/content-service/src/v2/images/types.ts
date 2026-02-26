/**
 * Content Images — Filter and Update Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface ImageFilters extends PaginationParams, SortParams {
    search?: string;
    tags?: string;
    mime_type?: string;
}

export interface ImageCreate {
    filename: string;
    original_filename: string;
    storage_path: string;
    public_url: string;
    alt_text?: string;
    mime_type: string;
    file_size: number;
    width?: number;
    height?: number;
    tags?: string[];
    uploaded_by: string;
}

export interface ImageUpdate {
    alt_text?: string;
    tags?: string[];
    filename?: string;
}
