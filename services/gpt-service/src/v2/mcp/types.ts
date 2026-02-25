/**
 * MCP Server Types
 *
 * Shared types and dependencies for the MCP server implementation.
 */

import { GptActionRepository } from '../actions/repository';
import { OAuthService } from '../oauth/oauth-service';
import { IEventPublisher } from '../shared/events';
import { FastifyBaseLogger } from 'fastify';

/**
 * Dependencies injected into the MCP server and tool handlers.
 */
export interface McpServerDeps {
    repository: GptActionRepository;
    oauthService: OAuthService;
    eventPublisher?: IEventPublisher;
    logger: FastifyBaseLogger;
}

/**
 * Auth context extracted from MCP request headers.
 * Populated by auth middleware before tool execution.
 */
export interface McpAuthContext {
    clerkUserId: string;
    sessionId: string;
    scopes: string[];
}

/**
 * Tool handler extra context — extends MCP SDK's RequestHandlerExtra
 * with our auth context attached via the transport layer.
 */
export interface McpToolExtra {
    authContext: McpAuthContext;
}

/**
 * Helper to create a tool error result (isError: true).
 */
export function toolError(message: string) {
    return {
        isError: true as const,
        content: [{ type: 'text' as const, text: message }],
    };
}

/**
 * Helper to create a text content result.
 */
export function toolText(text: string) {
    return {
        content: [{ type: 'text' as const, text }],
    };
}
