/**
 * Consumer Factory
 *
 * Instantiates all domain-specific event consumers with their dependencies.
 * Extracted from the domain consumer constructor to keep file sizes manageable.
 */

import { Logger } from '@splits-network/shared-logging';
import { NotificationService } from '../../service.js';
import { NotificationRepository } from '../../repository.js';
import { ContactLookupHelper } from '../../helpers/contact-lookup.js';
import { DataLookupHelper } from '../../helpers/data-lookup.js';
import { CallInAppNotificationService } from '../../services/calls/in-app-service.js';
import { DomainConsumers } from './event-router.js';

import { ApplicationsEventConsumer } from '../../consumers/applications/consumer.js';
import { PlacementsEventConsumer } from '../../consumers/placements/consumer.js';
import { CandidatesEventConsumer } from '../../consumers/candidates/consumer.js';
import { CollaborationEventConsumer } from '../../consumers/collaboration/consumer.js';
import { InvitationsConsumer } from '../../consumers/invitations/consumer.js';
import { CompanyInvitationsConsumer } from '../../consumers/company-invitations/consumer.js';
import { RecruiterCompanyInvitationsConsumer } from '../../consumers/recruiter-company-invitations/consumer.js';
import { FirmInvitationsConsumer } from '../../consumers/firm-invitations/consumer.js';
import { RecruiterSubmissionEventConsumer } from '../../consumers/recruiter-submission/consumer.js';
import { SupportEventConsumer } from '../../consumers/support/consumer.js';
import { ChatEventConsumer } from '../../consumers/chat/consumer.js';
import { BillingEventConsumer } from '../../consumers/billing/consumer.js';
import { ReputationEventConsumer } from '../../consumers/reputation/consumer.js';
import { HealthEventConsumer } from '../../consumers/health/consumer.js';
import { OnboardingEventConsumer } from '../../consumers/onboarding/consumer.js';
import { JobsEventConsumer } from '../../consumers/jobs/consumer.js';
import { RelationshipsEventConsumer } from '../../consumers/relationships/consumer.js';
import { SecurityEventConsumer } from '../../consumers/security/consumer.js';
import { RecruiterCodesEventConsumer } from '../../consumers/recruiter-codes/consumer.js';
import { DocumentsEventConsumer } from '../../consumers/documents/consumer.js';
import { GamificationEventConsumer } from '../../consumers/gamification/consumer.js';
import { MatchesEventConsumer } from '../../consumers/matches/consumer.js';
import { CallsEventConsumer } from '../../consumers/calls/consumer.js';

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
