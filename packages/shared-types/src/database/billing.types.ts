/**
 * Billing Service Domain Types
 * 
 * Generated from Supabase database schema.
 * Includes: plans, subscriptions, payouts, payout_schedules, payout_splits, 
 * escrow_holds, payout_audit_log
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from '../supabase/database.types';

// Helper types for cleaner usage
type DbTable<T extends keyof Database['public']['Tables']> = Tables<T>;
type DbTableInsert<T extends keyof Database['public']['Tables']> = TablesInsert<T>;
type DbTableUpdate<T extends keyof Database['public']['Tables']> = TablesUpdate<T>;

// ============================================================================
// PLANS
// ============================================================================

export type Plan = DbTable<'plans'>;
export type PlanInsert = DbTableInsert<'plans'>;
export type PlanUpdate = DbTableUpdate<'plans'>;

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export type Subscription = DbTable<'subscriptions'>;
export type SubscriptionInsert = DbTableInsert<'subscriptions'>;
export type SubscriptionUpdate = DbTableUpdate<'subscriptions'>;

// ============================================================================
// PAYOUTS
// ============================================================================

export type Payout = DbTable<'payouts'>;
export type PayoutInsert = DbTableInsert<'payouts'>;
export type PayoutUpdate = DbTableUpdate<'payouts'>;

// ============================================================================
// PAYOUT SCHEDULES
// ============================================================================

export type PayoutSchedule = DbTable<'payout_schedules'>;
export type PayoutScheduleInsert = DbTableInsert<'payout_schedules'>;
export type PayoutScheduleUpdate = DbTableUpdate<'payout_schedules'>;

// ============================================================================
// PAYOUT SPLITS
// ============================================================================

export type PayoutSplit = DbTable<'payout_splits'>;
export type PayoutSplitInsert = DbTableInsert<'payout_splits'>;
export type PayoutSplitUpdate = DbTableUpdate<'payout_splits'>;

// ============================================================================
// ESCROW HOLDS
// ============================================================================

export type EscrowHold = DbTable<'escrow_holds'>;
export type EscrowHoldInsert = DbTableInsert<'escrow_holds'>;
export type EscrowHoldUpdate = DbTableUpdate<'escrow_holds'>;

// ============================================================================
// PAYOUT AUDIT LOG
// ============================================================================

export type PayoutAuditLog = DbTable<'payout_audit_log'>;
export type PayoutAuditLogInsert = DbTableInsert<'payout_audit_log'>;
export type PayoutAuditLogUpdate = DbTableUpdate<'payout_audit_log'>;
