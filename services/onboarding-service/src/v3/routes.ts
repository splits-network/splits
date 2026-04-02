/**
 * V3 Route Registry — Onboarding Service
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../shared/events.js';
import { registerBusinessOnboardingRoutes } from './business/routes.js';

interface RegisterV3Config {
    supabase: SupabaseClient;
    eventPublisher?: IEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
    registerBusinessOnboardingRoutes(app, config.supabase, config.eventPublisher);
}
