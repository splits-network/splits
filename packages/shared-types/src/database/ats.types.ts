/**
 * ATS Service Domain Types
 * 
 * Generated from Supabase database schema.
 * Includes: applications, application_feedback, candidates, jobs, companies, placements, 
 * ai_reviews, application_audit_log, job_requirements, job_pre_screen_questions, 
 * job_pre_screen_answers, candidate_sourcers, candidate_role_assignments, recruiter_candidates
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from '../supabase/database.types';

// Helper types for cleaner usage
type DbTable<T extends keyof Database['public']['Tables']> = Tables<T>;
type DbTableInsert<T extends keyof Database['public']['Tables']> = TablesInsert<T>;
type DbTableUpdate<T extends keyof Database['public']['Tables']> = TablesUpdate<T>;

// ============================================================================
// APPLICATIONS
// ============================================================================

export type Application = DbTable<'applications'>;
export type ApplicationInsert = DbTableInsert<'applications'>;
export type ApplicationUpdate = DbTableUpdate<'applications'>;


// ============================================================================
// APPLICATION FEEDBACK (NEW - PHASE 1 AI REVIEW LOOP)
// ============================================================================

export type ApplicationFeedback = DbTable<'application_feedback'>;
export type ApplicationFeedbackInsert = DbTableInsert<'application_feedback'>;
export type ApplicationFeedbackUpdate = DbTableUpdate<'application_feedback'>;

// ============================================================================
// CANDIDATES
// ============================================================================

export type Candidate = DbTable<'candidates'>;
export type CandidateInsert = DbTableInsert<'candidates'>;
export type CandidateUpdate = DbTableUpdate<'candidates'>;

// ============================================================================
// JOBS
// ============================================================================

export type Job = DbTable<'jobs'>;
export type JobInsert = DbTableInsert<'jobs'>;
export type JobUpdate = DbTableUpdate<'jobs'>;

// ============================================================================
// COMPANIES
// ============================================================================

export type Company = DbTable<'companies'>;
export type CompanyInsert = DbTableInsert<'companies'>;
export type CompanyUpdate = DbTableUpdate<'companies'>;

// ============================================================================
// PLACEMENTS
// ============================================================================

export type Placement = DbTable<'placements'>;
export type PlacementInsert = DbTableInsert<'placements'>;
export type PlacementUpdate = DbTableUpdate<'placements'>;

// ============================================================================
// AI REVIEWS
// ============================================================================

export type AIReview = DbTable<'ai_reviews'>;
export type AIReviewInsert = DbTableInsert<'ai_reviews'>;
export type AIReviewUpdate = DbTableUpdate<'ai_reviews'>;

// ============================================================================
// APPLICATION AUDIT LOG
// ============================================================================

export type ApplicationAuditLog = DbTable<'application_audit_log'>;
export type ApplicationAuditLogInsert = DbTableInsert<'application_audit_log'>;
export type ApplicationAuditLogUpdate = DbTableUpdate<'application_audit_log'>;

// ============================================================================
// JOB REQUIREMENTS
// ============================================================================

export type JobRequirement = DbTable<'job_requirements'>;
export type JobRequirementInsert = DbTableInsert<'job_requirements'>;
export type JobRequirementUpdate = DbTableUpdate<'job_requirements'>;

// ============================================================================
// JOB PRE-SCREEN QUESTIONS
// ============================================================================

export type JobPreScreenQuestion = DbTable<'job_pre_screen_questions'>;
export type JobPreScreenQuestionInsert = DbTableInsert<'job_pre_screen_questions'>;
export type JobPreScreenQuestionUpdate = DbTableUpdate<'job_pre_screen_questions'>;

// ============================================================================
// JOB PRE-SCREEN ANSWERS
// ============================================================================

export type JobPreScreenAnswer = DbTable<'job_pre_screen_answers'>;
export type JobPreScreenAnswerInsert = DbTableInsert<'job_pre_screen_answers'>;
export type JobPreScreenAnswerUpdate = DbTableUpdate<'job_pre_screen_answers'>;

// ============================================================================
// CANDIDATE SOURCERS
// ============================================================================

export type CandidateSourcer = DbTable<'candidate_sourcers'>;
export type CandidateSourcerInsert = DbTableInsert<'candidate_sourcers'>;
export type CandidateSourcerUpdate = DbTableUpdate<'candidate_sourcers'>;

// ============================================================================
// CANDIDATE ROLE ASSIGNMENTS (PROPOSALS)
// ============================================================================

export type CandidateRoleAssignment = DbTable<'candidate_role_assignments'>;
export type CandidateRoleAssignmentInsert = DbTableInsert<'candidate_role_assignments'>;
export type CandidateRoleAssignmentUpdate = DbTableUpdate<'candidate_role_assignments'>;

// ============================================================================
// RECRUITER CANDIDATES
// ============================================================================

export type RecruiterCandidate = DbTable<'recruiter_candidates'>;
export type RecruiterCandidateInsert = DbTableInsert<'recruiter_candidates'>;
export type RecruiterCandidateUpdate = DbTableUpdate<'recruiter_candidates'>;
