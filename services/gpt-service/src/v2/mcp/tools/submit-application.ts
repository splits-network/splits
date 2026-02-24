/**
 * MCP Tool: submit_application
 *
 * Two-step application submission with interactive confirmation.
 * Step 1 (confirmed=false): Returns confirmation summary for review.
 * Step 2 (confirmed=true + token): Executes submission.
 */

import { z, ZodTypeAny } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GptActionRepository } from '../../actions/repository';
import {
    generateConfirmationToken,
    getConfirmationToken,
    deleteConfirmationToken,
} from '../../actions/helpers';
import { McpAuthContext, toolError } from '../types';
import { requireMcpScope } from '../auth';
import { IEventPublisher } from '../../shared/events';

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
        async ({ job_id, confirmed, confirmation_token, pre_screen_answers, cover_letter }) => {
            const auth = getAuth();
            requireMcpScope(auth, 'applications:write');

            const jobId = job_id as string;
            const isConfirmed = confirmed as boolean | undefined;
            const token = confirmation_token as string | undefined;
            const answers = pre_screen_answers as { question: string; answer: string }[] | undefined;
            const letter = cover_letter as string | undefined;

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

                // Check duplicate
                const existing = await repository.checkDuplicateApplication(candidateId, jobId);
                if (existing) {
                    const date = existing.created_at
                        ? new Date(existing.created_at).toISOString().split('T')[0]
                        : 'unknown date';
                    return toolError(`You already applied to this job on ${date}. Check your application status instead.`);
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

                // Generate token
                const confirmToken = generateConfirmationToken(
                    auth.clerkUserId,
                    jobId,
                    candidateId,
                    answersWithSnapshots,
                    letter,
                );

                // Build warnings
                const warnings: string[] = [];
                if (!letter?.trim()) warnings.push('No cover letter provided');
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

            // Race condition guard
            const existing = await repository.checkDuplicateApplication(storedToken.candidateId, storedToken.jobId);
            if (existing) {
                deleteConfirmationToken(token);
                return toolError('You already applied to this job.');
            }

            // Create application
            const application = await repository.createApplication(
                storedToken.candidateId,
                storedToken.jobId,
                storedToken.coverLetter,
            );

            // Save pre-screen answers
            if (storedToken.preScreenAnswers?.length) {
                await repository.savePreScreenAnswers(application.id, storedToken.preScreenAnswers);
            }

            deleteConfirmationToken(token);

            // Publish audit event
            if (eventPublisher) {
                try {
                    await eventPublisher.publish('gpt.action.application_submitted', {
                        application_id: application.id,
                        candidate_id: storedToken.candidateId,
                        job_id: storedToken.jobId,
                        clerk_user_id: storedToken.clerkUserId,
                        source: 'mcp_app',
                    });
                } catch {
                    // Log but don't fail
                }
            }

            // Get job info for response
            const job = await repository.getJobDetail(storedToken.jobId);

            return {
                structuredContent: {
                    status: 'SUBMITTED',
                    application: {
                        id: application.id,
                        job_title: job?.title || 'Unknown',
                        company_name: job?.company?.name || 'Unknown',
                        applied_date: new Date(application.submitted_at || application.created_at)
                            .toISOString().split('T')[0],
                        status_label: 'Submitted',
                    },
                } as unknown as Record<string, unknown>,
                content: [{
                    type: 'text' as const,
                    text: `Application submitted successfully for ${job?.title || 'the position'} at ${job?.company?.name || 'the company'}.`,
                }],
            };
        },
    );
}
