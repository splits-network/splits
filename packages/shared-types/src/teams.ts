/**
 * Teams and Agencies Types (Phase 4B)
 * Types for team-based recruiting operations
 */

export type TeamStatus = 'active' | 'suspended';
export type TeamMemberRole = 'owner' | 'admin' | 'member' | 'collaborator';
export type TeamMemberStatus = 'active' | 'invited' | 'removed';
export type SplitModel = 'flat_split' | 'tiered_split' | 'individual_credit' | 'hybrid';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

/**
 * Recruiting team/agency entity
 */
export interface Team {
  id: string;
  name: string;
  owner_user_id: string;
  billing_organization_id: string | null;
  status: TeamStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Team membership relationship
 */
export interface TeamMember {
  id: string;
  team_id: string;
  recruiter_id: string;
  role: TeamMemberRole;
  joined_at: string;
  status: TeamMemberStatus;
}

/**
 * Split configuration for team economics
 */
export interface SplitConfiguration {
  id: string;
  team_id: string;
  model: SplitModel;
  config: SplitConfigDetails;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Model-specific split configuration details
 */
export type SplitConfigDetails =
  | FlatSplitConfig
  | TieredSplitConfig
  | IndividualCreditConfig
  | HybridSplitConfig;

export interface FlatSplitConfig {
  model: 'flat_split';
  // All team members split equally
}

export interface TieredSplitConfig {
  model: 'tiered_split';
  owner_percentage: number; // e.g., 30
  // Remainder split among team members
}

export interface IndividualCreditConfig {
  model: 'individual_credit';
  // Each member keeps their own earnings
}

export interface HybridSplitConfig {
  model: 'hybrid';
  team_overhead_fee: number; // e.g., 20 (percentage)
  // Remainder split among contributors
}

/**
 * Individual split distribution for a placement
 */
export interface PlacementSplit {
  id: string;
  placement_id: string;
  team_id: string | null;
  recruiter_id: string;
  split_percentage: number; // 0-100
  split_amount: number | null; // Calculated from placement fee
  split_configuration_id: string | null;
  notes: string | null;
  created_at: string;
}

/**
 * Team invitation for recruiting new members
 */
export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: Exclude<TeamMemberRole, 'owner'>; // Can't invite as owner
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  status: InvitationStatus;
  created_at: string;
}

/**
 * Extended team with member count
 */
export interface TeamWithStats extends Team {
  member_count: number;
  active_member_count: number;
  total_placements: number;
  total_revenue: number;
}

/**
 * Team member with recruiter details
 */
export interface TeamMemberWithRecruiter extends TeamMember {
  recruiter: {
    id: string;
    user_id: string;
    name: string;
    email: string;
  };
}

/**
 * Team analytics data
 */
export interface TeamAnalytics {
  team_id: string;
  period_start: string;
  period_end: string;
  total_placements: number;
  total_revenue: number;
  member_performance: Array<{
    recruiter_id: string;
    recruiter_name: string;
    placements: number;
    revenue: number;
    avg_time_to_placement_days: number;
  }>;
  top_roles: Array<{
    role_id: string;
    role_title: string;
    placements: number;
    revenue: number;
  }>;
  conversion_rate: number; // Submissions → Placements
}
