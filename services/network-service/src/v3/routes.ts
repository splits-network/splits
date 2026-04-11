/**
 * Network Service — V3 Route Registry
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events.js';
import { registerRecruiterRoutes } from './recruiters/routes.js';
import { registerAssignmentRoutes } from './assignments/routes.js';
import { registerRecruiterCandidateRoutes } from './recruiter-candidates/routes.js';
import { registerRecruiterCompanyRoutes } from './recruiter-companies/routes.js';
import { registerReputationRoutes } from './reputation/routes.js';
import { registerCompanyReputationRoutes } from './company-reputation/routes.js';
import { registerRecruiterCodeRoutes } from './recruiter-codes/routes.js';
import { registerFirmRoutes } from './firms/routes.js';
import { registerCompanyInvitationRoutes } from './company-invitations/routes.js';
import { registerPublicCompanyRoutes } from './public-companies/routes.js';
import { registerAdminRoutes } from './admin/routes.js';

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
  registerPublicCompanyRoutes(app, supabase);
  registerAdminRoutes(app, supabase);
}
