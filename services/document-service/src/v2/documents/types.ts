/**
 * Document Domain Types
 */

export type DocumentStatus = 'active' | 'deleted';
export type ProcessingStatus = 'pending' | 'processing' | 'processed' | 'failed';

export interface Document {
    id: string;
    entity_type:
    | 'candidate'
    | 'job'
    | 'application'
    | 'company'
    | 'contract'
    | 'placement'
    | 'system';
    entity_id: string;
    document_type?: string | null;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    storage_bucket: string;
    uploaded_by?: string | null;
    status: DocumentStatus;
    processing_status?: ProcessingStatus;
    metadata?: Record<string, any> | null;
    created_at: string;
    updated_at: string;
    download_url?: string;
}

export interface DocumentFilters {
    entity_type?: string;
    entity_id?: string;
    document_type?: string;
    status?: DocumentStatus;
    uploaded_by?: string;
    search?: string;
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
}

export interface DocumentCreateInput {
    entity_type: string;
    entity_id: string;
    document_type: string;
    metadata?: Record<string, any>;
}

export type DocumentUpdate = Partial<
    Omit<
        Document,
        'id' | 'file_path' | 'storage_bucket' | 'file_size' | 'mime_type' | 'created_at' | 'download_url'
    >
> & {
    metadata?: Record<string, any>;
    processing_status?: ProcessingStatus;
};
