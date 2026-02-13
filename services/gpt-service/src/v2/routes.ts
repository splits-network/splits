import { FastifyInstance } from 'fastify';
import { EventPublisher } from './shared/events';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    // OAuth routes will be registered in Phase 12
    // GPT proxy routes will be registered in Phase 13
}
