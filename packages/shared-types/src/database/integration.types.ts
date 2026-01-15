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
// SYNC LOGS
// ============================================================================

export type SyncLog = DbTable<'sync_logs'>;
export type SyncLogInsert = DbTableInsert<'sync_logs'>;
export type SyncLogUpdate = DbTableUpdate<'sync_logs'>;

// ============================================================================
// EXTERNAL ENTITY MAP
// ============================================================================

export type ExternalEntityMap = DbTable<'external_entity_map'>;
export type ExternalEntityMapInsert = DbTableInsert<'external_entity_map'>;
export type ExternalEntityMapUpdate = DbTableUpdate<'external_entity_map'>;

// ============================================================================
// SYNC QUEUE
// ============================================================================

export type SyncQueue = DbTable<'sync_queue'>;
export type SyncQueueInsert = DbTableInsert<'sync_queue'>;
export type SyncQueueUpdate = DbTableUpdate<'sync_queue'>;
