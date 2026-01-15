/**
 * Team Domain Types
 * 
 * Generated from Supabase database schema.
 * Includes: teams, team_members, team_invitations, split_configurations, placement_splits
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from '../supabase/database.types';

// Helper types for cleaner usage
type DbTable<T extends keyof Database['public']['Tables']> = Tables<T>;
type DbTableInsert<T extends keyof Database['public']['Tables']> = TablesInsert<T>;
type DbTableUpdate<T extends keyof Database['public']['Tables']> = TablesUpdate<T>;

// ============================================================================
// TEAMS
// ============================================================================

export type Team = DbTable<'teams'>;
export type TeamInsert = DbTableInsert<'teams'>;
export type TeamUpdate = DbTableUpdate<'teams'>;

// ============================================================================
// TEAM MEMBERS
// ============================================================================

export type TeamMember = DbTable<'team_members'>;
export type TeamMemberInsert = DbTableInsert<'team_members'>;
export type TeamMemberUpdate = DbTableUpdate<'team_members'>;

// ============================================================================
// TEAM INVITATIONS
// ============================================================================

export type TeamInvitation = DbTable<'team_invitations'>;
export type TeamInvitationInsert = DbTableInsert<'team_invitations'>;
export type TeamInvitationUpdate = DbTableUpdate<'team_invitations'>;

// ============================================================================
// SPLIT CONFIGURATIONS
// ============================================================================

export type SplitConfiguration = DbTable<'split_configurations'>;
export type SplitConfigurationInsert = DbTableInsert<'split_configurations'>;
export type SplitConfigurationUpdate = DbTableUpdate<'split_configurations'>;

// ============================================================================
// PLACEMENT SPLITS
// ============================================================================

export type PlacementSplit = DbTable<'placement_splits'>;
export type PlacementSplitInsert = DbTableInsert<'placement_splits'>;
export type PlacementSplitUpdate = DbTableUpdate<'placement_splits'>;
