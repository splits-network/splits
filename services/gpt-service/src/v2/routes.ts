import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { GptConfig } from '@splits-network/shared-config';
import { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from './shared/events.js';
import { registerOAuthRoutes } from './oauth/routes.js';
import { registerWebhookRoutes } from './oauth/webhook-handler.js';
import { OAuthService } from './oauth/oauth-service.js';
import { GptActionRepository } from './actions/repository.js';
import { registerActionRoutes } from './actions/routes.js';
import { registerOpenapiRoute } from '../openapi-route.js';
import { registerMcpRoutes } from './mcp/transport.js';
import { registerWellKnownRoutes } from './mcp/well-known.js';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    gptConfig: GptConfig;
    eventPublisher?: IEventPublisher;
    actionRepository?: GptActionRepository;
    clerkWebhookSecret?: string;
}

export function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    const { supabaseUrl, supabaseKey, gptConfig, eventPublisher, clerkWebhookSecret } = config;

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Instantiate OAuthService
    const oauthService = new OAuthService(
        supabase,
        gptConfig,
        eventPublisher!,
        app.log as Logger
    );

    // Instantiate GptActionRepository
    const actionRepository = new GptActionRepository(supabaseUrl, supabaseKey);

    // Register OAuth routes
    registerOAuthRoutes(app, { oauthService });

    // Register webhook routes
    registerWebhookRoutes(app, { oauthService, logger: app.log as Logger, clerkWebhookSecret });

    // Register GPT Action routes
    registerActionRoutes(app, { repository: actionRepository, oauthService, eventPublisher });

    // Register OpenAPI schema routes
    registerOpenapiRoute(app);

    // Register MCP (ChatGPT App) routes
    registerMcpRoutes(app, {
        repository: actionRepository,
        oauthService,
        eventPublisher,
        logger: app.log,
    });

    // Register OAuth 2.1 well-known endpoints for MCP
    registerWellKnownRoutes(app, { gptConfig });
}
