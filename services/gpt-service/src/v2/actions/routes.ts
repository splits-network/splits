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
import { IEventPublisher } from '../shared/events';

interface ActionRoutesConfig {
    repository: GptActionRepository;
    oauthService: OAuthService;
    eventPublisher?: IEventPublisher;
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
    // Route 4: POST /api/v2/applications/submit
    // ========================================================================

    app.post<{ Body: GptSubmitApplicationRequest }>(
        '/api/v2/applications/submit',
        {
            preHandler: [extractGptAuth(oauthService), requireScope('applications:write')],
        },
        async (request, reply) => {
            try {
                const { job_id, confirmed, confirmation_token, pre_screen_answers, cover_letter } =
                    request.body;

                // Get clerkUserId from validated token
                const clerkUserId = request.gptAuth!.clerkUserId;

                // =============================================================
                // Path A: First call (confirmed is falsy) - Return CONFIRMATION_REQUIRED
                // =============================================================

                if (!confirmed) {
                    // Step 1: Resolve candidateId
                    const candidateId = await repository.resolveCandidateId(clerkUserId);
                    if (!candidateId) {
                        return reply.status(404).send(
                            gptError('NOT_FOUND', 'No candidate profile found', {
                                suggestion: 'Create a profile at applicant.network/portal/profile',
                            })
                        );
                    }

                    // Step 2: Validate job_id
                    if (!job_id) {
                        return reply.status(400).send(gptError('INVALID_REQUEST', 'job_id is required'));
                    }

                    // Step 3: Check for duplicate application
                    const existingApp = await repository.checkDuplicateApplication(candidateId, job_id);
                    if (existingApp) {
                        const appliedDate = existingApp.created_at
                            ? new Date(existingApp.created_at).toISOString().split('T')[0]
                            : 'unknown date';
                        return reply.status(409).send(
                            gptError(
                                'DUPLICATE_APPLICATION',
                                `You already applied to this job on ${appliedDate}`,
                                {
                                    suggestion: 'Check your application status instead',
                                }
                            )
                        );
                    }

                    // Step 4: Fetch job details
                    const job = await repository.getJobDetail(job_id);
                    if (!job) {
                        return reply.status(404).send(
                            gptError('NOT_FOUND', 'Job not found or no longer active')
                        );
                    }

                    // Step 5: Fetch pre-screen questions
                    const preScreenQuestions = await repository.getPreScreenQuestions(job_id);

                    // Step 6: Check required pre-screen questions
                    const requiredQuestions = preScreenQuestions.filter((q: any) => q.is_required);
                    const providedAnswerIds = (pre_screen_answers || []).map((a) => a.question_id);
                    const missingRequiredQuestions = requiredQuestions.filter(
                        (q: any) => !providedAnswerIds.includes(q.id)
                    );

                    if (missingRequiredQuestions.length > 0) {
                        // If no answers provided at all, return all questions
                        // If some answers provided, return only missing ones
                        const questionsToReturn =
                            !pre_screen_answers || pre_screen_answers.length === 0
                                ? requiredQuestions
                                : missingRequiredQuestions;

                        return reply.status(400).send({
                            error: {
                                code: 'MISSING_PRE_SCREEN_ANSWERS',
                                message:
                                    'This job requires answers to pre-screen questions before applying',
                                questions: questionsToReturn.map((q: any) => ({
                                    id: q.id,
                                    question: q.question,
                                    type: q.question_type,
                                    is_required: true,
                                })),
                            },
                        });
                    }

                    // Step 7: Generate confirmation token
                    const token = generateConfirmationToken(
                        clerkUserId,
                        job_id,
                        candidateId,
                        pre_screen_answers,
                        cover_letter
                    );

                    // Step 8: Build confirmation summary
                    const requirementsSummary: string[] = [];
                    if (job.requirements) {
                        const mandatoryReqs = job.requirements
                            .filter((r: any) => r.requirement_type === 'mandatory')
                            .slice(0, 5);
                        requirementsSummary.push(
                            ...mandatoryReqs.map((r: any) => r.description || r.text || '')
                        );
                    }

                    const preScreenAnswersProvided = (pre_screen_answers || []).map((ans) => {
                        const question = preScreenQuestions.find((q: any) => q.id === ans.question_id);
                        return {
                            question: question?.question || 'Unknown question',
                            answer: ans.answer,
                        };
                    });

                    const missingOptionalQuestions = preScreenQuestions.filter(
                        (q: any) => !q.is_required && !providedAnswerIds.includes(q.id)
                    );

                    const warnings: string[] = [];
                    if (!cover_letter || cover_letter.trim() === '') {
                        warnings.push('No cover letter provided');
                    }
                    if (missingOptionalQuestions.length > 0) {
                        warnings.push(
                            `${missingOptionalQuestions.length} optional pre-screen question${
                                missingOptionalQuestions.length > 1 ? 's' : ''
                            } not answered`
                        );
                    }

                    const summary: GptConfirmationSummary = {
                        confirmation_token: token.token,
                        expires_at: token.expiresAt.toISOString(),
                        job_title: job.title,
                        company_name: job.company?.name || 'Unknown Company',
                        requirements_summary: requirementsSummary,
                        pre_screen_answers_provided: preScreenAnswersProvided,
                        missing_required_questions: [], // Should be empty if we got here
                        warnings,
                    };

                    // Step 9: Return confirmation required
                    return reply.status(200).send({
                        data: {
                            status: 'CONFIRMATION_REQUIRED',
                            message: 'Please review the application details and confirm submission',
                            summary,
                        },
                    });
                }

                // =============================================================
                // Path B: Second call (confirmed === true) - Execute submission
                // =============================================================

                // Step 1: Validate confirmation_token
                if (!confirmation_token) {
                    return reply.status(400).send(
                        gptError('INVALID_REQUEST', 'confirmation_token is required when confirmed=true')
                    );
                }

                // Step 2: Retrieve token
                const token = getConfirmationToken(confirmation_token);
                if (!token) {
                    return reply.status(400).send(
                        gptError(
                            'CONFIRMATION_EXPIRED',
                            'Confirmation token has expired. Please start the application process again.'
                        )
                    );
                }

                // Step 3: Validate token belongs to this user
                if (token.clerkUserId !== clerkUserId) {
                    return reply.status(403).send(
                        gptError('INVALID_REQUEST', 'Confirmation token does not belong to this user')
                    );
                }

                // Step 4: Re-check for duplicate (race condition guard)
                const existingApp = await repository.checkDuplicateApplication(
                    token.candidateId,
                    token.jobId
                );
                if (existingApp) {
                    deleteConfirmationToken(confirmation_token);
                    const appliedDate = existingApp.created_at
                        ? new Date(existingApp.created_at).toISOString().split('T')[0]
                        : 'unknown date';
                    return reply.status(409).send(
                        gptError(
                            'DUPLICATE_APPLICATION',
                            `You already applied to this job on ${appliedDate}`,
                            {
                                suggestion: 'Check your application status instead',
                            }
                        )
                    );
                }

                // Step 5: Create the application
                const application = await repository.createApplication(
                    token.candidateId,
                    token.jobId,
                    token.coverLetter
                );

                // Step 6: Save pre-screen answers if present
                if (token.preScreenAnswers && token.preScreenAnswers.length > 0) {
                    await repository.savePreScreenAnswers(application.id, token.preScreenAnswers);
                }

                // Step 7: Delete the confirmation token
                deleteConfirmationToken(confirmation_token);

                // Step 8: Publish audit event
                if (eventPublisher) {
                    try {
                        await eventPublisher.publish('gpt.action.application_submitted', {
                            application_id: application.id,
                            candidate_id: token.candidateId,
                            job_id: token.jobId,
                            clerk_user_id: token.clerkUserId,
                        });
                    } catch (eventError: any) {
                        // Log but don't fail the request
                        app.log.error(
                            { error: eventError, application_id: application.id },
                            'Failed to publish application_submitted event'
                        );
                    }
                }

                // Step 9: Fetch job details for response
                const job = await repository.getJobDetail(token.jobId);

                // Return success
                return reply.status(201).send({
                    data: {
                        status: 'SUBMITTED',
                        message: 'Application submitted successfully',
                        application: {
                            id: application.id,
                            job_title: job?.title || 'Unknown',
                            company_name: job?.company?.name || 'Unknown',
                            applied_date: application.submitted_at
                                ? new Date(application.submitted_at).toISOString().split('T')[0]
                                : new Date(application.created_at).toISOString().split('T')[0],
                            status_label: 'Submitted',
                        },
                    },
                });
            } catch (error: any) {
                app.log.error({ error }, 'Application submission failed');
                return reply.status(500).send(
                    gptError('INTERNAL_ERROR', 'Failed to process application', {
                        suggestion: 'Please try again later',
                    })
                );
            }
        }
    );

    // ========================================================================
    // Route 5: POST /api/v2/resume/analyze
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
