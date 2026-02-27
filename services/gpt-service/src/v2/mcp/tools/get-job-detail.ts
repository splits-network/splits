/**
 * MCP Tool: get_job_detail
 *
 * Get detailed information about a specific job listing.
 * Read-only tool — reuses GptActionRepository.getJobDetail().
 */

import { z, ZodTypeAny } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GptActionRepository } from '../../actions/repository';
import { formatJobForGpt } from '../../actions/helpers';
import { GptJobDetail } from '../../actions/types';
import { McpAuthContext, toolError } from '../types';
import { requireMcpScope } from '../auth';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Extracted to avoid TS2589 deep type inference in registerTool generics
const getJobDetailSchema: Record<string, ZodTypeAny> = {
    job_id: z.string().describe('UUID of the job listing'),
};

export function registerGetJobDetailTool(
    server: McpServer,
    repository: GptActionRepository,
    getAuth: () => McpAuthContext,
) {
    // @ts-ignore TS2589: ZodTypeAny schema may trigger deep inference in registerTool generics
    server.registerTool(
        'get_job_detail',
        {
            title: 'Get Job Details',
            description: 'Get full details for a specific job listing including description, requirements, pre-screen questions, and company info. The response includes a view_url — always use this exact URL when linking to the job. Never construct job URLs yourself.',
            inputSchema: getJobDetailSchema,
            annotations: {
                readOnlyHint: true,
                openWorldHint: false,
                destructiveHint: false,
            },
            _meta: { 'ui/resourceUri': 'ui://career-copilot/job-detail.html' },
        },
        async ({ job_id }) => {
            const auth = getAuth();
            requireMcpScope(auth, 'jobs:read');

            const jobId = job_id as string;
            if (!UUID_REGEX.test(jobId)) {
                return toolError('Invalid job ID format. Must be a valid UUID.');
            }

            const job = await repository.getJobDetail(jobId);
            if (!job) {
                return toolError('Job not found or no longer active.');
            }

            const jobDetail: GptJobDetail = {
                ...formatJobForGpt(job),
                description: job.description || '',
                responsibilities: job.responsibilities || [],
                requirements: (job.requirements || []).map((req: any) => ({
                    text: req.description,
                    type: req.requirement_type as 'mandatory' | 'preferred',
                })),
                pre_screen_questions: (job.pre_screen_questions || []).map((q: any) => ({
                    question: q.question,
                    type: q.question_type,
                    is_required: q.is_required,
                    options: q.options,
                    disclaimer: q.disclaimer,
                })),
                company: {
                    name: job.company?.name || 'Unknown Company',
                    industry: job.company?.industry || '',
                    location: job.company?.headquarters_location || '',
                    website: job.company?.website || null,
                    description: job.company?.description || null,
                },
            };

            return {
                structuredContent: jobDetail as unknown as Record<string, unknown>,
                content: [
                    {
                        type: 'text' as const,
                        text: `${jobDetail.title} at ${jobDetail.company.name} — ${jobDetail.location}. ${jobDetail.requirements.length} requirements listed.`,
                    },
                ],
            };
        },
    );
}
