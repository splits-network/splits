import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { GptConfig } from '@splits-network/shared-config';
import { Logger } from '@splits-network/shared-logging';
import { EventPublisher } from './shared/events';
import { registerOAuthRoutes } from './oauth/routes';
import { registerWebhookRoutes } from './oauth/webhook-handler';
import { OAuthService } from './oauth/oauth-service';
import { GptActionRepository } from './actions/repository';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    gptConfig: GptConfig;
    eventPublisher?: EventPublisher;
    actionRepository?: GptActionRepository;
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

    // Instantiate GptActionRepository
    const actionRepository = new GptActionRepository(supabaseUrl, supabaseKey);

    // Register OAuth routes
    registerOAuthRoutes(app, { oauthService });

    // Register webhook routes
    registerWebhookRoutes(app, { oauthService, logger: app.log as Logger });

    // GPT Action routes will be registered in Plans 02-04
    // actionRepository is ready for use in those plans
}
