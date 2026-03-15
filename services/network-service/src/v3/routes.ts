/**
 * Network Service — V3 Route Registry
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { registerRecruiterRoutes } from './recruiters/routes';
import { registerAssignmentRoutes } from './assignments/routes';
import { registerRecruiterCandidateRoutes } from './recruiter-candidates/routes';
import { registerRecruiterCompanyRoutes } from './recruiter-companies/routes';
import { registerReputationRoutes } from './reputation/routes';
import { registerCompanyReputationRoutes } from './company-reputation/routes';
import { registerRecruiterCodeRoutes } from './recruiter-codes/routes';
import { registerFirmRoutes } from './firms/routes';
import { registerCompanyInvitationRoutes } from './company-invitations/routes';
import { registerAdminRoutes } from './admin/routes';

export function registerV3Routes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  registerRecruiterRoutes(app, supabase, eventPublisher);
  registerAssignmentRoutes(app, supabase, eventPublisher);
  registerRecruiterCandidateRoutes(app, supabase, eventPublisher);
  registerRecruiterCompanyRoutes(app, supabase, eventPublisher);
  registerReputationRoutes(app, supabase, eventPublisher);
  registerCompanyReputationRoutes(app, supabase);
  registerRecruiterCodeRoutes(app, supabase, eventPublisher);
  registerFirmRoutes(app, supabase, eventPublisher);
  registerCompanyInvitationRoutes(app, supabase, eventPublisher);
  registerAdminRoutes(app, supabase);
}
