/**
 * Network Service Domain Types
 * 
 * Generated from Supabase database schema.
 * Includes: recruiters, role_assignments, , marketplace_events
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from '../supabase/database.types';

// Helper types for cleaner usage
type DbTable<T extends keyof Database['public']['Tables']> = Tables<T>;
type DbTableInsert<T extends keyof Database['public']['Tables']> = TablesInsert<T>;
type DbTableUpdate<T extends keyof Database['public']['Tables']> = TablesUpdate<T>;

// ============================================================================
// RECRUITERS
// ============================================================================

export type Recruiter = DbTable<'recruiters'>;
export type RecruiterInsert = DbTableInsert<'recruiters'>;
export type RecruiterUpdate = DbTableUpdate<'recruiters'>;

// ============================================================================
// ROLE ASSIGNMENTS
// ============================================================================

export type RoleAssignment = DbTable<'role_assignments'>;
export type RoleAssignmentInsert = DbTableInsert<'role_assignments'>;
export type RoleAssignmentUpdate = DbTableUpdate<'role_assignments'>;

// ============================================================================
// RECRUITER REPUTATION
// ============================================================================

export type RecruiterReputation = DbTable<'recruiter_reputation'>;
export type RecruiterReputationInsert = DbTableInsert<'recruiter_reputation'>;
export type RecruiterReputationUpdate = DbTableUpdate<'recruiter_reputation'>;

// ============================================================================
// MARKETPLACE EVENTS
// ============================================================================

export type MarketplaceEvent = DbTable<'marketplace_events'>;
export type MarketplaceEventInsert = DbTableInsert<'marketplace_events'>;
export type MarketplaceEventUpdate = DbTableUpdate<'marketplace_events'>;
