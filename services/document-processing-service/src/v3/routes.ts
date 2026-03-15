/**
 * V3 Route Registry — Document Processing Service
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { registerDocumentRoutes } from './documents/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerDocumentRoutes(app, config.supabase);
}
