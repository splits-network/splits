/**
 * V3 Route Registry — ATS Service
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched — both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events.js';
import type { IAiClient } from '@splits-network/shared-ai-client';
import { registerJobRoutes } from './jobs/routes.js';
import { registerJobRequirementRoutes } from './job-requirements/routes.js';
import { registerJobSkillRoutes } from './job-skills/routes.js';
import { registerSavedJobRoutes } from './saved-jobs/routes.js';
import { registerRecruiterSavedJobRoutes } from './recruiter-saved-jobs/routes.js';
import { registerRecruiterSavedCandidateRoutes } from './recruiter-saved-candidates/routes.js';
import { registerCompanySourcerRoutes } from './company-sourcers/routes.js';
import { registerCandidateSourcerRoutes } from './candidate-sourcers/routes.js';
import { registerJobRecommendationRoutes } from './job-recommendations/routes.js';
import { registerApplicationNoteRoutes } from './application-notes/routes.js';
import { registerCandidateRoutes } from './candidates/routes.js';
import { registerCompanyRoutes } from './companies/routes.js';
import { registerApplicationRoutes } from './applications/routes.js';
import { registerPlacementRoutes } from './placements/routes.js';
import { registerPreScreenRoutes } from './pre-screen/routes.js';
import { registerSkillRoutes } from './skills/routes.js';
import { registerCandidateSkillRoutes } from './candidate-skills/routes.js';
import { registerCompanySkillRoutes } from './company-skills/routes.js';
import { registerPerkRoutes } from './perks/routes.js';
import { registerCompanyPerkRoutes } from './company-perks/routes.js';
import { registerCultureTagRoutes } from './culture-tags/routes.js';
import { registerCompanyCultureTagRoutes } from './company-culture-tags/routes.js';
import { registerPreScreenTemplateRoutes } from './pre-screen-templates/routes.js';
import { registerAdminRoutes } from './admin/routes.js';
import { registerSmartResumeProfileRoutes } from './smart-resume-profiles/routes.js';
import { registerSmartResumeExperienceRoutes } from './smart-resume-experiences/routes.js';
import { registerSmartResumeProjectRoutes } from './smart-resume-projects/routes.js';
import { registerSmartResumeTaskRoutes } from './smart-resume-tasks/routes.js';
import { registerSmartResumeEducationRoutes } from './smart-resume-education/routes.js';
import { registerSmartResumeCertificationRoutes } from './smart-resume-certifications/routes.js';
import { registerSmartResumeSkillRoutes } from './smart-resume-skills/routes.js';
import { registerSmartResumePublicationRoutes } from './smart-resume-publications/routes.js';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  aiClient?: IAiClient;
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
  registerPreScreenTemplateRoutes(app, config.supabase);
  registerAdminRoutes(app, config.supabase);

  // Smart Resume
  registerSmartResumeProfileRoutes(app, config.supabase, config.eventPublisher, config.aiClient);
  registerSmartResumeExperienceRoutes(app, config.supabase, config.eventPublisher);
  registerSmartResumeProjectRoutes(app, config.supabase, config.eventPublisher);
  registerSmartResumeTaskRoutes(app, config.supabase, config.eventPublisher);
  registerSmartResumeEducationRoutes(app, config.supabase, config.eventPublisher);
  registerSmartResumeCertificationRoutes(app, config.supabase, config.eventPublisher);
  registerSmartResumeSkillRoutes(app, config.supabase, config.eventPublisher);
  registerSmartResumePublicationRoutes(app, config.supabase, config.eventPublisher);
}
