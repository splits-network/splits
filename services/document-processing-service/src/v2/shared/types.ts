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

export type ProcessingStatus = 'pending' | 'processing' | 'processed' | 'failed';

export interface DocumentFilters extends PaginationParams {
  processing_status?: ProcessingStatus;
  entity_type?: 'application' | 'candidate' | 'job' | 'company';
  entity_id?: string;
  search?: string;
}

export interface DocumentUpdate {
  processing_status?: ProcessingStatus;
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
  metadata: any;
  text_length?: number;
  processing_started_at?: string;
  processing_completed_at?: string;
  processing_error?: string;
  created_at: string;
  updated_at: string;
}