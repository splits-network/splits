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
import {
    gptError,
    formatJobForGpt,
    formatStageLabel,
    generateConfirmationToken,
    getConfirmationToken,
    deleteConfirmationToken,
} from './helpers';
import {
    GptJobDetail,
    GptSubmitApplicationRequest,
    GptConfirmationSummary,
    GptResumeAnalysisRequest,
    GptResumeAnalysisResponse,
} from './types';
import { EventPublisher } from '../shared/events';

interface ActionRoutesConfig {
    repository: GptActionRepository;
    oauthService: OAuthService;
    eventPublisher?: EventPublisher;
}

/**
 * Register GPT action endpoints
 */
export function registerActionRoutes(app: FastifyInstance, config: ActionRoutesConfig) {
    const { repository, oauthService, eventPublisher } = config;

    // Read ai-service URL from environment once
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:3009';

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

    // ========================================================================
    // Route 4: POST /api/v2/resume/analyze
    // ========================================================================

    app.post<{
        Body: {
            job_id: string;
            resume_text?: string;
        };
    }>(
        '/api/v2/resume/analyze',
        {
            preHandler: [extractGptAuth(oauthService), requireScope('resume:read')],
        },
        async (request, reply) => {
            try {
                // Get clerkUserId from validated token
                const clerkUserId = request.gptAuth!.clerkUserId;

                // Resolve candidate ID
                const candidateId = await repository.resolveCandidateId(clerkUserId);

                if (!candidateId) {
                    return reply.status(404).send(
                        gptError('NOT_FOUND', 'No candidate profile found', {
                            suggestion: 'Create a profile at applicant.network/portal/profile',
                        })
                    );
                }

                // Validate job_id is present
                const { job_id, resume_text } = request.body;

                if (!job_id) {
                    return reply.status(400).send(
                        gptError('INVALID_REQUEST', 'job_id is required')
                    );
                }

                // Validate job exists and get details
                const job = await repository.getJobDetail(job_id);

                if (!job) {
                    return reply.status(404).send(
                        gptError('NOT_FOUND', 'Job not found or no longer active')
                    );
                }

                // Resolve resume text (priority: request body > stored resume > error)
                let resolvedResumeText: string | null = null;

                if (resume_text) {
                    // GPT provided extracted text from user upload
                    resolvedResumeText = resume_text;
                    app.log.info({ candidateId, job_id }, 'Using resume text from GPT upload');
                } else {
                    // Try to get stored resume
                    const storedResume = await repository.getCandidateResume(candidateId);

                    if (storedResume?.metadata?.extracted_text) {
                        resolvedResumeText = storedResume.metadata.extracted_text;
                        app.log.info({ candidateId, job_id }, 'Using stored resume text');
                    }
                }

                // If no resume available from either source, return error
                if (!resolvedResumeText) {
                    return reply.status(400).send(
                        gptError(
                            'RESUME_NOT_FOUND',
                            'No resume available for analysis. Please either upload your resume in the chat, or upload it to your profile.',
                            {
                                suggestion: 'Upload your resume at applicant.network/portal/profile',
                            }
                        )
                    );
                }

                // Prepare request payload for ai-service
                const aiServicePayload = {
                    application_id: `gpt-analysis-${candidateId}-${job_id}-${Date.now()}`,
                    candidate_id: candidateId,
                    job_id: job_id,
                    resume_text: resolvedResumeText,
                    job_description: job.description,
                    job_title: job.title,
                    required_skills:
                        job.requirements
                            ?.filter((r: any) => r.requirement_type === 'mandatory')
                            .map((r: any) => r.description) || [],
                    preferred_skills:
                        job.requirements
                            ?.filter((r: any) => r.requirement_type === 'preferred')
                            .map((r: any) => r.description) || [],
                    candidate_location: null,
                    job_location: job.location,
                };

                // Call ai-service for analysis
                app.log.info({ candidateId, job_id }, 'Calling ai-service for resume analysis');

                const aiResponse = await fetch(`${AI_SERVICE_URL}/api/v2/ai-reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY || '',
                    },
                    body: JSON.stringify(aiServicePayload),
                });

                if (!aiResponse.ok) {
                    const errorText = await aiResponse.text();
                    app.log.error(
                        { candidateId, job_id, status: aiResponse.status, error: errorText },
                        'ai-service call failed'
                    );
                    return reply.status(500).send(
                        gptError('INTERNAL_ERROR', 'Resume analysis failed. Please try again.')
                    );
                }

                // Parse ai-service response
                const aiResult = (await aiResponse.json()) as { data: any };
                const review = aiResult.data;

                // Map to GptResumeAnalysisResponse
                const analysisResponse = {
                    fit_score: review.fit_score,
                    strengths: review.strengths || [],
                    gaps: review.concerns || review.missing_skills || [],
                    recommendation: review.recommendation,
                    overall_summary: review.overall_summary,
                };

                // Publish audit event
                if (eventPublisher) {
                    await eventPublisher.publish('gpt.action.resume_analyzed', {
                        candidate_id: candidateId,
                        job_id: job_id,
                        fit_score: review.fit_score,
                        clerk_user_id: clerkUserId,
                        resume_source: resume_text ? 'gpt_upload' : 'stored',
                    });
                }

                app.log.info(
                    { candidateId, job_id, fit_score: review.fit_score },
                    'Resume analysis completed'
                );

                return reply.send({ data: analysisResponse });
            } catch (error: any) {
                app.log.error({ error, body: request.body }, 'Resume analysis failed');

                // Handle specific error cases
                if (error.message?.includes('fetch')) {
                    return reply.status(500).send(
                        gptError(
                            'INTERNAL_ERROR',
                            'AI service is currently unavailable. Please try again later.'
                        )
                    );
                }

                return reply.status(500).send(
                    gptError('INTERNAL_ERROR', 'Resume analysis failed. Please try again.')
                );
            }
        }
    );
}
