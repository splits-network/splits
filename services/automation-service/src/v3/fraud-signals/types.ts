/**
 * Fraud Signals V3 Types & JSON Schemas
 */

export interface FraudSignalListParams {
  page?: number;
  limit?: number;
  recruiter_id?: string;
  candidate_id?: string;
  severity?: string;
  status?: string;
  signal_type?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateFraudSignalInput {
  signal_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recruiter_id?: string;
  job_id?: string;
  candidate_id?: string;
  application_id?: string;
  signal_data: Record<string, any>;
  confidence_score: number;
}

export interface UpdateFraudSignalInput {
  status?: 'active' | 'resolved' | 'false_positive';
  resolution_notes?: string;
  action_taken?: string;
}

export const idParamSchema = { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } };

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    recruiter_id: { type: 'string', format: 'uuid' },
    candidate_id: { type: 'string', format: 'uuid' },
    severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    status: { type: 'string', enum: ['active', 'resolved', 'false_positive'] },
    signal_type: { type: 'string' },
    sort_by: { type: 'string', enum: ['created_at', 'severity', 'confidence_score'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: true,
};

export const createFraudSignalSchema = {
  type: 'object',
  required: ['signal_type', 'severity', 'signal_data', 'confidence_score'],
  properties: {
    signal_type: { type: 'string', minLength: 1 },
    severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    recruiter_id: { type: 'string', format: 'uuid' },
    job_id: { type: 'string', format: 'uuid' },
    candidate_id: { type: 'string', format: 'uuid' },
    application_id: { type: 'string', format: 'uuid' },
    signal_data: { type: 'object' },
    confidence_score: { type: 'number', minimum: 0, maximum: 1 },
  },
  additionalProperties: false,
};

export const updateFraudSignalSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['active', 'resolved', 'false_positive'] },
    resolution_notes: { type: 'string', maxLength: 2000 },
    action_taken: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
};
