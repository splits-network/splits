/**
 * Video Service V3 Route Registry
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { registerCallRecordingRoutes } from './call-recordings/routes';

export function registerV3Routes(app: FastifyInstance, supabase: SupabaseClient) {
  registerCallRecordingRoutes(app, supabase);
}
