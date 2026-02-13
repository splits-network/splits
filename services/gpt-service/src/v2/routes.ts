import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { GptConfig } from '@splits-network/shared-config';
import { Logger } from '@splits-network/shared-logging';
import { EventPublisher } from './shared/events';
import { registerOAuthRoutes } from './oauth/routes';
import { registerWebhookRoutes } from './oauth/webhook-handler';
import { OAuthService } from './oauth/oauth-service';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    gptConfig: GptConfig;
    eventPublisher?: EventPublisher;
}

export function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    const { supabaseUrl, supabaseKey, gptConfig, eventPublisher } = config;

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Instantiate OAuthService
    const oauthService = new OAuthService(
        supabase,
        gptConfig,
        eventPublisher!,
        app.log as Logger
    );

    // Register OAuth routes
    registerOAuthRoutes(app, { oauthService });

    // Register webhook routes
    registerWebhookRoutes(app, { oauthService, logger: app.log as Logger });

    // GPT proxy routes will be registered in Phase 13
}
