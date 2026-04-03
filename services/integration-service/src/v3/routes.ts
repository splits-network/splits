/**
 * V3 Route Registry — Integration Service
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { CryptoService } from '@splits-network/shared-config/src/crypto';
import { IEventPublisher } from '../v2/shared/events.js';
import { registerProviderRoutes } from './providers/routes.js';
import { registerConnectionRoutes } from './connections/routes.js';
import { registerATSIntegrationRoutes } from './ats-integrations/routes.js';
import { registerATSActionRoutes } from './ats-integrations/actions/sync.route.js';
import { registerCalendarWebhookRoutes } from './calendar/webhook-routes.js';
import { registerCalendarRoutes } from './calendar/routes.js';
import { registerCallCalendarRoutes } from './calendar/call-calendar-routes.js';
import { registerEmailRoutes } from './email/routes.js';
import { registerLinkedInRoutes } from './linkedin/routes.js';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  logger?: Logger;
  crypto?: CryptoService;
  webhookBaseUrl?: string;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerProviderRoutes(app, config.supabase);
  registerConnectionRoutes(app, config.supabase, config.eventPublisher, config.logger, config.crypto);
  registerATSIntegrationRoutes(app, config.supabase, config.eventPublisher);

  // Calendar webhook routes require logger, crypto, and eventPublisher
  if (config.eventPublisher && config.logger && config.crypto) {
    registerCalendarWebhookRoutes(app, {
      supabase: config.supabase,
      eventPublisher: config.eventPublisher,
      logger: config.logger,
      crypto: config.crypto,
      webhookBaseUrl: config.webhookBaseUrl || process.env.WEBHOOK_BASE_URL || '',
    });

    // Calendar, email, LinkedIn, call-calendar routes
    registerCalendarRoutes(app, {
      supabase: config.supabase,
      eventPublisher: config.eventPublisher,
      logger: config.logger,
      crypto: config.crypto,
    });

    registerCallCalendarRoutes(app, {
      supabase: config.supabase,
      eventPublisher: config.eventPublisher,
      logger: config.logger,
      crypto: config.crypto,
    });

    registerEmailRoutes(app, {
      supabase: config.supabase,
      eventPublisher: config.eventPublisher,
      logger: config.logger,
      crypto: config.crypto,
    });

    registerLinkedInRoutes(app, {
      supabase: config.supabase,
      eventPublisher: config.eventPublisher,
      logger: config.logger,
      crypto: config.crypto,
    });

    // ATS integration action routes (sync, sync-logs, stats, push-candidate)
    registerATSActionRoutes(app, {
      supabase: config.supabase,
      eventPublisher: config.eventPublisher,
      logger: config.logger,
      crypto: config.crypto,
    });
  }
}
