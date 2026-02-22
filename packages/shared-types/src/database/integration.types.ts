/**
 * Integration Domain Types
 * 
 * Generated from Supabase database schema.
 * Includes: integrations, sync_logs, external_entity_map, 
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from '../supabase/database.types';

// Helper types for cleaner usage
type DbTable<T extends keyof Database['public']['Tables']> = Tables<T>;
type DbTableInsert<T extends keyof Database['public']['Tables']> = TablesInsert<T>;
type DbTableUpdate<T extends keyof Database['public']['Tables']> = TablesUpdate<T>;

// ============================================================================
// INTEGRATIONS
// ============================================================================

export type Integration = DbTable<'integrations'>;
export type IntegrationInsert = DbTableInsert<'integrations'>;
export type IntegrationUpdate = DbTableUpdate<'integrations'>;

// ============================================================================
// SYNC LOGS (prefixed to avoid collision with ats-integrations.ts SyncLog)
// ============================================================================

export type DbSyncLog = DbTable<'sync_logs'>;
export type DbSyncLogInsert = DbTableInsert<'sync_logs'>;
export type DbSyncLogUpdate = DbTableUpdate<'sync_logs'>;

// ============================================================================
// EXTERNAL ENTITY MAP (prefixed to avoid collision with ats-integrations.ts)
// ============================================================================

export type DbExternalEntityMap = DbTable<'external_entity_map'>;
export type DbExternalEntityMapInsert = DbTableInsert<'external_entity_map'>;
export type DbExternalEntityMapUpdate = DbTableUpdate<'external_entity_map'>;

// ============================================================================
// SYNC QUEUE
// ============================================================================

export type SyncQueue = DbTable<'sync_queue'>;
export type SyncQueueInsert = DbTableInsert<'sync_queue'>;
export type SyncQueueUpdate = DbTableUpdate<'sync_queue'>;
