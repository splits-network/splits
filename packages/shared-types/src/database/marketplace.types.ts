/**
 * Marketplace Domain Types
 * 
 * Generated from Supabase database schema.
 * Includes: , fraud_signals, 
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from '../supabase/database.types';

// Helper types for cleaner usage
type DbTable<T extends keyof Database['public']['Tables']> = Tables<T>;
type DbTableInsert<T extends keyof Database['public']['Tables']> = TablesInsert<T>;
type DbTableUpdate<T extends keyof Database['public']['Tables']> = TablesUpdate<T>;

// ============================================================================
// CANDIDATE ROLE MATCHES
// ============================================================================

export type CandidateRoleMatch = DbTable<'candidate_role_matches'>;
export type CandidateRoleMatchInsert = DbTableInsert<'candidate_role_matches'>;
export type CandidateRoleMatchUpdate = DbTableUpdate<'candidate_role_matches'>;

// ============================================================================
// FRAUD SIGNALS
// ============================================================================

export type FraudSignal = DbTable<'fraud_signals'>;
export type FraudSignalInsert = DbTableInsert<'fraud_signals'>;
export type FraudSignalUpdate = DbTableUpdate<'fraud_signals'>;

// ============================================================================
// MARKETPLACE METRICS DAILY
// ============================================================================

export type MarketplaceMetricsDaily = DbTable<'marketplace_metrics_daily'>;
export type MarketplaceMetricsDailyInsert = DbTableInsert<'marketplace_metrics_daily'>;
export type MarketplaceMetricsDailyUpdate = DbTableUpdate<'marketplace_metrics_daily'>;
