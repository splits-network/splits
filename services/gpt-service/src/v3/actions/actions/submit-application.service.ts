/**
 * Submit Application Action Service
 *
 * Handles the two-step confirmation flow for GPT application submission.
 * Uses events (not HTTP) for downstream processing.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events';
import { GptActionsRepository } from '../repository';
import {
  generateConfirmationToken,
  getConfirmationToken,
  deleteConfirmationToken,
} from '../../../v2/actions/helpers';
import { SubmitApplicationInput } from '../types';

export class SubmitApplicationService {
  private repository: GptActionsRepository;
  private accessResolver: AccessContextResolver;

  constructor(
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.repository = new GptActionsRepository(supabase);
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async execute(input: SubmitApplicationInput, clerkUserId: string) {
    if (!input.confirmed) {
      return this.buildConfirmation(input, clerkUserId);
    }
    return this.submitApplication(input, clerkUserId);
  }

  private async buildConfirmation(input: SubmitApplicationInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.candidateId) throw new ForbiddenError('Candidate profile not found');

    if (!input.job_id) throw new BadRequestError('job_id is required');

    const existing = await this.repository.checkDuplicateApplication(context.candidateId, input.job_id);
    let existingApplicationId: string | undefined;

    if (existing) {
      if (existing.stage === 'recruiter_proposed') {
        existingApplicationId = existing.id;
      } else {
        const date = existing.created_at
          ? new Date(existing.created_at).toISOString().split('T')[0]
          : 'unknown date';
        throw new ConflictError(`You already applied to this job on ${date}`);
      }
    }

    const job = await this.repository.getJobById(input.job_id);
    if (!job) throw new NotFoundError('Job', input.job_id);

    const preScreenQuestions: any[] = job.pre_screen_questions || [];
    const requiredQuestions = preScreenQuestions.filter((q: any) => q.is_required);
    const providedTexts = (input.pre_screen_answers || []).map((a) => a.question);
    const missing = requiredQuestions.filter((q: any) => !providedTexts.includes(q.question));

    if (missing.length > 0) {
      throw new BadRequestError(
        `Missing required pre-screen answers: ${missing.map((q: any) => q.question).join(', ')}`,
      );
    }

    const answersWithSnapshots = (input.pre_screen_answers || []).map((ans) => {
      const qDef = preScreenQuestions.find((q: any) => q.question === ans.question);
      return {
        question: ans.question,
        question_type: qDef?.question_type || 'text',
        is_required: qDef?.is_required || false,
        options: qDef?.options,
        disclaimer: qDef?.disclaimer,
        answer: ans.answer,
      };
    });

    const token = generateConfirmationToken(
      clerkUserId,
      input.job_id,
      context.candidateId,
      answersWithSnapshots,
      input.cover_letter,
      undefined,
      existingApplicationId,
    );

    const warnings: string[] = [];
    if (!input.cover_letter?.trim()) warnings.push('No cover letter provided');

    return {
      status: 'CONFIRMATION_REQUIRED',
      confirmation_token: token.token,
      expires_at: token.expiresAt.toISOString(),
      job_title: job.title,
      warnings,
    };
  }

  private async submitApplication(input: SubmitApplicationInput, clerkUserId: string) {
    if (!input.confirmation_token) {
      throw new BadRequestError('confirmation_token is required when confirmed=true');
    }

    const token = getConfirmationToken(input.confirmation_token);
    if (!token) throw new BadRequestError('Confirmation token has expired');

    if (token.clerkUserId !== clerkUserId) {
      throw new ForbiddenError('Confirmation token does not belong to this user');
    }

    const existing = await this.repository.checkDuplicateApplication(token.candidateId, token.jobId);
    if (existing && existing.stage !== 'recruiter_proposed') {
      deleteConfirmationToken(input.confirmation_token);
      throw new ConflictError('You already applied to this job');
    }

    let application: any;
    let isProposalAcceptance = false;

    if (token.existingApplicationId) {
      application = await this.repository.acceptProposalForReview(
        token.existingApplicationId, token.coverLetter, token.resumeData, 'custom_gpt',
      );
      isProposalAcceptance = true;
    } else {
      application = await this.repository.createApplication(
        token.candidateId, token.jobId, token.coverLetter, token.resumeData, 'custom_gpt',
      );
    }

    if (token.preScreenAnswers?.length) {
      await this.repository.savePreScreenAnswers(application.id, token.preScreenAnswers);
    }

    deleteConfirmationToken(input.confirmation_token);

    if (this.eventPublisher) {
      try {
        if (!isProposalAcceptance) {
          await this.eventPublisher.publish('application.created', {
            application_id: application.id,
            candidate_id: token.candidateId,
            job_id: token.jobId,
            candidate_recruiter_id: null,
            company_recruiter_id: null,
            application_source: 'custom_gpt',
            has_recruiter: false,
            stage: 'gpt_review',
            created_by: token.clerkUserId,
          });
        }
        await this.eventPublisher.publish('application.stage_changed', {
          application_id: application.id,
          candidate_id: token.candidateId,
          job_id: token.jobId,
          old_stage: isProposalAcceptance ? 'recruiter_proposed' : 'draft',
          new_stage: 'gpt_review',
          changed_by: token.clerkUserId,
        });
        await this.eventPublisher.publish('gpt.action.application_submitted', {
          application_id: application.id,
          candidate_id: token.candidateId,
          job_id: token.jobId,
          clerk_user_id: token.clerkUserId,
          proposal_accepted: isProposalAcceptance,
        });
      } catch {
        // Events are best-effort — application is already persisted
      }
    }

    return {
      status: 'AI_REVIEW',
      message: isProposalAcceptance
        ? 'Recruiter proposal accepted! AI review is in progress.'
        : 'Application submitted for AI review.',
      application: {
        id: application.id,
        applied_date: new Date(application.created_at).toISOString().split('T')[0],
        status_label: 'AI Review',
      },
    };
  }
}
