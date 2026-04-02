/**
 * MCP Tool: analyze_resume
 *
 * Analyze a candidate's resume against a specific job listing.
 * Read-only tool — calls ai-service for analysis.
 */

import { z, ZodTypeAny } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GptActionRepository } from '../../actions/repository.js';
import { McpAuthContext, toolError, safeTool } from '../types.js';
import { requireMcpScope } from '../auth.js';
import { IEventPublisher } from '../../shared/events.js';

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

    // @ts-ignore TS2589: ZodTypeAny schema may trigger deep inference in registerTool generics
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
        safeTool('analyze_resume', async ({ job_id, resume_text }) => {
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

            // Resolve job description (recruiter_description is the internal/full version)
            const jobDescription = job.recruiter_description || job.description || '';

            if (!jobDescription && (!job.requirements || job.requirements.length === 0)) {
                return toolError('This job has no description or requirements — resume analysis needs something to compare against.');
            }

            // ai-service skips ATS enrichment only when job_description is truthy.
            // If description is empty but requirements exist, synthesize a minimal description
            // so ai-service doesn't try to fetch via the synthetic application_id.
            const effectiveDescription = jobDescription
                || `Requirements: ${(job.requirements || []).map((r: any) => r.description).join('; ')}`;

            // Call ai-service — must provide all fields so it doesn't try to enrich
            // via ATS (the application_id here is synthetic, not a real DB record)
            const aiPayload = {
                application_id: `gpt-analysis-${candidateId}-${jobId}-${Date.now()}`,
                candidate_id: candidateId,
                job_id: jobId,
                resume_text: resumeText,
                job_description: effectiveDescription,
                job_title: job.title || 'Unknown Position',
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
                signal: AbortSignal.timeout(60_000),
            });

            if (!aiResponse.ok) {
                await aiResponse.text().catch(() => '');
                const errorDetail = aiResponse.status === 500
                    ? 'The AI analysis service encountered an error'
                    : `Unexpected response (${aiResponse.status})`;
                return toolError(`Resume analysis failed: ${errorDetail}. Please try again later.`);
            }

            let review: any;
            try {
                const aiResult = (await aiResponse.json()) as { data: any };
                review = aiResult?.data;
            } catch {
                return toolError('Resume analysis failed: received an invalid response from the AI service.');
            }

            if (!review || typeof review.fit_score !== 'number') {
                return toolError('Resume analysis returned incomplete results. Please try again.');
            }

            const analysis = {
                fit_score: review.fit_score,
                strengths: review.strengths || [],
                gaps: review.concerns || review.missing_skills || [],
                recommendation: review.recommendation || 'unknown',
                overall_summary: review.overall_summary || '',
                job_title: job.title || 'Unknown Position',
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
        }),
    );
}
