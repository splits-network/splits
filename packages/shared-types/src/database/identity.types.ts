/**
 * Identity Service Domain Types
 * 
 * Generated from Supabase database schema.
 * Includes: users, organizations, memberships, invitations, user_consent
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from '../supabase/database.types';

// Helper types for cleaner usage
type DbTable<T extends keyof Database['public']['Tables']> = Tables<T>;
type DbTableInsert<T extends keyof Database['public']['Tables']> = TablesInsert<T>;
type DbTableUpdate<T extends keyof Database['public']['Tables']> = TablesUpdate<T>;

// ============================================================================
// USERS
// ============================================================================

export type User = DbTable<'users'>;
export type UserInsert = DbTableInsert<'users'>;
export type UserUpdate = DbTableUpdate<'users'>;

// ============================================================================
// ORGANIZATIONS
// ============================================================================

export type Organization = DbTable<'organizations'>;
export type OrganizationInsert = DbTableInsert<'organizations'>;
export type OrganizationUpdate = DbTableUpdate<'organizations'>;

// ============================================================================
// MEMBERSHIPS
// ============================================================================

export type Membership = DbTable<'memberships'>;
export type MembershipInsert = DbTableInsert<'memberships'>;
export type MembershipUpdate = DbTableUpdate<'memberships'>;

// ============================================================================
// INVITATIONS
// ============================================================================

export type Invitation = DbTable<'invitations'>;
export type InvitationInsert = DbTableInsert<'invitations'>;
export type InvitationUpdate = DbTableUpdate<'invitations'>;

// ============================================================================
// USER CONSENT
// ============================================================================

export type UserConsent = DbTable<'user_consent'>;
export type UserConsentInsert = DbTableInsert<'user_consent'>;
export type UserConsentUpdate = DbTableUpdate<'user_consent'>;
