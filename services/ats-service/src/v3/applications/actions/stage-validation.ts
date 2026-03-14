/**
 * Stage Validation — Transition rules and role-based authorization
 *
 * Pure functions, no DB access. Used by ApplicationService and action services.
 */

import { BadRequestError, ForbiddenError } from '@splits-network/shared-fastify';

/**
 * Allowed forward-progress stage transitions.
 * 'withdrawn' and 'draft' are handled as special cases below.
 */
export const STAGE_TRANSITIONS: Record<string, string[]> = {
  draft: ['ai_review', 'screen', 'rejected'],
  ai_review: ['ai_reviewed', 'ai_failed', 'rejected'],
  gpt_review: ['ai_reviewed', 'ai_failed', 'rejected'],
  ai_failed: ['ai_review', 'draft', 'rejected'],
  ai_reviewed: ['draft', 'screen', 'submitted', 'rejected'],
  recruiter_request: ['draft', 'ai_review', 'rejected'],
  recruiter_proposed: ['ai_review', 'draft', 'recruiter_review', 'screen', 'submitted', 'rejected'],
  recruiter_review: ['screen', 'submitted', 'draft', 'rejected'],
  screen: ['submitted', 'company_review', 'rejected'],
  submitted: ['company_review', 'interview', 'rejected'],
  company_review: ['company_feedback', 'interview', 'offer', 'rejected'],
  company_feedback: ['interview', 'offer', 'recruiter_request', 'rejected'],
  interview: ['offer', 'rejected'],
  offer: ['hired', 'rejected'],
  hired: [],
  rejected: [],
  withdrawn: [],
};

/**
 * Validate that a stage transition is structurally allowed.
 * Throws BadRequestError on invalid transition.
 */
export function validateStageTransition(
  fromStage: string,
  toStage: string,
  application?: { expired_at?: string | null }
): void {
  // Block transitions on expired applications
  if (application?.expired_at) {
    throw new BadRequestError('Cannot transition an expired application. Reactivate it first.');
  }

  // Withdrawn is always allowed from non-terminal stages
  if (toStage === 'withdrawn') return;

  // Draft is allowed from most active stages
  if (toStage === 'draft') {
    if (['hired', 'withdrawn'].includes(fromStage)) {
      throw new BadRequestError(`Invalid stage transition: ${fromStage} -> ${toStage}`);
    }
    return;
  }

  // Recruiter can request changes at any active stage
  if (toStage === 'recruiter_request') {
    if (['hired', 'rejected', 'withdrawn'].includes(fromStage)) {
      throw new BadRequestError(`Invalid stage transition: ${fromStage} -> ${toStage}`);
    }
    return;
  }

  // Check forward-progress map
  if (!STAGE_TRANSITIONS[fromStage]?.includes(toStage)) {
    throw new BadRequestError(`Invalid stage transition: ${fromStage} -> ${toStage}`);
  }
}

/**
 * Enforce role-based authorization for stage transitions.
 *
 * Company jobs: recruiters cannot advance to offer/hired or reject at offer+.
 * Firm jobs (no company_id, has source_firm_id): recruiters have full control.
 * Platform admins: unrestricted.
 */
export function authorizeStageTransition(
  targetStage: string,
  userContext: {
    isPlatformAdmin: boolean;
    companyIds: string[];
    recruiterId: string | null;
  },
  application: any
): void {
  if (userContext.isPlatformAdmin) return;

  const job = application.job;
  const isFirmJob = !job?.company_id && !!job?.source_firm_id;

  // Firm jobs: recruiters have full control
  if (isFirmJob) return;

  // Only restrict pure recruiters (no company membership)
  const isRecruiter = !!userContext.recruiterId && userContext.companyIds.length === 0;
  if (!isRecruiter) return;

  // Recruiters cannot advance to offer or hired on company jobs
  if (targetStage === 'offer' || targetStage === 'hired') {
    throw new ForbiddenError(
      `Recruiters cannot advance applications to "${targetStage}" on company jobs. Only company users can manage offer and later stages.`
    );
  }

  // Recruiters cannot reject at offer stage on company jobs
  if (targetStage === 'rejected' && application.stage === 'offer') {
    throw new ForbiddenError(
      'Recruiters cannot reject applications at offer stage on company jobs.'
    );
  }
}
