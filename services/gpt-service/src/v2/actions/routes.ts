/**
 * GPT Action Routes
 *
 * Read-only and write GPT action endpoints.
 * Phase 13: GPT API Endpoints
 */

import { FastifyInstance } from 'fastify';
import { GptActionRepository } from './repository';
import { OAuthService } from '../oauth/oauth-service';
import { extractGptAuth, requireScope } from '../oauth/middleware';
import { gptError, formatJobForGpt, formatStageLabel } from './helpers';
import { GptJobDetail } from './types';

interface ActionRoutesConfig {
    repository: GptActionRepository;
    oauthService: OAuthService;
}

/**
 * Register GPT action endpoints
 */
export function registerActionRoutes(app: FastifyInstance, config: ActionRoutesConfig) {
    const { repository, oauthService } = config;

    // ========================================================================
    // Route 1: GET /api/v2/jobs/search
    // ========================================================================

    app.get(
        '/api/v2/jobs/search',
        {
            preHandler: [extractGptAuth(oauthService), requireScope('jobs:read')],
        },
        async (request, reply) => {
            try {
                // Parse query params
                const { keywords, location, commute_type, job_level, page } = request.query as {
                    keywords?: string;
                    location?: string;
                    commute_type?: string;
                    job_level?: string;
                    page?: string;
                };

                const pageNum = page ? parseInt(page, 10) : 1;

                // Search jobs
                const result = await repository.searchJobs(
                    keywords,
                    location,
                    commute_type,
                    job_level,
                    pageNum
                );

                // Map results through GPT formatter
                const jobs = result.data.map(formatJobForGpt);

                // Calculate pagination metadata
                const totalPages = Math.ceil(result.total / 5); // Hardcoded 5 per page

                // Return 200 even if empty
                return reply.send({
                    data: {
                        jobs,
                        pagination: {
                            page: pageNum,
                            total_pages: totalPages,
                            total_results: result.total,
                        },
                    },
                });
            } catch (error: any) {
                app.log.error({ error }, 'Job search failed');
                return reply.status(500).send(
                    gptError('INTERNAL_ERROR', 'Failed to search jobs', {
                        suggestion: 'Please try again later',
                    })
                );
            }
        }
    );

    // ========================================================================
    // Route 2: GET /api/v2/jobs/:id
    // ========================================================================

    app.get<{ Params: { id: string } }>(
        '/api/v2/jobs/:id',
        {
            preHandler: [extractGptAuth(oauthService), requireScope('jobs:read')],
        },
        async (request, reply) => {
            try {
                const { id } = request.params;

                // Validate UUID format
                const uuidRegex =
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(id)) {
                    return reply.status(400).send(
                        gptError('INVALID_REQUEST', 'Invalid job ID format', {
                            suggestion: 'Job ID must be a valid UUID',
                        })
                    );
                }

                // Fetch job detail
                const job = await repository.getJobDetail(id);

                if (!job) {
                    return reply.status(404).send(
                        gptError('NOT_FOUND', 'Job not found or no longer active', {
                            suggestion: 'Try searching for similar jobs using the job search endpoint',
                        })
                    );
                }

                // Format response to GptJobDetail shape
                const jobDetail: GptJobDetail = {
                    // Base GptJobSearchResult fields
                    ...formatJobForGpt(job),

                    // Additional detail fields
                    description: job.description || '',
                    responsibilities: job.responsibilities || [],

                    // Requirements mapped
                    requirements: (job.requirements || []).map((req: any) => ({
                        text: req.description,
                        type: req.requirement_type as 'mandatory' | 'preferred',
                    })),

                    // Pre-screen questions mapped
                    pre_screen_questions: (job.pre_screen_questions || []).map((q: any) => ({
                        id: q.id,
                        question: q.question,
                        type: q.question_type,
                        is_required: q.is_required,
                    })),

                    // Company object
                    company: {
                        name: job.company?.name || 'Unknown Company',
                        industry: job.company?.industry || '',
                        location: job.company?.headquarters_location || '',
                        website: job.company?.website || null,
                        description: job.company?.description || null,
                    },
                };

                return reply.send({ data: jobDetail });
            } catch (error: any) {
                app.log.error({ error, jobId: request.params.id }, 'Get job detail failed');
                return reply.status(500).send(
                    gptError('INTERNAL_ERROR', 'Failed to retrieve job details', {
                        suggestion: 'Please try again later',
                    })
                );
            }
        }
    );

    // ========================================================================
    // Route 3: GET /api/v2/applications
    // ========================================================================

    app.get(
        '/api/v2/applications',
        {
            preHandler: [extractGptAuth(oauthService), requireScope('applications:read')],
        },
        async (request, reply) => {
            try {
                // Get clerkUserId from validated token
                const clerkUserId = request.gptAuth!.clerkUserId;

                // Resolve candidate ID
                const candidateId = await repository.resolveCandidateId(clerkUserId);

                if (!candidateId) {
                    return reply.status(404).send(
                        gptError('NOT_FOUND', 'No candidate profile found for your account', {
                            suggestion: 'Create a candidate profile at applicant.network/portal/profile',
                        })
                    );
                }

                // Parse query params
                const { include_inactive, page } = request.query as {
                    include_inactive?: string;
                    page?: string;
                };

                const includeInactive = include_inactive === 'true';
                const pageNum = page ? parseInt(page, 10) : 1;

                // Fetch applications
                const result = await repository.getApplicationsForCandidate(
                    candidateId,
                    includeInactive,
                    pageNum
                );

                // Map to GptApplicationStatus
                const applications = result.data.map((app: any) => ({
                    id: app.id,
                    job_title: app.job?.title || 'Unknown',
                    company_name: app.job?.company?.name || 'Unknown',
                    status_label: formatStageLabel(app.stage),
                    applied_date: app.created_at
                        ? new Date(app.created_at).toISOString().split('T')[0]
                        : '',
                    last_updated: app.updated_at
                        ? new Date(app.updated_at).toISOString().split('T')[0]
                        : '',
                }));

                // Calculate pagination metadata
                const totalPages = Math.ceil(result.total / 10); // 10 per page

                return reply.send({
                    data: {
                        applications,
                        pagination: {
                            page: pageNum,
                            total_pages: totalPages,
                            total_results: result.total,
                        },
                    },
                });
            } catch (error: any) {
                app.log.error({ error }, 'Get applications failed');
                return reply.status(500).send(
                    gptError('INTERNAL_ERROR', 'Failed to retrieve applications', {
                        suggestion: 'Please try again later',
                    })
                );
            }
        }
    );
}
