/**
 * Documents V3 Types & JSON Schemas
 */

export type ProcessingStatus = 'pending' | 'processing' | 'processed' | 'failed';
export type ScanStatus = 'pending' | 'clean' | 'infected' | 'error';

export interface DocumentListParams {
  page?: number;
  limit?: number;
  processing_status?: string;
  scan_status?: string;
  entity_type?: string;
  entity_id?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UpdateDocumentInput {
  processing_status?: ProcessingStatus;
  scan_status?: ScanStatus;
  extracted_text?: string;
  metadata?: Record<string, any>;
  processing_error?: string;
}

export const idParamSchema = { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } };

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    processing_status: { type: 'string', enum: ['pending', 'processing', 'processed', 'failed'] },
    scan_status: { type: 'string', enum: ['pending', 'clean', 'infected', 'error'] },
    entity_type: { type: 'string', enum: ['application', 'candidate', 'job', 'company'] },
    entity_id: { type: 'string' },
    search: { type: 'string' },
    sort_by: { type: 'string', enum: ['created_at', 'processing_status'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: true,
};

export const updateDocumentSchema = {
  type: 'object',
  properties: {
    processing_status: { type: 'string', enum: ['pending', 'processing', 'processed', 'failed'] },
    scan_status: { type: 'string', enum: ['pending', 'clean', 'infected', 'error'] },
    extracted_text: { type: 'string' },
    metadata: { type: 'object' },
    processing_error: { type: 'string' },
  },
  additionalProperties: false,
};
