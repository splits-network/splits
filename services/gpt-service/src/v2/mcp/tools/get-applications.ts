/**
 * MCP Tool: get_applications
 *
 * List the authenticated user's job applications.
 * Read-only tool — reuses GptActionRepository.getApplicationsForCandidate().
 */

import { z, ZodTypeAny } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GptActionRepository } from '../../actions/repository.js';
import { formatStageLabel } from '../../actions/helpers.js';
import { McpAuthContext, toolError, safeTool } from '../types.js';
import { requireMcpScope } from '../auth.js';

// Extracted to avoid TS2589 deep type inference in registerTool generics
const getApplicationsSchema: Record<string, ZodTypeAny> = {
    include_inactive: z.boolean().optional().describe('Include withdrawn/rejected applications (default: false)'),
    page: z.number().int().min(1).optional().describe('Page number (default: 1, 10 results per page)'),
};

export function registerGetApplicationsTool(
    server: McpServer,
    repository: GptActionRepository,
    getAuth: () => McpAuthContext,
) {
    server.registerTool(
        'get_applications',
        {
            title: 'My Applications',
            description: 'List your job applications with status updates. Shows active applications by default; set include_inactive to also see withdrawn/rejected ones.',
            inputSchema: getApplicationsSchema,
            annotations: {
                readOnlyHint: true,
                openWorldHint: false,
                destructiveHint: false,
            },
            _meta: { 'ui/resourceUri': 'ui://career-copilot/applications.html' },
        },
        safeTool('get_applications', async ({ include_inactive, page: pageArg }) => {
            const auth = getAuth();
            requireMcpScope(auth, 'applications:read');

            const candidateId = await repository.resolveCandidateId(auth.clerkUserId);
            if (!candidateId) {
                return toolError('No candidate profile found. Create one at applicant.network/portal/profile');
            }

            const page = (pageArg as number | undefined) ?? 1;
            const result = await repository.getApplicationsForCandidate(
                candidateId,
                (include_inactive as boolean | undefined) ?? false,
                page,
            );

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

            const totalPages = Math.ceil(result.total / 10);

            return {
                structuredContent: {
                    applications,
                    pagination: {
                        page,
                        total_pages: totalPages,
                        total_results: result.total,
                    },
                } as unknown as Record<string, unknown>,
                content: [
                    {
                        type: 'text' as const,
                        text: applications.length > 0
                            ? `You have ${result.total} application${result.total !== 1 ? 's' : ''}. Showing page ${page} of ${totalPages}.`
                            : 'No applications found.',
                    },
                ],
            };
        }),
    );
}
