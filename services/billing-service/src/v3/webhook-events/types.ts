/**
 * Webhook Events V3 Types
 */

export type ProcessingStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'skipped';

export interface WebhookEventRecord {
  id: string;
  stripe_event_id: string;
  event_type: string;
  api_version: string | null;
  livemode: boolean;
  payload: Record<string, any>;
  processing_status: ProcessingStatus;
  processing_error: string | null;
  processed_at: string | null;
  created_at: string;
}

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    status: { type: 'string', enum: ['pending', 'processing', 'succeeded', 'failed', 'skipped'] },
    event_type: { type: 'string' },
  },
};
