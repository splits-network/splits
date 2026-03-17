/**
 * Applications V3 Service — Core CRUD
 *
 * Complex actions delegated to actions/ subdirectory.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { ApplicationRepository, ApplicationScopeFilters } from './repository';
import { CreateApplicationInput, UpdateApplicationInput, ApplicationListParams } from './types';
import { validateStageTransition, authorizeStageTransition } from './actions/stage-validation';

const COMPANY_VISIBLE_STAGES = [
  'submitted', 'company_review', 'company_feedback',
  'screen', 'interview', 'offer', 'hired', 'rejected',
];

export class ApplicationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ApplicationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: ApplicationListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scope = await this.buildScope(context);

    const { data, total } = await this.repository.findAll(params, scope);

    // Batch-load includes
    if (params.include) {
      const includes = params.include.split(',').map(i => i.trim());
      const ids = data.map((a: any) => a.id);

      if (includes.includes('ai_review') || includes.includes('ai-review')) {
        const reviews = await this.repository.batchGetAIReviews(ids);
        const map = new Map(reviews.map(r => [r.application_id, r]));
        data.forEach((a: any) => { a.ai_review = map.get(a.id) || null; });
      }
      if (includes.includes('documents') || includes.includes('document')) {
        const docs = await this.repository.batchGetDocuments(ids);
        const map = new Map<string, any[]>();
        docs.forEach((d: any) => {
          if (!map.has(d.entity_id)) map.set(d.entity_id, []);
          map.get(d.entity_id)!.push(d);
        });
        data.forEach((a: any) => { a.documents = map.get(a.id) || []; });
      }
    }

    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const application = await this.repository.findById(id);
    if (!application) throw new NotFoundError('Application', id);
    return application;
  }

  async create(input: CreateApplicationInput, clerkUserId: string) {
    if (!input.job_id) throw new BadRequestError('Job ID is required');

    const context = await this.accessResolver.resolve(clerkUserId);
    let candidateId = input.candidate_id || context.candidateId || null;
    let candidateRecruiterId = input.candidate_recruiter_id || null;
    let companyRecruiterId: string | null = null;
    let applicationSource = input.application_source || 'direct';

    if (!candidateId || !context.identityUserId) {
      throw new BadRequestError('Candidate ID could not be resolved from user context');
    }

    const { data: job } = await this.supabase
      .from('jobs').select('company_id, source_firm_id').eq('id', input.job_id).single();
    if (!job) throw new NotFoundError('Job', input.job_id);

    const isCompanyJob = !!job.company_id && !job.source_firm_id;

    if (context.recruiterId) {
      const resolved = await this.resolveRecruiterRole(
        context.recruiterId, candidateId, isCompanyJob, job.company_id
      );
      candidateRecruiterId = resolved.candidateRecruiterId;
      companyRecruiterId = resolved.companyRecruiterId;
      applicationSource = resolved.applicationSource;
    }

    const { document_ids, ...appData } = input;
    const isRecruiterCreated = !!context.recruiterId;
    const hasRecruiter = !!candidateRecruiterId || !!companyRecruiterId;
    // Only use recruiter_proposed when a recruiter creates the application.
    // When a candidate creates and selects their recruiter, start as draft.
    const initialStage = isRecruiterCreated && hasRecruiter ? 'recruiter_proposed' : 'draft';

    const application = await this.repository.create({
      ...appData, candidate_id: candidateId,
      candidate_recruiter_id: candidateRecruiterId,
      company_recruiter_id: companyRecruiterId,
      application_source: applicationSource,
      stage: initialStage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (document_ids?.length) {
      await Promise.all(document_ids.map(id =>
        this.repository.linkDocumentToApplication(id, application.id, false)
      ));
    }

    await this.repository.createAuditLog({
      application_id: application.id, action: 'created',
      performed_by_user_id: context.identityUserId || '00000000-0000-0000-0000-000000000000',
      performed_by_role: isRecruiterCreated ? 'recruiter' : 'candidate',
      new_value: { stage: initialStage, job_id: input.job_id, candidate_id: candidateId },
      metadata: { has_recruiter: hasRecruiter, document_count: document_ids?.length || 0 },
    });

    await this.eventPublisher?.publish('application.created', {
      application_id: application.id, job_id: input.job_id,
      candidate_id: candidateId, stage: initialStage,
      created_by: context.identityUserId,
    }, 'ats-service');

    return application;
  }

  async update(id: string, input: UpdateApplicationInput, clerkUserId: string) {
    const current = await this.repository.findByIdWithJob(id);
    if (!current) throw new NotFoundError('Application', id);

    const context = await this.accessResolver.resolve(clerkUserId);

    const { document_ids, decline_reason, decline_details, ...persistedUpdates } = input;

    if (input.stage && input.stage !== current.stage) {
      validateStageTransition(current.stage, input.stage, current);
      authorizeStageTransition(input.stage, context, current);

      if (!current.job?.source_firm_id && context.recruiterId && current.job?.company_id) {
        await this.enforceRecruiterPermission(context.recruiterId, current.job.company_id);
      }

      if (['submitted', 'recruiter_review'].includes(input.stage) && !current.submitted_at) {
        (persistedUpdates as any).submitted_at = new Date().toISOString();
      }
    }

    if (input.stage === 'rejected' && !decline_details && !decline_reason) {
      throw new BadRequestError('Decline reason required when rejecting');
    }

    if (document_ids?.length) {
      await this.repository.unlinkApplicationDocuments(id);
      for (const docId of document_ids) {
        await this.repository.linkDocumentToApplication(docId, id, false);
      }
    }

    const updated = await this.repository.update(id, persistedUpdates);

    if (input.stage && input.stage !== current.stage) {
      await this.repository.createAuditLog({
        application_id: id, action: 'stage_changed',
        performed_by_user_id: context.identityUserId || '00000000-0000-0000-0000-000000000000',
        performed_by_role: this.resolveRole(context),
        old_value: { stage: current.stage },
        new_value: { stage: input.stage },
        metadata: {
          decline_reason, decline_details,
          job_id: current.job_id,
          candidate_id: current.candidate_id,
          candidate_recruiter_id: current.candidate_recruiter_id,
        },
      });

      await this.eventPublisher?.publish('application.stage_changed', {
        application_id: id, old_stage: current.stage, new_stage: input.stage,
        changed_by: context.identityUserId,
      }, 'ats-service');
    }

    // Generic update event — downstream consumers depend on this for non-stage changes
    await this.eventPublisher?.publish('application.updated', {
      application_id: id,
      job_id: current.job_id,
      candidate_id: current.candidate_id,
      updated_fields: Object.keys(persistedUpdates),
      updated_by: context.identityUserId,
    }, 'ats-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const application = await this.repository.findById(id);
    if (!application) throw new NotFoundError('Application', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.candidateId) {
      throw new ForbiddenError('Only candidates or admins can delete applications');
    }

    await this.repository.delete(id);
    await this.eventPublisher?.publish('application.deleted', {
      application_id: id, deleted_by: context.identityUserId,
    }, 'ats-service');
  }

  // --- Private helpers ---

  private async buildScope(context: any): Promise<ApplicationScopeFilters> {
    if (context.isPlatformAdmin) return { is_admin: true };

    if (context.candidateId) return { candidate_id: context.candidateId };

    if (context.recruiterId) {
      const viewableJobIds = await this.getViewableJobIds(context.recruiterId, context.firmIds);
      return { recruiter_id: context.recruiterId, viewable_job_ids: viewableJobIds };
    }

    if (context.organizationIds?.length > 0) {
      const jobIds = await this.getCompanyJobIds(context.organizationIds);
      return {
        company_ids: context.organizationIds,
        viewable_job_ids: jobIds,
        visible_stages: COMPANY_VISIBLE_STAGES,
      };
    }

    return {};
  }

  private async getViewableJobIds(recruiterId: string, firmIds: string[] = []): Promise<string[]> {
    // Jobs where this recruiter is the owner
    const { data: ownedJobs } = await this.supabase
      .from('jobs').select('id, company_id')
      .eq('job_owner_recruiter_id', recruiterId);

    const { data: perms } = await this.supabase
      .from('recruiter_companies').select('company_id, permissions')
      .eq('recruiter_id', recruiterId).eq('status', 'active');

    const viewableCompanyIds = (perms || [])
      .filter(r => r.permissions?.can_view_applications === true)
      .map(r => r.company_id);

    const ownedJobIds = (ownedJobs || [])
      .filter(j => !j.company_id || viewableCompanyIds.includes(j.company_id))
      .map(j => j.id);

    // Jobs belonging to the recruiter's firm(s)
    let firmJobIds: string[] = [];
    if (firmIds.length > 0) {
      const { data: firmJobs } = await this.supabase
        .from('jobs').select('id')
        .in('source_firm_id', firmIds);
      firmJobIds = (firmJobs || []).map(j => j.id);
    }

    return [...new Set([...ownedJobIds, ...firmJobIds])];
  }

  private async getCompanyJobIds(orgIds: string[]): Promise<string[]> {
    const { data: companies } = await this.supabase
      .from('companies').select('id').in('identity_organization_id', orgIds);
    if (!companies?.length) return [];
    const { data: jobs } = await this.supabase
      .from('jobs').select('id').in('company_id', companies.map(c => c.id));
    return (jobs || []).map(j => j.id);
  }

  private async resolveRecruiterRole(
    recruiterId: string, candidateId: string,
    isCompanyJob: boolean, companyId?: string
  ) {
    let candidateRecruiterId: string | null = null;
    let companyRecruiterId: string | null = null;
    let applicationSource = 'direct';

    if (isCompanyJob && companyId) {
      const { data: rel } = await this.supabase
        .from('recruiter_companies').select('permissions')
        .eq('recruiter_id', recruiterId).eq('company_id', companyId)
        .eq('status', 'active').maybeSingle();

      if (rel) {
        if (!rel.permissions?.can_submit_candidates) {
          throw new ForbiddenError('You do not have permission to submit candidates for this company');
        }
        companyRecruiterId = recruiterId;
        applicationSource = 'company_recruiter';
        return { candidateRecruiterId: null, companyRecruiterId, applicationSource };
      }
    }

    const { data: rtr } = await this.supabase
      .from('recruiter_candidates').select('id')
      .eq('recruiter_id', recruiterId).eq('candidate_id', candidateId)
      .eq('status', 'active').eq('consent_given', true).maybeSingle();

    if (!rtr) {
      throw new ForbiddenError('You must have an active RTR with this candidate before submitting');
    }

    return { candidateRecruiterId: recruiterId, companyRecruiterId: null, applicationSource: 'recruiter' };
  }

  private async enforceRecruiterPermission(recruiterId: string, companyId: string) {
    const { data: rel } = await this.supabase
      .from('recruiter_companies').select('permissions')
      .eq('recruiter_id', recruiterId).eq('company_id', companyId)
      .eq('status', 'active').maybeSingle();

    if (rel && !rel.permissions?.can_advance_candidates) {
      throw new ForbiddenError('You do not have permission to advance candidates for this company');
    }
  }

  private resolveRole(context: any): string {
    if (context.isPlatformAdmin) return 'admin';
    if (context.companyIds?.length > 0) return 'company';
    if (context.recruiterId) return 'recruiter';
    if (context.candidateId) return 'candidate';
    return 'system';
  }
}
