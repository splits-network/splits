/**
 * MCP Tool: submit_application
 *
 * Two-step application submission with interactive confirmation.
 * Step 1 (confirmed=false): Returns confirmation summary for review.
 * Step 2 (confirmed=true + token): Executes submission.
 */

import { z, ZodTypeAny } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GptActionRepository } from '../../actions/repository.js';
import {
    generateConfirmationToken,
    getConfirmationToken,
    deleteConfirmationToken,
} from '../../actions/helpers.js';
import { McpAuthContext, toolError, safeTool } from '../types.js';
import { requireMcpScope } from '../auth.js';
import { IEventPublisher } from '../../shared/events.js';

// Extracted to avoid TS2589 deep type inference in registerTool generics
const submitApplicationSchema: Record<string, ZodTypeAny> = {
    job_id: z.string().describe('UUID of the job to apply to'),
    confirmed: z.boolean().optional().describe('Set to true with confirmation_token to finalize submission'),
    confirmation_token: z.string().optional().describe('Token from the confirmation step'),
    pre_screen_answers: z
        .array(z.object({
            question: z.string(),
            answer: z.string(),
        }))
        .optional()
        .describe('Answers to pre-screen questions'),
    cover_letter: z.string().optional().describe('Optional cover letter text'),
    resume_data: z.object({
        raw_text: z.string().describe('Full plain-text content of the resume'),
        contact: z.object({
            name: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            location: z.string().optional(),
            linkedin_url: z.string().optional(),
            website: z.string().optional(),
        }).optional().describe('Contact information'),
        summary: z.string().optional().describe('Professional summary or objective'),
        experience: z.array(z.object({
            title: z.string(),
            company: z.string(),
            location: z.string().optional(),
            start_date: z.string().optional(),
            end_date: z.string().optional(),
            is_current: z.boolean().optional(),
            description: z.string().optional(),
            highlights: z.array(z.string()).optional(),
        })).optional().describe('Work experience entries'),
        education: z.array(z.object({
            institution: z.string(),
            degree: z.string().optional(),
            field_of_study: z.string().optional(),
            start_date: z.string().optional(),
            end_date: z.string().optional(),
            gpa: z.string().optional(),
        })).optional().describe('Education entries'),
        skills: z.array(z.object({
            name: z.string(),
            category: z.string().optional(),
        })).optional().describe('Skills with optional category grouping'),
        certifications: z.array(z.object({
            name: z.string(),
            issuer: z.string().optional(),
            date_obtained: z.string().optional(),
            expiry_date: z.string().optional(),
        })).optional().describe('Professional certifications'),
    }).optional().describe('Structured resume data extracted from the candidate\'s resume. If the candidate attaches a resume file, extract and structure its content into this field. Include raw_text with the full text plus structured sections.'),
};

export function registerSubmitApplicationTool(
    server: McpServer,
    repository: GptActionRepository,
    getAuth: () => McpAuthContext,
    eventPublisher?: IEventPublisher,
) {
    server.registerTool(
        'submit_application',
        {
            title: 'Apply to Job',
            description: 'Submit a job application. First call without confirmed=true to get a confirmation summary. Then call again with confirmed=true and the confirmation_token to finalize.',
            inputSchema: submitApplicationSchema,
            annotations: {
                readOnlyHint: false,
                openWorldHint: false,
                destructiveHint: false,
            },
            _meta: { 'ui/resourceUri': 'ui://career-copilot/application-submit.html' },
        },
        safeTool('submit_application', async ({ job_id, confirmed, confirmation_token, pre_screen_answers, cover_letter, resume_data }) => {
            const auth = getAuth();
            requireMcpScope(auth, 'applications:write');

            const jobId = job_id as string;
            const isConfirmed = confirmed as boolean | undefined;
            const token = confirmation_token as string | undefined;
            const answers = pre_screen_answers as { question: string; answer: string }[] | undefined;
            const letter = cover_letter as string | undefined;
            const resumeInput = resume_data as Record<string, unknown> | undefined;

            // ===============================================================
            // Path A: Confirmation step (confirmed is falsy)
            // ===============================================================
            if (!isConfirmed) {
                const candidateId = await repository.resolveCandidateId(auth.clerkUserId);
                if (!candidateId) {
                    return toolError('No candidate profile found. Create one at applicant.network/portal/profile');
                }

                if (!jobId) {
                    return toolError('job_id is required');
                }

                // Check for existing application
                const existing = await repository.checkDuplicateApplication(candidateId, jobId);
                let existingApplicationId: string | undefined;
                if (existing) {
                    if (existing.stage === 'recruiter_proposed') {
                        // Recruiter proposed this candidate — allow them to accept and submit
                        existingApplicationId = existing.id;
                    } else {
                        const date = existing.created_at
                            ? new Date(existing.created_at).toISOString().split('T')[0]
                            : 'unknown date';
                        return toolError(`You already applied to this job on ${date}. Check your application status instead.`);
                    }
                }

                // Fetch job
                const job = await repository.getJobDetail(jobId);
                if (!job) {
                    return toolError('Job not found or no longer active.');
                }

                // Check required pre-screen questions
                const preScreenQuestions: any[] = job.pre_screen_questions || [];
                const requiredQuestions = preScreenQuestions.filter((q: any) => q.is_required);
                const providedAnswers = answers || [];
                const providedTexts = providedAnswers.map((a) => a.question);
                const missing = requiredQuestions.filter(
                    (q: any) => !providedTexts.includes(q.question),
                );

                if (missing.length > 0) {
                    return {
                        isError: true,
                        structuredContent: {
                            error: 'MISSING_PRE_SCREEN_ANSWERS',
                            questions: missing.map((q: any) => ({
                                question: q.question,
                                type: q.question_type,
                                is_required: true,
                            })),
                        } as unknown as Record<string, unknown>,
                        content: [{
                            type: 'text' as const,
                            text: `This job requires answers to ${missing.length} pre-screen question${missing.length > 1 ? 's' : ''} before applying.`,
                        }],
                    };
                }

                // Build answers with snapshots
                const answersWithSnapshots = providedAnswers.map((ans) => {
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

                // Check if candidate has a resume on file
                const existingResume = await repository.getCandidateResume(candidateId);
                const hasResumeOnFile = !!existingResume;

                // Generate token (includes resume data and existing app ID if accepting proposal)
                const confirmToken = generateConfirmationToken(
                    auth.clerkUserId,
                    jobId,
                    candidateId,
                    answersWithSnapshots,
                    letter,
                    resumeInput as any,
                    existingApplicationId,
                );

                // Build warnings
                const warnings: string[] = [];
                if (!letter?.trim()) warnings.push('No cover letter provided');
                if (!hasResumeOnFile && !resumeInput) {
                    warnings.push('No resume provided. Attach a resume file or paste resume text for best results.');
                }
                const optionalUnanswered = preScreenQuestions.filter(
                    (q: any) => !q.is_required && !providedTexts.includes(q.question),
                );
                if (optionalUnanswered.length > 0) {
                    warnings.push(`${optionalUnanswered.length} optional question${optionalUnanswered.length > 1 ? 's' : ''} not answered`);
                }

                // Requirements summary (top 5 mandatory)
                const reqSummary = (job.requirements || [])
                    .filter((r: any) => r.requirement_type === 'mandatory')
                    .slice(0, 5)
                    .map((r: any) => r.description || r.text || '');

                const summary = {
                    status: 'CONFIRMATION_REQUIRED',
                    confirmation_token: confirmToken.token,
                    expires_at: confirmToken.expiresAt.toISOString(),
                    job_title: job.title,
                    company_name: job.company?.name || 'Unknown Company',
                    requirements_summary: reqSummary,
                    pre_screen_answers_provided: providedAnswers,
                    warnings,
                };

                return {
                    structuredContent: summary as unknown as Record<string, unknown>,
                    content: [{
                        type: 'text' as const,
                        text: `Ready to apply for ${job.title} at ${job.company?.name || 'Unknown Company'}. Please review and confirm.`,
                    }],
                };
            }

            // ===============================================================
            // Path B: Execute submission (confirmed === true)
            // ===============================================================
            if (!token) {
                return toolError('confirmation_token is required when confirmed=true');
            }

            const storedToken = getConfirmationToken(token);
            if (!storedToken) {
                return toolError('Confirmation token has expired. Please start the application process again.');
            }

            if (storedToken.clerkUserId !== auth.clerkUserId) {
                return toolError('Confirmation token does not belong to this user.');
            }

            // Race condition guard: re-check for duplicates
            const existingCheck = await repository.checkDuplicateApplication(storedToken.candidateId, storedToken.jobId);
            if (existingCheck && existingCheck.stage !== 'recruiter_proposed') {
                deleteConfirmationToken(token);
                return toolError('You already applied to this job.');
            }

            let application: any;
            let isProposalAcceptance = false;

            if (storedToken.existingApplicationId) {
                // Accepting a recruiter proposal — update existing application
                application = await repository.acceptProposalForReview(
                    storedToken.existingApplicationId,
                    storedToken.coverLetter,
                    storedToken.resumeData,
                    'mcp_tool',
                );
                isProposalAcceptance = true;
            } else {
                // New application
                application = await repository.createApplication(
                    storedToken.candidateId,
                    storedToken.jobId,
                    storedToken.coverLetter,
                    storedToken.resumeData,
                    'mcp_tool',
                );
            }

            // Save pre-screen answers
            if (storedToken.preScreenAnswers?.length) {
                await repository.savePreScreenAnswers(application.id, storedToken.preScreenAnswers);
            }

            deleteConfirmationToken(token);

            // Publish events for AI review pipeline
            if (eventPublisher) {
                try {
                    // Publish application.created for other services (notification, analytics, etc.)
                    if (!isProposalAcceptance) {
                        await eventPublisher.publish('application.created', {
                            application_id: application.id,
                            candidate_id: storedToken.candidateId,
                            job_id: storedToken.jobId,
                            stage: 'gpt_review',
                        });
                    }
                    // Stage change event — AI service listens for new_stage === 'gpt_review'
                    await eventPublisher.publish('application.stage_changed', {
                        application_id: application.id,
                        candidate_id: storedToken.candidateId,
                        job_id: storedToken.jobId,
                        old_stage: isProposalAcceptance ? 'recruiter_proposed' : 'draft',
                        new_stage: 'gpt_review',
                    });
                    // Audit event
                    await eventPublisher.publish('gpt.action.application_submitted', {
                        application_id: application.id,
                        candidate_id: storedToken.candidateId,
                        job_id: storedToken.jobId,
                        clerk_user_id: storedToken.clerkUserId,
                        source: 'mcp_app',
                        proposal_accepted: isProposalAcceptance,
                    });
                } catch {
                    // Log but don't fail — application is already persisted
                }
            }

            // Get job info for response
            const job = await repository.getJobDetail(storedToken.jobId);

            return {
                structuredContent: {
                    status: 'AI_REVIEW',
                    application: {
                        id: application.id,
                        job_title: job?.title || 'Unknown',
                        company_name: job?.company?.name || 'Unknown',
                        applied_date: new Date(application.created_at).toISOString().split('T')[0],
                        status_label: 'AI Review',
                    },
                } as unknown as Record<string, unknown>,
                content: [{
                    type: 'text' as const,
                    text: isProposalAcceptance
                        ? `Recruiter proposal accepted! Your application for ${job?.title || 'the position'} at ${job?.company?.name || 'the company'} is now being reviewed by AI. You'll be notified when the review is complete.`
                        : `Application submitted for ${job?.title || 'the position'} at ${job?.company?.name || 'the company'}. AI review is in progress — you'll be notified when it's complete.`,
                }],
            };
        }),
    );
}
