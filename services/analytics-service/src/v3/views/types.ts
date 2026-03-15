/**
 * Analytics Views V3 Types
 *
 * View types return structured list/tabular data (not chart-shaped).
 * Used by dashboard hooks that previously aggregated client-side.
 */

// ── View Type Enum ─────────────────────────────────────────────────
export type ViewType = 'recruiter-scorecard' | 'role-breakdown' | 'pending-reviews';

// ── Recruiter Scorecard ────────────────────────────────────────────
export interface RecruiterScoreRow {
  id: string;
  name: string;
  submissions: number;
  interviews: number;
  placements: number;
  conversion_rate: number;
  avg_days_to_place: number;
}

// ── Role Breakdown ─────────────────────────────────────────────────
export interface RoleBreakdownRow {
  id: string;
  title: string;
  location: string;
  status: string;
  applications_count: number;
  interview_count: number;
  offer_count: number;
  hire_count: number;
  days_open: number;
}

// ── Pending Reviews ────────────────────────────────────────────────
export interface PendingReviewRow {
  id: string;
  candidate_name: string;
  job_title: string;
  stage: string;
  days_since_update: number;
}

// ── Route Schemas ──────────────────────────────────────────────────
export const viewTypeParamSchema = {
  type: 'object' as const,
  properties: {
    type: {
      type: 'string' as const,
      enum: ['recruiter-scorecard', 'role-breakdown', 'pending-reviews'],
    },
  },
  required: ['type'],
};

export const viewQuerySchema = {
  type: 'object' as const,
  properties: {
    limit: { type: 'integer' as const, minimum: 1, maximum: 100, default: 20 },
  },
};