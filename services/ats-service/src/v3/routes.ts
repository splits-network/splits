/**
 * V3 Route Registry — ATS Service
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched — both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { registerJobRoutes } from './jobs/routes';
import { registerJobRequirementRoutes } from './job-requirements/routes';
import { registerJobSkillRoutes } from './job-skills/routes';
import { registerSavedJobRoutes } from './saved-jobs/routes';
import { registerRecruiterSavedJobRoutes } from './recruiter-saved-jobs/routes';
import { registerRecruiterSavedCandidateRoutes } from './recruiter-saved-candidates/routes';
import { registerCompanySourcerRoutes } from './company-sourcers/routes';
import { registerCandidateSourcerRoutes } from './candidate-sourcers/routes';
import { registerJobRecommendationRoutes } from './job-recommendations/routes';
import { registerApplicationNoteRoutes } from './application-notes/routes';
import { registerCandidateRoutes } from './candidates/routes';
import { registerCompanyRoutes } from './companies/routes';
import { registerApplicationRoutes } from './applications/routes';
import { registerPlacementRoutes } from './placements/routes';
import { registerPreScreenRoutes } from './pre-screen/routes';
import { registerSkillRoutes } from './skills/routes';
import { registerCandidateSkillRoutes } from './candidate-skills/routes';
import { registerCompanySkillRoutes } from './company-skills/routes';
import { registerPerkRoutes } from './perks/routes';
import { registerCompanyPerkRoutes } from './company-perks/routes';
import { registerCultureTagRoutes } from './culture-tags/routes';
import { registerCompanyCultureTagRoutes } from './company-culture-tags/routes';
import { registerAdminRoutes } from './admin/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerJobRoutes(app, config.supabase, config.eventPublisher);
  registerJobRequirementRoutes(app, config.supabase);
  registerJobSkillRoutes(app, config.supabase);
  registerSavedJobRoutes(app, config.supabase, config.eventPublisher);
  registerRecruiterSavedJobRoutes(app, config.supabase, config.eventPublisher);
  registerRecruiterSavedCandidateRoutes(app, config.supabase, config.eventPublisher);
  registerCompanySourcerRoutes(app, config.supabase, config.eventPublisher);
  registerCandidateSourcerRoutes(app, config.supabase, config.eventPublisher);
  registerJobRecommendationRoutes(app, config.supabase, config.eventPublisher);
  registerApplicationNoteRoutes(app, config.supabase, config.eventPublisher);
  registerCandidateRoutes(app, config.supabase, config.eventPublisher);
  registerCompanyRoutes(app, config.supabase, config.eventPublisher);
  registerApplicationRoutes(app, config.supabase, config.eventPublisher);
  registerPlacementRoutes(app, config.supabase, config.eventPublisher);
  registerPreScreenRoutes(app, config.supabase, config.eventPublisher);
  registerSkillRoutes(app, config.supabase);
  registerCandidateSkillRoutes(app, config.supabase);
  registerCompanySkillRoutes(app, config.supabase);
  registerPerkRoutes(app, config.supabase);
  registerCompanyPerkRoutes(app, config.supabase);
  registerCultureTagRoutes(app, config.supabase);
  registerCompanyCultureTagRoutes(app, config.supabase);
  registerAdminRoutes(app, config.supabase);
}
