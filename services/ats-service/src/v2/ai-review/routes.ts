import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { requireUserContext } from '../shared/helpers';
import { resolveAccessContext } from '../shared/access';
import { AtsRepository } from '../../repository';
import { AIReviewService } from '../../services/ai-review';
import { CandidateService } from '../../services/candidates/service';
import { ApplicationService } from '../../services/applications/service';
import { EventPublisher } from '../shared/events';
import type { AccessContext } from '../shared/access';
import type { Application, Job } from '@splits-network/shared-types';

interface RegisterAIReviewRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

type ApplicationAccessDenied = {
    allowed: false;
    status: number;
    message: string;
};

type ApplicationAccessGranted = {
    allowed: true;
    access: AccessContext;
    application: Application;
    job: Job | null;
};

type ApplicationAccessResult = ApplicationAccessDenied | ApplicationAccessGranted;

function createEventPublisherAdapter(eventPublisher?: EventPublisher) {
    return {
        publish: async (eventType: string, payload: Record<string, any>, sourceService?: string) => {
            if (eventPublisher) {
                await eventPublisher.publish(eventType, payload);
            }
        },
    };
}

export function registerAIReviewRoutes(app: FastifyInstance, config: RegisterAIReviewRoutesConfig) {
    const supabase = createClient(config.supabaseUrl, config.supabaseKey);
    const legacyRepository = new AtsRepository(config.supabaseUrl, config.supabaseKey);
    const legacyEventPublisher = createEventPublisherAdapter(config.eventPublisher);
    const aiReviewService = new AIReviewService(legacyRepository as any, legacyEventPublisher as any);
    const candidateService = new CandidateService(legacyRepository as any);
    const legacyApplicationService = new ApplicationService(
        legacyRepository as any,
        legacyEventPublisher as any,
        candidateService as any
    );

    const requireApplicationAccess = async (
        clerkUserId: string,
        applicationId: string,
        allowCandidate = true
    ): Promise<ApplicationAccessResult> => {
        const access = await resolveAccessContext(supabase, clerkUserId);
        const application = await legacyRepository.findApplicationById(applicationId);
        if (!application) {
            return { allowed: false, status: 404, message: 'Application not found' as const };
        }

        const job = await legacyRepository.findJobById(application.job_id);

        const belongsToCandidate =
            allowCandidate && access.candidateId && application.candidate_id === access.candidateId;
        const belongsToRecruiter = access.recruiterId && application.recruiter_id === access.recruiterId;
        const organizationMatch =
            job?.company?.identity_organization_id &&
            access.organizationIds.includes(job.company.identity_organization_id);
        const hasCompanyRole = access.roles.some(role => role === 'company_admin' || role === 'hiring_manager');

        const allowed =
            access.isPlatformAdmin ||
            belongsToCandidate ||
            belongsToRecruiter ||
            (hasCompanyRole && organizationMatch);

        if (!allowed) {
            return { allowed: false, status: 403, message: 'You do not have access to this application' as const };
        }

        return {
            allowed: true,
            access,
            application,
            job,
        };
    };

    app.get(
        '/v2/applications/:id/ai-review',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params;
                const accessResult = await requireApplicationAccess(clerkUserId, id);
                if (!accessResult.allowed) {
                    return reply.status(accessResult.status).send({
                        error: { message: accessResult.message },
                    });
                }

                const review = await aiReviewService.getAIReview(id);
                if (!review) {
                    return reply.status(404).send({
                        error: { message: 'AI review not found for this application' },
                    });
                }

                return reply.send({ data: review });
            } catch (error: any) {
                request.log.error({ err: error }, 'Failed to load AI review');
                return reply.status(500).send({
                    error: { message: error.message || 'Failed to load AI review' },
                });
            }
        }
    );

    app.post(
        '/v2/applications/:id/ai-review',
        async (
            request: FastifyRequest<{
                Params: { id: string };
                Body: { resume_text?: string; force?: boolean; auto_transition?: boolean };
            }>,
            reply: FastifyReply
        ) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { id } = request.params;
                const { resume_text, force, auto_transition = true } = request.body ?? {};

                const accessResult = await requireApplicationAccess(clerkUserId, id, false);
                if (!accessResult.allowed) {
                    return reply.status(accessResult.status).send({
                        error: { message: accessResult.message },
                    });
                }

                const { application } = accessResult;
                const job = await legacyRepository.findJobById(application.job_id);
                const candidate = await legacyRepository.findCandidateById(application.candidate_id);

                if (!job || !candidate) {
                    return reply.status(404).send({
                        error: { message: 'Associated job or candidate could not be found' },
                    });
                }

                if (application.ai_reviewed && !force) {
                    const existingReview = await aiReviewService.getAIReview(application.id);
                    return reply.send({
                        data: existingReview,
                        message: 'Application already reviewed. Use force=true to re-review.',
                    });
                }

                const requirements = job.requirements || [];
                const mandatorySkills = requirements
                    .filter(r => r.requirement_type === 'mandatory')
                    .map(r => r.description);
                const preferredSkills = requirements
                    .filter(r => r.requirement_type === 'preferred')
                    .map(r => r.description);

                const resumeContent =
                    resume_text ||
                    [
                        candidate.full_name,
                        candidate.current_title ? `Current: ${candidate.current_title}` : '',
                        candidate.current_company ? `at ${candidate.current_company}` : '',
                        candidate.location ? `Location: ${candidate.location}` : '',
                        candidate.bio || '',
                        candidate.skills ? `Skills: ${candidate.skills}` : '',
                    ]
                        .filter(Boolean)
                        .join('\n');

                const review = await aiReviewService.reviewApplication({
                    application_id: application.id,
                    resume_text: resumeContent,
                    job_description: job.recruiter_description || job.description || '',
                    job_title: job.title,
                    required_skills: mandatorySkills,
                    preferred_skills: preferredSkills,
                    candidate_location: candidate.location,
                    job_location: job.location,
                    auto_transition,
                });

                if (auto_transition && application.stage === 'ai_review') {
                    await legacyApplicationService.handleAIReviewCompleted(application.id, review.fit_score);
                }

                return reply.send({ data: review });
            } catch (error: any) {
                request.log.error({ err: error }, 'Failed to trigger AI review');
                return reply.status(500).send({
                    error: { message: error.message || 'Failed to trigger AI review' },
                });
            }
        }
    );

    app.get(
        '/v2/jobs/:jobId/ai-review-stats',
        async (request: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { jobId } = request.params;
                const access = await resolveAccessContext(supabase, clerkUserId);

                const job = await legacyRepository.findJobById(jobId);
                if (!job) {
                    return reply.status(404).send({ error: { message: 'Job not found' } });
                }

                const organizationMatch =
                    job.company?.identity_organization_id &&
                    access.organizationIds.includes(job.company.identity_organization_id);
                const hasCompanyRole = access.roles.some(role => role === 'company_admin' || role === 'hiring_manager');
                const isRecruiterOwner = access.recruiterId && job.recruiter_id === access.recruiterId;

                if (
                    !access.isPlatformAdmin &&
                    !isRecruiterOwner &&
                    !(hasCompanyRole && organizationMatch)
                ) {
                    return reply.status(403).send({ error: { message: 'You do not have access to this job' } });
                }

                const stats = await aiReviewService.getAIReviewStats(jobId);
                return reply.send({ data: stats });
            } catch (error: any) {
                request.log.error({ err: error }, 'Failed to fetch AI review stats');
                return reply.status(500).send({
                    error: { message: error.message || 'Failed to fetch AI review stats' },
                });
            }
        }
    );
}
