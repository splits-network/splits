/**
 * Firm Domain Types
 *
 * Generated from Supabase database schema.
 * Includes: firms, firm_members, firm_invitations, firm_billing_profiles, firm_stripe_accounts,
 * split_configurations, placement_splits
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from '../supabase/database.types';

// Helper types for cleaner usage
type DbTable<T extends keyof Database['public']['Tables']> = Tables<T>;
type DbTableInsert<T extends keyof Database['public']['Tables']> = TablesInsert<T>;
type DbTableUpdate<T extends keyof Database['public']['Tables']> = TablesUpdate<T>;

// ============================================================================
// FIRMS
// ============================================================================

export type Firm = DbTable<'firms'>;
export type FirmInsert = DbTableInsert<'firms'>;
export type FirmUpdate = DbTableUpdate<'firms'>;

// ============================================================================
// FIRM MEMBERS
// ============================================================================

export type FirmMember = DbTable<'firm_members'>;
export type FirmMemberInsert = DbTableInsert<'firm_members'>;
export type FirmMemberUpdate = DbTableUpdate<'firm_members'>;

// ============================================================================
// FIRM INVITATIONS
// ============================================================================

export type FirmInvitation = DbTable<'firm_invitations'>;
export type FirmInvitationInsert = DbTableInsert<'firm_invitations'>;
export type FirmInvitationUpdate = DbTableUpdate<'firm_invitations'>;

// ============================================================================
// FIRM BILLING PROFILES
// ============================================================================

export type FirmBillingProfile = DbTable<'firm_billing_profiles'>;
export type FirmBillingProfileInsert = DbTableInsert<'firm_billing_profiles'>;
export type FirmBillingProfileUpdate = DbTableUpdate<'firm_billing_profiles'>;

// ============================================================================
// FIRM STRIPE ACCOUNTS
// ============================================================================

export type FirmStripeAccount = DbTable<'firm_stripe_accounts'>;
export type FirmStripeAccountInsert = DbTableInsert<'firm_stripe_accounts'>;
export type FirmStripeAccountUpdate = DbTableUpdate<'firm_stripe_accounts'>;

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
