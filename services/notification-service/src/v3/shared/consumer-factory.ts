/**
 * Consumer Factory
 *
 * Instantiates all domain-specific event consumers with their dependencies.
 * Extracted from the domain consumer constructor to keep file sizes manageable.
 */

import { Logger } from '@splits-network/shared-logging';
import { NotificationService } from '../../service';
import { NotificationRepository } from '../../repository';
import { ContactLookupHelper } from '../../helpers/contact-lookup';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { CallInAppNotificationService } from '../../services/calls/in-app-service';
import { DomainConsumers } from './event-router';

import { ApplicationsEventConsumer } from '../../consumers/applications/consumer';
import { PlacementsEventConsumer } from '../../consumers/placements/consumer';
import { CandidatesEventConsumer } from '../../consumers/candidates/consumer';
import { CollaborationEventConsumer } from '../../consumers/collaboration/consumer';
import { InvitationsConsumer } from '../../consumers/invitations/consumer';
import { CompanyInvitationsConsumer } from '../../consumers/company-invitations/consumer';
import { RecruiterCompanyInvitationsConsumer } from '../../consumers/recruiter-company-invitations/consumer';
import { FirmInvitationsConsumer } from '../../consumers/firm-invitations/consumer';
import { RecruiterSubmissionEventConsumer } from '../../consumers/recruiter-submission/consumer';
import { SupportEventConsumer } from '../../consumers/support/consumer';
import { ChatEventConsumer } from '../../consumers/chat/consumer';
import { BillingEventConsumer } from '../../consumers/billing/consumer';
import { ReputationEventConsumer } from '../../consumers/reputation/consumer';
import { HealthEventConsumer } from '../../consumers/health/consumer';
import { OnboardingEventConsumer } from '../../consumers/onboarding/consumer';
import { JobsEventConsumer } from '../../consumers/jobs/consumer';
import { RelationshipsEventConsumer } from '../../consumers/relationships/consumer';
import { SecurityEventConsumer } from '../../consumers/security/consumer';
import { RecruiterCodesEventConsumer } from '../../consumers/recruiter-codes/consumer';
import { DocumentsEventConsumer } from '../../consumers/documents/consumer';
import { GamificationEventConsumer } from '../../consumers/gamification/consumer';
import { MatchesEventConsumer } from '../../consumers/matches/consumer';
import { CallsEventConsumer } from '../../consumers/calls/consumer';

interface ConsumerFactoryDeps {
    notificationService: NotificationService;
    repository: NotificationRepository;
    logger: Logger;
    portalUrl: string;
    candidateWebsiteUrl: string;
}

export function createDomainConsumers(deps: ConsumerFactoryDeps): DomainConsumers {
    const { notificationService, repository, logger, portalUrl, candidateWebsiteUrl } = deps;

    const dataLookup = new DataLookupHelper(repository.supabaseClient, logger);
    const contactLookup = new ContactLookupHelper(repository.supabaseClient, logger);

    const callInAppService = new CallInAppNotificationService(
        repository, logger, portalUrl, candidateWebsiteUrl,
    );

    return {
        applications: new ApplicationsEventConsumer(
            notificationService.applications, logger, dataLookup, contactLookup,
        ),
        placements: new PlacementsEventConsumer(
            notificationService.placements, logger, dataLookup, contactLookup,
        ),
        candidates: new CandidatesEventConsumer(
            notificationService.candidates, repository, logger, dataLookup, contactLookup,
        ),
        collaboration: new CollaborationEventConsumer(
            notificationService.collaboration, logger, dataLookup, contactLookup,
        ),
        invitations: new InvitationsConsumer(
            notificationService, logger, portalUrl, candidateWebsiteUrl, dataLookup, contactLookup,
        ),
        companyInvitations: new CompanyInvitationsConsumer(
            notificationService, logger, portalUrl, dataLookup, contactLookup,
        ),
        recruiterCompanyInvitations: new RecruiterCompanyInvitationsConsumer(
            notificationService, logger, portalUrl, dataLookup, contactLookup,
        ),
        firmInvitations: new FirmInvitationsConsumer(
            notificationService, logger, portalUrl, dataLookup, contactLookup,
        ),
        recruiterSubmission: new RecruiterSubmissionEventConsumer(
            notificationService.recruiterSubmission, logger, portalUrl, dataLookup, contactLookup,
        ),
        support: new SupportEventConsumer(notificationService.support, logger),
        chat: new ChatEventConsumer(
            notificationService, repository, contactLookup, logger, portalUrl, candidateWebsiteUrl,
        ),
        billing: new BillingEventConsumer(
            notificationService.billing, logger, portalUrl, contactLookup, dataLookup,
        ),
        reputation: new ReputationEventConsumer(
            notificationService.reputation, logger, portalUrl, contactLookup, dataLookup,
        ),
        health: new HealthEventConsumer(notificationService.health, logger, portalUrl),
        onboarding: new OnboardingEventConsumer(
            notificationService.onboarding, logger, portalUrl, contactLookup,
        ),
        jobs: new JobsEventConsumer(
            notificationService.jobs, logger, portalUrl, contactLookup, dataLookup,
        ),
        relationships: new RelationshipsEventConsumer(
            notificationService.relationships, logger, portalUrl, candidateWebsiteUrl, contactLookup, dataLookup,
        ),
        security: new SecurityEventConsumer(
            notificationService.security, logger, process.env.OPS_EMAIL || 'ops@splits.network',
        ),
        recruiterCodes: new RecruiterCodesEventConsumer(
            notificationService.recruiterCodes, logger, portalUrl, contactLookup, dataLookup,
        ),
        documents: new DocumentsEventConsumer(
            notificationService.documents, logger, portalUrl, contactLookup, dataLookup,
        ),
        gamification: new GamificationEventConsumer(logger, contactLookup, dataLookup),
        matches: new MatchesEventConsumer(
            notificationService.matches, logger, portalUrl, candidateWebsiteUrl, contactLookup, dataLookup,
        ),
        calls: new CallsEventConsumer(
            notificationService.calls, callInAppService, logger,
            portalUrl, candidateWebsiteUrl, contactLookup, dataLookup,
        ),
    };
}
