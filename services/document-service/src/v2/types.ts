/**
 * V2 Shared Types - Document Service
 * Type definitions for documents and file storage
 */

// ============================================
// DOCUMENTS
// ============================================

export interface Document {
    id: string;
    entity_type: 'candidate' | 'job' | 'application' | 'company' | 'contract';
    entity_id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    storage_bucket: string;
    uploaded_by: string;
    status: 'active' | 'deleted';
    created_at: string;
    updated_at: string;
}

export interface DocumentFilters {
    entity_type?: string;
    entity_id?: string;
    search?: string;
}

export type DocumentUpdate = Partial<Omit<Document, 'id' | 'created_at' | 'updated_at'>>;

// ============================================
// PAGINATION
// ============================================

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}
