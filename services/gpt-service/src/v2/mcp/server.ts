/**
 * MCP Server Factory
 *
 * Creates and configures the McpServer with all tools and resources.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServerDeps, McpAuthContext } from './types.js';
import { registerSearchJobsTool } from './tools/search-jobs.js';
import { registerGetJobDetailTool } from './tools/get-job-detail.js';
import { registerGetApplicationsTool } from './tools/get-applications.js';
import { registerSubmitApplicationTool } from './tools/submit-application.js';
import { registerAnalyzeResumeTool } from './tools/resume-analyze.js';
import { registerWidgets } from './widgets/register.js';

/**
 * Create a configured MCP server instance.
 *
 * Auth context is set per-request via the returned setAuth callback,
 * which the transport layer calls after validating the Bearer token.
 */
export function createMcpServer(deps: McpServerDeps) {
    const server = new McpServer(
        {
            name: 'Career Copilot',
            version: '1.0.0',
        },
        {
            capabilities: {
                tools: {},
                resources: {},
            },
        },
    );

    // Per-request auth context — set by transport before tool execution
    let currentAuth: McpAuthContext | null = null;

    const getAuth = (): McpAuthContext => {
        if (!currentAuth) {
            throw new Error('No auth context available. Ensure the request is authenticated.');
        }
        return currentAuth;
    };

    const setAuth = (auth: McpAuthContext) => {
        currentAuth = auth;
    };

    // Register all tools
    registerSearchJobsTool(server, deps.repository, getAuth);
    registerGetJobDetailTool(server, deps.repository, getAuth);
    registerGetApplicationsTool(server, deps.repository, getAuth);
    registerSubmitApplicationTool(server, deps.repository, getAuth, deps.eventPublisher);
    registerAnalyzeResumeTool(server, deps.repository, getAuth, deps.eventPublisher);

    // Register UI widgets
    registerWidgets(server);

    return { server, setAuth };
}
