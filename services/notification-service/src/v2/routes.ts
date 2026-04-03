import { FastifyInstance } from 'fastify';
import { registerNotificationRoutes } from './notifications/routes.js';
import { registerTemplateRoutes } from './templates/routes.js';
import { registerPreferenceRoutes } from './preferences/routes.js';
import { IEventPublisher } from './shared/events.js';
import { AdminNotificationRepository } from './admin/repository.js';
import { AdminNotificationService } from './admin/service.js';
import { registerAdminNotificationRoutes } from './admin/routes.js';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    await registerNotificationRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
    });

    await registerTemplateRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
    });

    await registerPreferenceRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
    });

    // Admin routes (permissive, no access filtering)
    const adminRepository = new AdminNotificationRepository(config.supabaseUrl, config.supabaseKey);
    const adminService = new AdminNotificationService(adminRepository);
    registerAdminNotificationRoutes(app, { adminService });
}
