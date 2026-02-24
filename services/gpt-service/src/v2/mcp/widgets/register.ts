/**
 * Widget Registration
 *
 * Registers all HTML widget resources with the MCP server.
 * Widgets are loaded from disk at startup for zero build-pipeline overhead.
 *
 * Uses the base SDK's registerResource() directly to avoid ext-apps
 * subpath import issues with CommonJS moduleResolution.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/** MCP Apps MIME type for HTML widgets rendered in sandboxed iframes. */
const RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';

const WIDGETS_DIR = join(__dirname, '..', '..', '..', 'src', 'v2', 'mcp', 'widgets');

interface WidgetDef {
    name: string;
    uri: string;
    description: string;
    filename: string;
}

const WIDGET_DEFS: WidgetDef[] = [
    {
        name: 'Job Search Results',
        uri: 'ui://career-copilot/job-search.html',
        description: 'Interactive job search results with cards and pagination',
        filename: 'job-search.html',
    },
    {
        name: 'Job Detail',
        uri: 'ui://career-copilot/job-detail.html',
        description: 'Full job listing view with company info and requirements',
        filename: 'job-detail.html',
    },
    {
        name: 'My Applications',
        uri: 'ui://career-copilot/applications.html',
        description: 'Application status cards with color-coded badges',
        filename: 'applications.html',
    },
    {
        name: 'Application Submit',
        uri: 'ui://career-copilot/application-submit.html',
        description: 'Application confirmation and submission flow',
        filename: 'application-submit.html',
    },
    {
        name: 'Resume Analysis',
        uri: 'ui://career-copilot/resume-analysis.html',
        description: 'Resume fit analysis with score, strengths, and gaps',
        filename: 'resume-analysis.html',
    },
];

/**
 * Load widget HTML from source directory.
 * Falls back to dist directory if source not found (production builds).
 */
function loadWidget(filename: string): string {
    try {
        return readFileSync(join(WIDGETS_DIR, filename), 'utf-8');
    } catch {
        // Fallback to dist location
        const distDir = join(__dirname, 'widgets');
        return readFileSync(join(distDir, filename), 'utf-8');
    }
}

/**
 * Register all widget resources with the MCP server.
 */
export function registerWidgets(server: McpServer) {
    for (const widget of WIDGET_DEFS) {
        const html = loadWidget(widget.filename);

        server.resource(
            widget.name,
            widget.uri,
            { description: widget.description, mimeType: RESOURCE_MIME_TYPE },
            async () => ({
                contents: [
                    {
                        uri: widget.uri,
                        mimeType: RESOURCE_MIME_TYPE,
                        text: html,
                    },
                ],
            }),
        );
    }
}
