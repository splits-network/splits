import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from './shared/events.js';
import { UserRepository } from './users/repository.js';
import { UserServiceV2 } from './users/service.js';
import { OrganizationRepository } from './organizations/repository.js';
import { OrganizationServiceV2 } from './organizations/service.js';
import { UserRoleRepository } from './user-roles/repository.js';
import { UserRoleServiceV2 } from './user-roles/service.js';
import { MembershipRepository } from './memberships/repository.js';
import { MembershipServiceV2 } from './memberships/service.js';
import { InvitationRepository } from './invitations/repository.js';
import { InvitationServiceV2 } from './invitations/service.js';
import { ConsentRepository } from './consent/repository.js';
import { ConsentServiceV2 } from './consent/service.js';
import { WebhookRepositoryV2 } from './webhooks/repository.js';
import { WebhooksServiceV2 } from './webhooks/service.js';
import { registerUserRoutes } from './users/routes.js';
import { registerOrganizationRoutes } from './organizations/routes.js';
import { registerUserRoleRoutes } from './user-roles/routes.js';
import { registerMembershipRoutes } from './memberships/routes.js';
import { registerInvitationRoutes } from './invitations/routes.js';
import { registerConsentRoutes } from './consent/routes.js';
import { webhooksRoutesV2 } from './webhooks/routes.js';
import { resolveAccessContext } from './shared/access.js';
import { AdminIdentityRepository } from './admin/repository.js';
import { AdminIdentityService } from './admin/service.js';
import { registerAdminIdentityRoutes } from './admin/routes.js';

interface IdentityV2Config {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: IEventPublisher;
    logger: Logger;
}

export async function registerV2Routes(
    app: FastifyInstance,
    config: IdentityV2Config
) {
    const { supabaseUrl, supabaseKey, eventPublisher, logger } = config;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const accessResolver = (clerkUserId: string) => resolveAccessContext(supabase, clerkUserId);
    const userRepository = new UserRepository(supabaseUrl, supabaseKey);
    const orgRepository = new OrganizationRepository(supabaseUrl, supabaseKey);
    const userRoleRepository = new UserRoleRepository(supabaseUrl, supabaseKey);
    const membershipRepository = new MembershipRepository(supabaseUrl, supabaseKey);
    const invitationRepository = new InvitationRepository(supabaseUrl, supabaseKey);
    const consentRepository = new ConsentRepository(supabaseUrl, supabaseKey);
    const webhookRepository = new WebhookRepositoryV2(supabaseUrl, supabaseKey);

    const userService = new UserServiceV2(userRepository, eventPublisher, logger, accessResolver);
    const orgService = new OrganizationServiceV2(orgRepository, eventPublisher, logger, accessResolver);
    const userRoleService = new UserRoleServiceV2(
        userRoleRepository,
        eventPublisher,
        logger,
        accessResolver
    );
    const membershipService = new MembershipServiceV2(
        membershipRepository,
        eventPublisher,
        logger,
        accessResolver
    );
    const invitationService = new InvitationServiceV2(
        invitationRepository,
        userRepository,
        eventPublisher,
        logger,
        accessResolver,
        membershipRepository
    );
    const consentService = new ConsentServiceV2(consentRepository, accessResolver);
    const webhookService = new WebhooksServiceV2(webhookRepository, eventPublisher);
    const logError = (message: string, error: unknown) => logger.error({ err: error }, message);
    const logInfo = (message: string) => logger.info(message);

    registerUserRoutes(app, { userService, logError, logInfo });
    registerOrganizationRoutes(app, { organizationService: orgService, logError });
    registerUserRoleRoutes(app, { userRoleService, logError });
    registerMembershipRoutes(app, { membershipService, logError });
    registerInvitationRoutes(app, { invitationService, logError });
    registerConsentRoutes(app, { consentService, logError });
    await webhooksRoutesV2(app, webhookService);

    // Admin routes (permissive, no access filtering)
    const adminRepository = new AdminIdentityRepository(supabaseUrl, supabaseKey);
    const adminService = new AdminIdentityService(adminRepository);
    registerAdminIdentityRoutes(app, { adminService });
}
