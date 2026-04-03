/**
 * V2 Types for Document Processing Service
 * These types are specific to V2 architecture
 */

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationResponse {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export type ProcessingStatus = 'pending' | 'processing' | 'enriching' | 'processed' | 'failed';
export type ScanStatus = 'pending' | 'clean' | 'infected' | 'error';

export interface DocumentFilters extends PaginationParams {
    processing_status?: ProcessingStatus;
    scan_status?: ScanStatus;
    entity_type?: 'application' | 'candidate' | 'job' | 'company';
    entity_id?: string;
    search?: string;
    filters?: Record<string, any>;
}

export interface DocumentUpdate {
    processing_status?: ProcessingStatus;
    scan_status?: ScanStatus;
    extracted_text?: string;
    metadata?: {
        extracted_text?: string;
        structured_data?: any;
        ai_analysis?: any;
        [key: string]: any;
    };
    processing_error?: string;
}

export interface DocumentRecord {
    id: string;
    bucket_name: string;
    filename: string;
    storage_path: string;
    mime_type: string;
    file_size: number;
    entity_type: 'application' | 'candidate' | 'job' | 'company';
    entity_id: string;
    processing_status: ProcessingStatus;
    scan_status: ScanStatus;
    metadata: any;
    text_length?: number;
    processing_started_at?: string;
    processing_completed_at?: string;
    processing_error?: string;
    created_at: string;
    updated_at: string;
}