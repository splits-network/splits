/**
 * ATS Integration Types (Phase 4C)
 * Types for ATS platform synchronization
 */

export type ATSPlatform = 'greenhouse' | 'lever' | 'workable' | 'ashby' | 'generic';
export type SyncEntityType = 'role' | 'candidate' | 'application' | 'stage' | 'interview';
export type SyncAction = 'created' | 'updated' | 'deleted' | 'skipped';
export type SyncDirection = 'inbound' | 'outbound'; // ATS → Splits or Splits → ATS
export type SyncStatus = 'success' | 'failed' | 'pending' | 'conflict';
export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * ATS platform integration configuration
 */
export interface ATSIntegration {
  id: string;
  company_id: string;
  platform: ATSPlatform;
  api_key_encrypted: string; // Never exposed to frontend
  api_base_url: string | null;
  webhook_url: string | null;
  webhook_secret: string | null;
  sync_enabled: boolean;
  sync_roles: boolean;
  sync_candidates: boolean;
  sync_applications: boolean;
  sync_interviews: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  config: ATSIntegrationConfig;
  created_at: string;
  updated_at: string;
}

/**
 * Platform-specific configuration
 */
export type ATSIntegrationConfig =
  | GreenhouseConfig
  | LeverConfig
  | WorkableConfig
  | AshbyConfig
  | GenericConfig;

export interface GreenhouseConfig {
  platform: 'greenhouse';
  harvest_api_key?: string; // Separate from job board API key
  partner_key?: string;
  organization_id?: string;
  custom_fields_mapping?: Record<string, string>; // Map our fields to custom fields
}

export interface LeverConfig {
  platform: 'lever';
  environment?: 'sandbox' | 'production';
  posting_access_token?: string; // For job postings
  opportunities_access_token?: string; // For candidate data
}

export interface WorkableConfig {
  platform: 'workable';
  subdomain: string; // e.g., "company" in company.workable.com
  webhook_token?: string;
}

export interface AshbyConfig {
  platform: 'ashby';
  organization_id?: string;
  api_version?: string;
}

export interface GenericConfig {
  platform: 'generic';
  auth_type?: 'bearer' | 'basic' | 'oauth2';
  headers?: Record<string, string>;
}

/**
 * Sync operation log entry
 */
export interface SyncLog {
  id: string;
  integration_id: string;
  entity_type: SyncEntityType;
  entity_id: string | null;
  external_id: string | null;
  action: SyncAction;
  direction: SyncDirection;
  status: SyncStatus;
  error_message: string | null;
  error_code: string | null;
  request_payload: any;
  response_payload: any;
  retry_count: number;
  synced_at: string;
}

/**
 * Bidirectional ID mapping
 */
export interface ExternalEntityMap {
  id: string;
  integration_id: string;
  entity_type: SyncEntityType;
  internal_id: string; // Our system ID
  external_id: string; // ATS system ID
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Async sync queue item
 */
export interface SyncQueueItem {
  id: string;
  integration_id: string;
  entity_type: SyncEntityType;
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  direction: SyncDirection;
  priority: number; // 1 (highest) to 10 (lowest)
  payload: any;
  status: QueueStatus;
  retry_count: number;
  max_retries: number;
  last_error: string | null;
  scheduled_at: string;
  processed_at: string | null;
  created_at: string;
}

/**
 * Integration with sync statistics
 */
export interface ATSIntegrationWithStats extends ATSIntegration {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  last_24h_syncs: number;
  pending_queue_items: number;
}

/**
 * Sync history summary
 */
export interface SyncHistorySummary {
  integration_id: string;
  period_start: string;
  period_end: string;
  by_entity: Array<{
    entity_type: SyncEntityType;
    total: number;
    success: number;
    failed: number;
  }>;
  by_direction: {
    inbound: number;
    outbound: number;
  };
  by_status: Record<SyncStatus, number>;
  error_breakdown: Array<{
    error_code: string;
    count: number;
    sample_message: string;
  }>;
}

/**
 * Greenhouse-specific types
 */
export namespace Greenhouse {
  export interface Job {
    id: number;
    name: string;
    status: 'open' | 'closed' | 'draft';
    departments: Array<{ id: number; name: string }>;
    offices: Array<{ id: number; name: string }>;
    custom_fields: Record<string, any>;
    created_at: string;
    updated_at: string;
  }

  export interface Application {
    id: number;
    candidate_id: number;
    job_id: number;
    status: string;
    current_stage: {
      id: number;
      name: string;
    };
    source: {
      id: number;
      public_name: string;
    };
    applied_at: string;
  }

  export interface Candidate {
    id: number;
    first_name: string;
    last_name: string;
    emails: Array<{ value: string; type: string }>;
    phone_numbers: Array<{ value: string; type: string }>;
    applications: number[];
    created_at: string;
    updated_at: string;
  }
}

/**
 * Lever-specific types
 */
export namespace Lever {
  export interface Posting {
    id: string;
    text: string;
    state: 'published' | 'internal' | 'closed';
    categories: {
      commitment?: string;
      department?: string;
      level?: string;
      location?: string;
      team?: string;
    };
    createdAt: number;
    updatedAt: number;
  }

  export interface Opportunity {
    id: string;
    name: string;
    contact: string; // Contact ID
    emails: string[];
    phones: Array<{ type: string; value: string }>;
    stage: string;
    applications: string[];
    createdAt: number;
    updatedAt: number;
  }

  export interface Application {
    id: string;
    type: 'posting' | 'referral' | 'user';
    postingId?: string;
    opportunityId: string;
    createdAt: number;
  }
}

/**
 * Workable-specific types
 */
export namespace Workable {
  export interface Job {
    id: string;
    title: string;
    full_title: string;
    state: 'draft' | 'published' | 'archived' | 'closed';
    department: string;
    location: {
      city: string;
      region: string;
      country: string;
    };
    created_at: string;
    updated_at: string;
  }

  export interface Candidate {
    id: string;
    name: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    stage: string;
    disqualified: boolean;
    created_at: string;
    updated_at: string;
  }
}

/**
 * Sync conflict resolution
 */
export interface SyncConflict {
  id: string;
  integration_id: string;
  entity_type: SyncEntityType;
  entity_id: string;
  conflict_type: 'updated_both' | 'deleted_source' | 'deleted_target' | 'duplicate';
  internal_data: any;
  external_data: any;
  resolution_strategy: 'prefer_internal' | 'prefer_external' | 'merge' | 'manual';
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

/**
 * Webhook payload from ATS
 */
export interface ATSWebhookPayload {
  event_type: string;
  timestamp: string;
  data: any;
  signature?: string; // For verification
}

/**
 * Sync operation result
 */
export interface SyncResult {
  success: boolean;
  entity_id: string | null;
  external_id: string | null;
  action: SyncAction;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: any;
}
