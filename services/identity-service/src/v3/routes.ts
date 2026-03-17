/**
 * V3 Route Registry — Identity Service
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched — both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { registerUserRoutes } from './users/routes';
import { registerOrganizationRoutes } from './organizations/routes';
import { registerMembershipRoutes } from './memberships/routes';
import { registerUserRoleRoutes } from './user-roles/routes';
import { registerInvitationRoutes } from './invitations/routes';
import { registerConsentRoutes } from './consent/routes';
import { registerWebhookRoutes } from './webhooks/routes';
import { registerAdminRoutes } from './admin/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerUserRoutes(app, config.supabase, config.eventPublisher);
  registerOrganizationRoutes(app, config.supabase, config.eventPublisher);
  registerMembershipRoutes(app, config.supabase, config.eventPublisher);
  registerUserRoleRoutes(app, config.supabase, config.eventPublisher);
  registerInvitationRoutes(app, config.supabase, config.eventPublisher);
  registerConsentRoutes(app, config.supabase);
  registerWebhookRoutes(app, config.supabase, config.eventPublisher);
  registerAdminRoutes(app, config.supabase);
}
