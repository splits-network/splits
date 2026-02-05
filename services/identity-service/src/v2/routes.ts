import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
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
import { ConsentRepository } from './consent/repository';
import { ConsentServiceV2 } from './consent/service';
import { WebhookRepositoryV2 } from './webhooks/repository';
import { WebhooksServiceV2 } from './webhooks/service';
import { registerUserRoutes } from './users/routes';
import { registerOrganizationRoutes } from './organizations/routes';
import { registerMembershipRoutes } from './memberships/routes';
import { registerInvitationRoutes } from './invitations/routes';
import { registerConsentRoutes } from './consent/routes';
import { webhooksRoutesV2 } from './webhooks/routes';
import { resolveAccessContext } from './shared/access';

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
    const supabase = createClient(supabaseUrl, supabaseKey);
    const accessResolver = (clerkUserId: string) => resolveAccessContext(supabase, clerkUserId);
    const userRepository = new UserRepository(supabaseUrl, supabaseKey);
    const orgRepository = new OrganizationRepository(supabaseUrl, supabaseKey);
    const membershipRepository = new MembershipRepository(supabaseUrl, supabaseKey);
    const invitationRepository = new InvitationRepository(supabaseUrl, supabaseKey);
    const consentRepository = new ConsentRepository(supabaseUrl, supabaseKey);
    const webhookRepository = new WebhookRepositoryV2(supabaseUrl, supabaseKey);

    const userService = new UserServiceV2(userRepository, eventPublisher, logger, accessResolver);
    const orgService = new OrganizationServiceV2(orgRepository, eventPublisher, logger, accessResolver);
    const membershipService = new MembershipServiceV2(
        membershipRepository,
        eventPublisher,
        logger,
        accessResolver
    );
    const invitationService = new InvitationServiceV2(
        invitationRepository,
        userRepository,
        membershipRepository,
        eventPublisher,
        logger,
        accessResolver
    );
    const consentService = new ConsentServiceV2(consentRepository, accessResolver);
    const webhookService = new WebhooksServiceV2(webhookRepository, eventPublisher);
    const logError = (message: string, error: unknown) => logger.error({ err: error }, message);
    const logInfo = (message: string) => logger.info(message);

    registerUserRoutes(app, { userService, logError, logInfo });
    registerOrganizationRoutes(app, { organizationService: orgService, logError });
    registerMembershipRoutes(app, { membershipService, logError });
    registerInvitationRoutes(app, { invitationService, logError });
    registerConsentRoutes(app, { consentService, logError });
    await webhooksRoutesV2(app, webhookService);
}
