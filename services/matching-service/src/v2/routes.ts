import { FastifyInstance } from 'fastify';
import { registerMatchRoutes } from './matches/routes';
import { IEventPublisher } from './shared/events';
import { Logger } from '@splits-network/shared-logging';
import { MatchingOrchestrator } from './matches/matching-orchestrator';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
    logger: Logger;
    orchestrator: MatchingOrchestrator;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    await registerMatchRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        orchestrator: config.orchestrator,
    });
}
