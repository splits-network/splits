import { FastifyInstance } from 'fastify';
import { registerFraudRoutes } from './fraud-signals/routes.js';
import { registerRuleRoutes } from './rules/routes.js';
import { registerMetricRoutes } from './metrics/routes.js';
import { registerExecutionRoutes } from './executions/routes.js';
import { IEventPublisher } from './shared/events.js';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    await registerFraudRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
    });

    await registerRuleRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
    });

    await registerMetricRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
    });

    await registerExecutionRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
    });
}
