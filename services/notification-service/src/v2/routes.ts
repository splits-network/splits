import { FastifyInstance } from 'fastify';
import { registerNotificationRoutes } from './notifications/routes';
import { registerTemplateRoutes } from './templates/routes';
import { IEventPublisher } from './shared/events';
import { AdminNotificationRepository } from './admin/repository';
import { AdminNotificationService } from './admin/service';
import { registerAdminNotificationRoutes } from './admin/routes';

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

    // Admin routes (permissive, no access filtering)
    const adminRepository = new AdminNotificationRepository(config.supabaseUrl, config.supabaseKey);
    const adminService = new AdminNotificationService(adminRepository);
    registerAdminNotificationRoutes(app, { adminService });
}
