/**
 * MCP Tool: analyze_resume
 *
 * Analyze a candidate's resume against a specific job listing.
 * Read-only tool — calls ai-service for analysis.
 */

import { z, ZodTypeAny } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GptActionRepository } from '../../actions/repository';
import { McpAuthContext, toolError } from '../types';
import { requireMcpScope } from '../auth';
import { IEventPublisher } from '../../shared/events';

// Extracted to avoid TS2589 deep type inference in registerTool generics
const analyzeResumeSchema: Record<string, ZodTypeAny> = {
    job_id: z.string().describe('UUID of the job to analyze resume against'),
    resume_text: z.string().optional().describe('Resume text (if not provided, uses stored resume from profile)'),
};

export function registerAnalyzeResumeTool(
    server: McpServer,
    repository: GptActionRepository,
    getAuth: () => McpAuthContext,
    eventPublisher?: IEventPublisher,
) {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:3009';

    // @ts-expect-error TS2589: ZodTypeAny schema triggers deep inference in registerTool generics
    server.registerTool(
        'analyze_resume',
        {
            title: 'Analyze Resume',
            description: 'Analyze your resume against a specific job listing. Returns a fit score (0-100), strengths, gaps, and recommendations. Uses your stored resume or provide resume text directly.',
            inputSchema: analyzeResumeSchema,
            annotations: {
                readOnlyHint: true,
                openWorldHint: false,
                destructiveHint: false,
            },
            _meta: { 'ui/resourceUri': 'ui://career-copilot/resume-analysis.html' },
        },
        async ({ job_id, resume_text }) => {
            const auth = getAuth();
            requireMcpScope(auth, 'resume:read');

            const jobId = job_id as string;
            const resumeArg = resume_text as string | undefined;

            const candidateId = await repository.resolveCandidateId(auth.clerkUserId);
            if (!candidateId) {
                return toolError('No candidate profile found. Create one at applicant.network/portal/profile');
            }

            if (!jobId) {
                return toolError('job_id is required');
            }

            // Get job details
            const job = await repository.getJobDetail(jobId);
            if (!job) {
                return toolError('Job not found or no longer active.');
            }

            // Resolve resume text
            let resumeText: string | null = resumeArg || null;

            if (!resumeText) {
                const storedResume = await repository.getCandidateResume(candidateId);
                if (storedResume?.metadata?.extracted_text) {
                    resumeText = storedResume.metadata.extracted_text;
                }
            }

            if (!resumeText) {
                return toolError('No resume available. Upload your resume in the chat or at applicant.network/portal/profile');
            }

            // Call ai-service
            const aiPayload = {
                application_id: `gpt-analysis-${candidateId}-${jobId}-${Date.now()}`,
                candidate_id: candidateId,
                job_id: jobId,
                resume_text: resumeText,
                job_description: job.description,
                job_title: job.title,
                required_skills: (job.requirements || [])
                    .filter((r: any) => r.requirement_type === 'mandatory')
                    .map((r: any) => r.description),
                preferred_skills: (job.requirements || [])
                    .filter((r: any) => r.requirement_type === 'preferred')
                    .map((r: any) => r.description),
                candidate_location: null,
                job_location: job.location,
            };

            const aiResponse = await fetch(`${AI_SERVICE_URL}/api/v2/ai-reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY || '',
                },
                body: JSON.stringify(aiPayload),
            });

            if (!aiResponse.ok) {
                return toolError('Resume analysis failed. Please try again later.');
            }

            const aiResult = (await aiResponse.json()) as { data: any };
            const review = aiResult.data;

            const analysis = {
                fit_score: review.fit_score,
                strengths: review.strengths || [],
                gaps: review.concerns || review.missing_skills || [],
                recommendation: review.recommendation,
                overall_summary: review.overall_summary,
                job_title: job.title,
                company_name: job.company?.name || 'Unknown',
            };

            // Publish audit event
            if (eventPublisher) {
                try {
                    await eventPublisher.publish('gpt.action.resume_analyzed', {
                        candidate_id: candidateId,
                        job_id: jobId,
                        fit_score: review.fit_score,
                        clerk_user_id: auth.clerkUserId,
                        resume_source: resumeArg ? 'gpt_upload' : 'stored',
                        source: 'mcp_app',
                    });
                } catch {
                    // Log but don't fail
                }
            }

            return {
                structuredContent: analysis as unknown as Record<string, unknown>,
                content: [{
                    type: 'text' as const,
                    text: `Resume analysis for ${job.title} at ${job.company?.name || 'Unknown'}: Fit score ${review.fit_score}/100. ${review.strengths?.length || 0} strengths, ${(review.concerns || review.missing_skills || []).length} gaps identified.`,
                }],
            };
        },
    );
}
