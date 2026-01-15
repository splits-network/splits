/**
 * Notification Service Domain Types
 * 
 * Generated from Supabase database schema.
 * Includes: notification_log
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from '../supabase/database.types';

// Helper types for cleaner usage
type DbTable<T extends keyof Database['public']['Tables']> = Tables<T>;
type DbTableInsert<T extends keyof Database['public']['Tables']> = TablesInsert<T>;
type DbTableUpdate<T extends keyof Database['public']['Tables']> = TablesUpdate<T>;

// ============================================================================
// NOTIFICATION LOG
// ============================================================================

export type NotificationLog = DbTable<'notification_log'>;
export type NotificationLogInsert = DbTableInsert<'notification_log'>;
export type NotificationLogUpdate = DbTableUpdate<'notification_log'>;
