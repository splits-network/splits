import { FastifyInstance } from 'fastify';
import { Logger } from '@splits-network/shared-logging';
import { EventPublisherV2 } from './shared/events';
import { UserRepository } from './users/repository';
import { UserServiceV2 } from './users/service';
import { OrganizationRepository } from './organizations/repository';
import { OrganizationServiceV2 } from './organizations/service';
import { MembershipRepository } from './memberships/repository';
import { MembershipServiceV2 } from './memberships/service';
import { InvitationRepository } from './invitations/repository';
import { InvitationServiceV2 } from './invitations/service';
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
    const userRepository = new UserRepository(supabaseUrl, supabaseKey);
    const orgRepository = new OrganizationRepository(supabaseUrl, supabaseKey);
    const membershipRepository = new MembershipRepository(supabaseUrl, supabaseKey);
    const invitationRepository = new InvitationRepository(supabaseUrl, supabaseKey);

    const userService = new UserServiceV2(userRepository, eventPublisher, logger);
    const orgService = new OrganizationServiceV2(orgRepository, eventPublisher, logger);
    const membershipService = new MembershipServiceV2(membershipRepository, eventPublisher, logger);
    const invitationService = new InvitationServiceV2(invitationRepository, eventPublisher, logger);
    const logError = (message: string, error: unknown) => logger.error({ err: error }, message);

    registerUserRoutes(app, { userService, logError });
    registerOrganizationRoutes(app, { organizationService: orgService, logError });
    registerMembershipRoutes(app, { membershipService, logError });
    registerInvitationRoutes(app, { invitationService, logError });
}
