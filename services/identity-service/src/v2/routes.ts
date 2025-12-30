import { FastifyInstance } from 'fastify';
import { Logger } from '@splits-network/shared-logging';
import { RepositoryV2 } from './repository';
import { EventPublisherV2 } from './shared/events';
import { UserServiceV2 } from './services/user';
import { OrganizationServiceV2 } from './services/organization';
import { MembershipServiceV2 } from './services/membership';
import { InvitationServiceV2 } from './services/invitation';
import { registerUserRoutes } from './users/routes';
import { registerOrganizationRoutes } from './organizations/routes';
import { registerMembershipRoutes } from './memberships/routes';
import { registerInvitationRoutes } from './invitations/routes';

interface IdentityV2Config {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: EventPublisherV2;
    logger: Logger;
}

export async function registerV2Routes(
    app: FastifyInstance,
    config: IdentityV2Config
) {
    const { supabaseUrl, supabaseKey, eventPublisher, logger } = config;
    const repository = new RepositoryV2(supabaseUrl, supabaseKey);
    const userService = new UserServiceV2(repository, eventPublisher, logger);
    const orgService = new OrganizationServiceV2(repository, eventPublisher, logger);
    const membershipService = new MembershipServiceV2(repository, eventPublisher, logger);
    const invitationService = new InvitationServiceV2(repository, eventPublisher, logger);
    const logError = (message: string, error: unknown) => logger.error({ err: error }, message);

    registerUserRoutes(app, { userService, logError });
    registerOrganizationRoutes(app, { organizationService: orgService, logError });
    registerMembershipRoutes(app, { membershipService, logError });
    registerInvitationRoutes(app, { invitationService, logError });
}
