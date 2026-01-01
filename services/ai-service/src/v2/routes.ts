/**
 * V2 Routes Registration
 */

import { FastifyInstance } from 'fastify';
import { AIReviewRepository } from './reviews/repository';
import { AIReviewServiceV2 } from './reviews/service';
import { EventPublisher } from './shared/events';
import { registerAIReviewRoutes } from './reviews/routes';
import { Logger } from '@splits-network/shared-logging';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
    logger: Logger;
}

export function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    const reviewRepository = new AIReviewRepository(config.supabaseUrl, config.supabaseKey);
    const reviewService = new AIReviewServiceV2(reviewRepository, config.eventPublisher, config.logger);

    registerAIReviewRoutes(app, { service: reviewService });
}
