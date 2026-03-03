/**
 * MCP Tool: search_jobs
 *
 * Search for active job listings with filters.
 * Read-only tool — reuses GptActionRepository.searchJobs().
 */

import { z, ZodTypeAny } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GptActionRepository } from '../../actions/repository';
import { formatJobForGpt } from '../../actions/helpers';
import { McpAuthContext } from '../types';
import { requireMcpScope } from '../auth';

// Extracted to avoid TS2589 deep type inference in registerTool generics
const searchJobsSchema: Record<string, ZodTypeAny> = {
    keywords: z.string().optional().describe('Search keywords (job title, skills, etc.)'),
    location: z.string().optional().describe('Location filter (city, state, or "remote")'),
    commute_type: z.string().optional().describe('Commute type: remote, hybrid, onsite'),
    job_level: z.string().optional().describe('Job level: entry, mid, senior, lead, executive'),
    page: z.number().int().min(1).optional().describe('Page number (default: 1, 5 results per page)'),
};

export function registerSearchJobsTool(
    server: McpServer,
    repository: GptActionRepository,
    getAuth: () => McpAuthContext,
) {
    // @ts-ignore TS2589: ZodTypeAny schema may trigger deep inference in registerTool generics
    server.registerTool(
        'search_jobs',
        {
            title: 'Search Jobs',
            description: 'Search for active job listings. Supports keyword search, location, commute type, and job level filters. Returns 5 results per page with pagination. Each result includes a view_url — always use this exact URL when linking to jobs. Never construct job URLs yourself.',
            inputSchema: searchJobsSchema,
            annotations: {
                readOnlyHint: true,
                openWorldHint: false,
                destructiveHint: false,
            },
            _meta: { 'ui/resourceUri': 'ui://career-copilot/job-search.html' },
        },
        async ({ keywords, location, commute_type, job_level, page: pageArg }) => {
            const auth = getAuth();
            requireMcpScope(auth, 'jobs:read');

            const page = (pageArg as number | undefined) ?? 1;
            const result = await repository.searchJobs(
                keywords as string | undefined,
                location as string | undefined,
                commute_type as string | undefined,
                job_level as string | undefined,
                page,
            );

            const jobs = result.data.map(formatJobForGpt);
            const totalPages = Math.ceil(result.total / 5);

            const structured = {
                jobs,
                pagination: { page, total_pages: totalPages, total_results: result.total },
            };

            // Build rich text content so ChatGPT can present job cards
            let text: string;
            if (jobs.length === 0) {
                text = 'No jobs found matching your criteria. Try broadening your search.';
            } else {
                const lines = [`Found ${result.total} job${result.total !== 1 ? 's' : ''}. Page ${page} of ${totalPages}.\n`];
                for (const job of jobs) {
                    const parts = [
                        `**${job.title}** at ${job.company_name || '3rd Party Firm'}`,
                        `${job.location}${job.commute_types?.length ? ' · ' + job.commute_types.join(', ') : ''}`,
                    ];
                    if (job.salary_range) parts.push(`Salary: ${job.salary_range}`);
                    if (job.job_level) parts.push(`Level: ${job.job_level}`);
                    if (job.summary) parts.push(job.summary);
                    parts.push(`[View job](${job.view_url})`);
                    lines.push(parts.join('\n'));
                }
                text = lines.join('\n\n---\n\n');
            }

            return {
                structuredContent: structured as unknown as Record<string, unknown>,
                content: [{ type: 'text' as const, text }],
            };
        },
    );
}
