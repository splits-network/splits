import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ServiceRegistry } from './clients';
import { NotificationService } from './service';
import { NotificationRepository } from './repository';
import { ApplicationsEventConsumer } from './consumers/applications/consumer';
import { PlacementsEventConsumer } from './consumers/placements/consumer';
import { CandidatesEventConsumer } from './consumers/candidates/consumer';
import { CollaborationEventConsumer } from './consumers/collaboration/consumer';
import { InvitationsConsumer } from './consumers/invitations/consumer';
import { CompanyInvitationsConsumer } from './consumers/company-invitations/consumer';
import { RecruiterCompanyInvitationsConsumer } from './consumers/recruiter-company-invitations/consumer';
import { FirmInvitationsConsumer } from './consumers/firm-invitations/consumer';
import { RecruiterSubmissionEventConsumer } from './consumers/recruiter-submission/consumer';
import { SupportEventConsumer } from './consumers/support/consumer';
import { ChatEventConsumer } from './consumers/chat/consumer';
import { BillingEventConsumer } from './consumers/billing/consumer';
import { ReputationEventConsumer } from './consumers/reputation/consumer';
import { HealthEventConsumer } from './consumers/health/consumer';
import { OnboardingEventConsumer } from './consumers/onboarding/consumer';
import { JobsEventConsumer } from './consumers/jobs/consumer';
import { RelationshipsEventConsumer } from './consumers/relationships/consumer';
import { SecurityEventConsumer } from './consumers/security/consumer';
import { RecruiterCodesEventConsumer } from './consumers/recruiter-codes/consumer';
import { DocumentsEventConsumer } from './consumers/documents/consumer';
import { GamificationEventConsumer } from './consumers/gamification/consumer';
import { MatchesEventConsumer } from './consumers/matches/consumer';
import { InterviewsEventConsumer } from './consumers/interviews/consumer';
import { ContactLookupHelper } from './helpers/contact-lookup';
import { DataLookupHelper } from './helpers/data-lookup';

export class DomainEventConsumer {
    public connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'notification-service-queue';
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 10;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isConnecting = false;
    private isClosing = false;
    private connectionHealthy = false;

    private applicationsConsumer: ApplicationsEventConsumer;
    private placementsConsumer: PlacementsEventConsumer;
    private candidatesConsumer: CandidatesEventConsumer;
    private collaborationConsumer: CollaborationEventConsumer;
    private invitationsConsumer: InvitationsConsumer;
    private companyInvitationsConsumer: CompanyInvitationsConsumer;
    private recruiterCompanyInvitationsConsumer: RecruiterCompanyInvitationsConsumer;
    private firmInvitationsConsumer: FirmInvitationsConsumer;
    private recruiterSubmissionConsumer: RecruiterSubmissionEventConsumer;
    private supportConsumer: SupportEventConsumer;
    private chatConsumer: ChatEventConsumer;
    private billingConsumer: BillingEventConsumer;
    private reputationConsumer: ReputationEventConsumer;
    private healthConsumer: HealthEventConsumer;
    private onboardingConsumer: OnboardingEventConsumer;
    private jobsConsumer: JobsEventConsumer;
    private relationshipsConsumer: RelationshipsEventConsumer;
    private securityConsumer: SecurityEventConsumer;
    private recruiterCodesConsumer: RecruiterCodesEventConsumer;
    private documentsConsumer: DocumentsEventConsumer;
    private gamificationConsumer: GamificationEventConsumer;
    private matchesConsumer: MatchesEventConsumer;
    private interviewsConsumer: InterviewsEventConsumer;

    constructor(
        private rabbitMqUrl: string,
        notificationService: NotificationService,
        services: ServiceRegistry,
        private repository: NotificationRepository,
        private logger: Logger,
        portalUrl: string,
        candidateWebsiteUrl: string
    ) {
        // Create data lookup helper for direct database queries (avoiding inter-service HTTP calls)
        const dataLookup = new DataLookupHelper(repository.supabaseClient, logger);

        // Create contact lookup helper for unified contact resolution
        const contactLookup = new ContactLookupHelper(repository.supabaseClient, logger);

        this.applicationsConsumer = new ApplicationsEventConsumer(
            notificationService.applications,
            services,
            logger,
            dataLookup,
            contactLookup
        );
        this.placementsConsumer = new PlacementsEventConsumer(
            notificationService.placements,
            services,
            logger,
            dataLookup,
            contactLookup
        );
        this.candidatesConsumer = new CandidatesEventConsumer(
            notificationService.candidates,
            services,
            this.repository,
            logger,
            dataLookup,
            contactLookup
        );
        this.collaborationConsumer = new CollaborationEventConsumer(
            notificationService.collaboration,
            services,
            logger,
            dataLookup,
            contactLookup
        );
        this.invitationsConsumer = new InvitationsConsumer(
            notificationService,
            services,
            logger,
            portalUrl,
            candidateWebsiteUrl,
            dataLookup,
            contactLookup
        );
        this.companyInvitationsConsumer = new CompanyInvitationsConsumer(
            notificationService,
            logger,
            portalUrl,
            dataLookup,
            contactLookup
        );
        this.recruiterCompanyInvitationsConsumer = new RecruiterCompanyInvitationsConsumer(
            notificationService,
            logger,
            portalUrl,
            dataLookup,
            contactLookup
        );
        this.firmInvitationsConsumer = new FirmInvitationsConsumer(
            notificationService,
            logger,
            portalUrl,
            dataLookup,
            contactLookup
        );
        this.recruiterSubmissionConsumer = new RecruiterSubmissionEventConsumer(
            notificationService.recruiterSubmission,
            services,
            logger,
            portalUrl,
            dataLookup,
            contactLookup
        );
        this.supportConsumer = new SupportEventConsumer(notificationService.support, logger);
        this.chatConsumer = new ChatEventConsumer(
            notificationService,
            repository,
            contactLookup,
            logger,
            portalUrl,
            candidateWebsiteUrl
        );
        this.billingConsumer = new BillingEventConsumer(
            notificationService.billing,
            logger,
            portalUrl,
            contactLookup,
            dataLookup
        );
        this.reputationConsumer = new ReputationEventConsumer(
            notificationService.reputation,
            logger,
            portalUrl,
            contactLookup,
            dataLookup
        );
        this.healthConsumer = new HealthEventConsumer(
            notificationService.health,
            logger,
            portalUrl,
        );
        this.onboardingConsumer = new OnboardingEventConsumer(
            notificationService.onboarding,
            logger,
            portalUrl,
            contactLookup
        );
        this.jobsConsumer = new JobsEventConsumer(
            notificationService.jobs,
            logger,
            portalUrl,
            contactLookup,
            dataLookup
        );
        this.relationshipsConsumer = new RelationshipsEventConsumer(
            notificationService.relationships,
            logger,
            portalUrl,
            candidateWebsiteUrl,
            contactLookup,
            dataLookup
        );
        this.securityConsumer = new SecurityEventConsumer(
            notificationService.security,
            logger,
            process.env.OPS_EMAIL || 'ops@splits.network'
        );
        this.recruiterCodesConsumer = new RecruiterCodesEventConsumer(
            notificationService.recruiterCodes,
            logger,
            portalUrl,
            contactLookup,
            dataLookup
        );
        this.documentsConsumer = new DocumentsEventConsumer(
            notificationService.documents,
            logger,
            portalUrl,
            contactLookup,
            dataLookup
        );
        this.gamificationConsumer = new GamificationEventConsumer(
            logger,
            contactLookup,
            dataLookup
        );
        this.matchesConsumer = new MatchesEventConsumer(
            notificationService.matches,
            logger,
            portalUrl,
            candidateWebsiteUrl,
            contactLookup,
            dataLookup
        );
        this.interviewsConsumer = new InterviewsEventConsumer(
            notificationService.interviews,
            logger,
            portalUrl,
            candidateWebsiteUrl,
            contactLookup,
            dataLookup
        );
    }

    async connect(): Promise<void> {
        if (this.isConnecting) {
            this.logger.debug('Connection attempt already in progress, skipping');
            return;
        }

        this.isConnecting = true;

        try {
            this.logger.info('Attempting to connect to RabbitMQ');

            this.connection = await amqp.connect(this.rabbitMqUrl) as any;
            this.channel = await (this.connection as any).createChannel();

            if (!this.channel) throw new Error('Failed to create channel');

            // Setup connection event listeners
            this.connection?.on('error', (err) => {
                this.logger.error({ err }, 'RabbitMQ connection error');
                this.connectionHealthy = false;
                this.scheduleReconnect();
            });

            this.connection?.on('close', () => {
                this.logger.warn('RabbitMQ connection closed');
                this.connectionHealthy = false;
                if (!this.isClosing) {
                    this.scheduleReconnect();
                }
            });

            // Setup channel event listeners
            this.channel.on('error', (err) => {
                this.logger.error({ err }, 'RabbitMQ channel error');
                this.connectionHealthy = false;
            });

            this.channel.on('close', () => {
                this.logger.warn('RabbitMQ channel closed');
                this.connectionHealthy = false;
            });

            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            await this.channel.assertQueue(this.queue, { durable: true });

            // Bind to events we care about
            // Phase 1 events
            await this.channel.bindQueue(this.queue, this.exchange, 'application.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.accepted');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.stage_changed');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.submitted_to_company');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.withdrawn');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.prescreen_requested');
            await this.channel.bindQueue(this.queue, this.exchange, 'placement.created');

            // Phase 1.5 events - AI Review
            await this.channel.bindQueue(this.queue, this.exchange, 'ai_review.started');
            await this.channel.bindQueue(this.queue, this.exchange, 'ai_review.completed');
            await this.channel.bindQueue(this.queue, this.exchange, 'ai_review.failed');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.draft_completed');

            // Phase 2 events - Ownership & Sourcing
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate.sourced');
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate.outreach_recorded');
            await this.channel.bindQueue(this.queue, this.exchange, 'ownership.conflict_detected');
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate.invited');
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate.consent_given');
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate.consent_declined');

            // Phase 2 events - Recruiter Submission (new opportunity proposals)
            await this.channel.bindQueue(this.queue, this.exchange, 'application.recruiter_proposed');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.recruiter_approved');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.recruiter_declined');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.recruiter_opportunity_expired');

            // Phase 4 events - Application Proposals (recruiter proposes job to candidate)
            await this.channel.bindQueue(this.queue, this.exchange, 'application.proposal_accepted');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.proposal_declined');

            // Application Notes events
            await this.channel.bindQueue(this.queue, this.exchange, 'application.note.created');

            // Phase 2 events - Placements
            await this.channel.bindQueue(this.queue, this.exchange, 'placement.activated');
            await this.channel.bindQueue(this.queue, this.exchange, 'placement.completed');
            await this.channel.bindQueue(this.queue, this.exchange, 'placement.failed');
            await this.channel.bindQueue(this.queue, this.exchange, 'replacement.requested');
            await this.channel.bindQueue(this.queue, this.exchange, 'guarantee.expiring');

            // Phase 2 events - Collaboration
            await this.channel.bindQueue(this.queue, this.exchange, 'collaborator.added');
            await this.channel.bindQueue(this.queue, this.exchange, 'reputation.updated');

            // Reputation tier change events
            await this.channel.bindQueue(this.queue, this.exchange, 'reputation.tier_changed');
            await this.channel.bindQueue(this.queue, this.exchange, 'company_reputation.tier_changed');

            // Application expiration events
            await this.channel.bindQueue(this.queue, this.exchange, 'application.expired');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.expiration_warning');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.reactivated');

            // Invitation events
            await this.channel.bindQueue(this.queue, this.exchange, 'invitation.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'invitation.revoked');
            await this.channel.bindQueue(this.queue, this.exchange, 'invitation.accepted');

            // Company platform invitation events
            await this.channel.bindQueue(this.queue, this.exchange, 'company_invitation.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'company_invitation.accepted');

            // Firm invitation events
            await this.channel.bindQueue(this.queue, this.exchange, 'firm.invitation.created');

            // Recruiter-company invitation events
            await this.channel.bindQueue(this.queue, this.exchange, 'recruiter_company.invited');
            await this.channel.bindQueue(this.queue, this.exchange, 'recruiter_company.accepted');
            await this.channel.bindQueue(this.queue, this.exchange, 'recruiter_company.declined');

            // Billing events - Stripe Connect onboarding
            await this.channel.bindQueue(this.queue, this.exchange, 'recruiter.stripe_connect_onboarded');
            await this.channel.bindQueue(this.queue, this.exchange, 'recruiter.stripe_connect_disabled');

            // Billing events - Company billing setup
            await this.channel.bindQueue(this.queue, this.exchange, 'company.billing_profile_completed');

            // Billing events - Payout processing failures
            await this.channel.bindQueue(this.queue, this.exchange, 'payout_transaction.connect_required');

            // Billing events - Payout & financial lifecycle
            await this.channel.bindQueue(this.queue, this.exchange, 'payout.processed');
            await this.channel.bindQueue(this.queue, this.exchange, 'payout.failed');
            await this.channel.bindQueue(this.queue, this.exchange, 'escrow.released');
            await this.channel.bindQueue(this.queue, this.exchange, 'escrow.auto_released');
            await this.channel.bindQueue(this.queue, this.exchange, 'invoice.paid');
            await this.channel.bindQueue(this.queue, this.exchange, 'subscription.cancelled');

            // Status page contact submissions
            await this.channel.bindQueue(this.queue, this.exchange, 'status.contact_submitted');
            await this.channel.bindQueue(this.queue, this.exchange, 'chat.message.created');

            // Onboarding events
            await this.channel.bindQueue(this.queue, this.exchange, 'user.registered');
            await this.channel.bindQueue(this.queue, this.exchange, 'recruiter.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'company.created');

            // Job lifecycle events
            await this.channel.bindQueue(this.queue, this.exchange, 'job.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'job.status_changed');

            // Relationship management events
            await this.channel.bindQueue(this.queue, this.exchange, 'recruiter_company.connection_requested');
            await this.channel.bindQueue(this.queue, this.exchange, 'recruiter_company.terminated');
            await this.channel.bindQueue(this.queue, this.exchange, 'recruiter_candidate.terminated');
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate.invitation_cancelled');

            // Security & fraud events
            await this.channel.bindQueue(this.queue, this.exchange, 'fraud_signal.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'gpt.oauth.replay_detected');

            // Recruiter code events
            await this.channel.bindQueue(this.queue, this.exchange, 'recruiter_code.used');

            // Document processing events
            await this.channel.bindQueue(this.queue, this.exchange, 'resume.metadata.extracted');

            // Health monitoring events
            await this.channel.bindQueue(this.queue, this.exchange, 'system.health.service_unhealthy');
            await this.channel.bindQueue(this.queue, this.exchange, 'system.health.service_recovered');

            // Match invite events
            await this.channel.bindQueue(this.queue, this.exchange, 'match.invited');
            await this.channel.bindQueue(this.queue, this.exchange, 'match.invite_denied');

            // Interview lifecycle events
            await this.channel.bindQueue(this.queue, this.exchange, 'interview.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'interview.cancelled');
            await this.channel.bindQueue(this.queue, this.exchange, 'interview.rescheduled');
            await this.channel.bindQueue(this.queue, this.exchange, 'interview.reschedule_requested');
            await this.channel.bindQueue(this.queue, this.exchange, 'interview.reschedule_accepted');

            // Gamification events
            await this.channel.bindQueue(this.queue, this.exchange, 'badge.awarded');
            await this.channel.bindQueue(this.queue, this.exchange, 'level.up');
            await this.channel.bindQueue(this.queue, this.exchange, 'streak.milestone');

            this.logger.info('Connected to RabbitMQ and bound to events');

            // Mark connection as healthy after successful setup
            this.connectionHealthy = true;

            // Reset reconnect attempts on successful connection
            this.reconnectAttempts = 0;
            this.isConnecting = false;

            await this.startConsuming();
        } catch (error) {
            this.isConnecting = false;
            this.logger.error({ err: error, attempt: this.reconnectAttempts + 1 }, 'Failed to connect to RabbitMQ');

            if (!this.isClosing) {
                this.scheduleReconnect();
            } else {
                throw error;
            }
        }
    }

    private scheduleReconnect(): void {
        if (this.isClosing || this.reconnectTimeout) {
            return;
        }

        this.reconnectAttempts++;

        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            this.logger.error({
                attempts: this.reconnectAttempts,
                maxAttempts: this.maxReconnectAttempts
            }, 'Max reconnection attempts reached, giving up');
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000); // Exponential backoff, max 30s

        this.logger.info({ attempt: this.reconnectAttempts, delay }, 'Scheduling RabbitMQ reconnection');

        this.reconnectTimeout = setTimeout(async () => {
            this.reconnectTimeout = null;

            // Clean up existing connections
            await this.cleanup();

            try {
                await this.connect();
            } catch (error) {
                this.logger.error({ err: error }, 'Reconnection attempt failed');
            }
        }, delay);
    }

    private async cleanup(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
            }
        } catch (error) {
            this.logger.debug({ err: error }, 'Error closing channel during cleanup');
        }

        try {
            if (this.connection) {
            }
        } catch (error) {
            this.logger.debug({ err: error }, 'Error closing connection during cleanup');
        }

        this.connection = null;
        this.channel = null;
    }

    private async startConsuming(): Promise<void> {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }

        await this.channel.consume(
            this.queue,
            async (msg: ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const event: DomainEvent = JSON.parse(msg.content.toString());
                    console.log('[NOTIFICATION-SERVICE] 📨 Received event from RabbitMQ:', {
                        event_type: event.event_type,
                        payload: event.payload,
                        timestamp: new Date().toISOString(),
                    });
                    this.logger.info({ event_type: event.event_type }, 'Processing event');

                    await this.handleEvent(event);

                    console.log('[NOTIFICATION-SERVICE] ✅ Event processed and acknowledged');
                    this.channel!.ack(msg);
                } catch (error) {
                    this.logger.error({ err: error }, 'Error processing message');
                    this.channel!.nack(msg, false, false);
                }
            },
            { noAck: false }
        );

        this.logger.info('Started consuming events');
    }

    private async handleEvent(event: DomainEvent): Promise<void> {
        switch (event.event_type) {
            // Applications domain
            case 'application.created':
                await this.applicationsConsumer.handleCandidateApplicationSubmitted(event);
                break;
            case 'application.submitted_to_company':
                await this.applicationsConsumer.handleRecruiterSubmittedToCompany(event);
                break;
            case 'application.withdrawn':
                await this.applicationsConsumer.handleApplicationWithdrawn(event);
                break;
            case 'application.accepted':
                await this.applicationsConsumer.handleApplicationAccepted(event);
                break;
            case 'application.stage_changed':
                await this.applicationsConsumer.handleApplicationStageChanged(event);
                break;
            case 'application.prescreen_requested':
                await this.applicationsConsumer.handlePreScreenRequested(event);
                break;

            // Phase 1.5 - AI Review events
            case 'ai_review.started':
                await this.applicationsConsumer.handleAIReviewStarted(event);
                break;
            case 'ai_review.completed':
                await this.applicationsConsumer.handleAIReviewCompleted(event);
                break;
            case 'ai_review.failed':
                await this.applicationsConsumer.handleAIReviewFailed(event);
                break;
            case 'application.draft_completed':
                await this.applicationsConsumer.handleDraftCompleted(event);
                break;

            // Placements domain
            case 'placement.created':
                await this.placementsConsumer.handlePlacementCreated(event);
                break;
            case 'placement.activated':
                await this.placementsConsumer.handlePlacementActivated(event);
                break;
            case 'placement.completed':
                await this.placementsConsumer.handlePlacementCompleted(event);
                break;
            case 'placement.failed':
                await this.placementsConsumer.handlePlacementFailed(event);
                break;
            case 'guarantee.expiring':
                await this.placementsConsumer.handleGuaranteeExpiring(event);
                break;

            // Recruiter Submission domain (opportunity proposals)
            case 'application.recruiter_proposed':
                await this.recruiterSubmissionConsumer.handleRecruiterProposedJob(event);
                break;
            case 'application.recruiter_approved':
                await this.recruiterSubmissionConsumer.handleCandidateApprovedOpportunity(event);
                break;
            case 'application.recruiter_declined':
                await this.recruiterSubmissionConsumer.handleCandidateDeclinedOpportunity(event);
                break;
            case 'application.recruiter_opportunity_expired':
                await this.recruiterSubmissionConsumer.handleOpportunityExpired(event);
                break;

            // Phase 4 - Application Proposals (candidate accepts/declines recruiter proposal)
            case 'application.proposal_accepted':
                await this.applicationsConsumer.handleApplicationProposalAccepted(event);
                break;
            case 'application.proposal_declined':
                await this.applicationsConsumer.handleApplicationProposalDeclined(event);
                break;
            case 'application.note.created':
                await this.applicationsConsumer.handleNoteCreated(event);
                break;

            // Candidates domain
            case 'candidate.sourced':
                await this.candidatesConsumer.handleCandidateSourced(event);
                break;
            case 'ownership.conflict_detected':
                await this.candidatesConsumer.handleOwnershipConflict(event);
                break;
            case 'candidate.invited':
                await this.candidatesConsumer.handleCandidateInvited(event);
                break;
            case 'candidate.consent_given':
                await this.candidatesConsumer.handleConsentGiven(event);
                break;
            case 'candidate.consent_declined':
                await this.candidatesConsumer.handleConsentDeclined(event);
                break;

            // Collaboration domain
            case 'collaborator.added':
                await this.collaborationConsumer.handleCollaboratorAdded(event);
                break;

            // Invitations domain
            case 'invitation.created':
                await this.invitationsConsumer.handleInvitationCreated(event);
                break;
            case 'invitation.revoked':
                await this.invitationsConsumer.handleInvitationRevoked(event);
                break;
            case 'invitation.accepted':
                await this.invitationsConsumer.handleInvitationAccepted(event);
                break;

            // Company platform invitations domain
            case 'company_invitation.created':
                await this.companyInvitationsConsumer.handleCompanyInvitationCreated(event);
                break;
            case 'company_invitation.accepted':
                await this.companyInvitationsConsumer.handleCompanyInvitationAccepted(event);
                break;

            // Firm invitations domain
            case 'firm.invitation.created':
                await this.firmInvitationsConsumer.handleFirmInvitationCreated(event);
                break;

            // Recruiter-company invitations domain
            case 'recruiter_company.invited':
                await this.recruiterCompanyInvitationsConsumer.handleRecruiterCompanyInvited(event);
                break;
            case 'recruiter_company.accepted':
                await this.recruiterCompanyInvitationsConsumer.handleRecruiterCompanyAccepted(event);
                break;
            case 'recruiter_company.declined':
                await this.recruiterCompanyInvitationsConsumer.handleRecruiterCompanyDeclined(event);
                break;

            // Billing domain - Stripe Connect
            case 'recruiter.stripe_connect_onboarded':
                await this.billingConsumer.handleStripeConnectOnboarded(event);
                break;
            case 'recruiter.stripe_connect_disabled':
                await this.billingConsumer.handleStripeConnectDisabled(event);
                break;

            // Billing domain - Company billing setup
            case 'company.billing_profile_completed':
                await this.billingConsumer.handleCompanyBillingProfileCompleted(event);
                break;

            // Billing domain - Payout Connect required
            case 'payout_transaction.connect_required':
                await this.billingConsumer.handlePayoutConnectRequired(event);
                break;

            // Billing domain - Payout & financial lifecycle
            case 'payout.processed':
                await this.billingConsumer.handlePayoutProcessed(event);
                break;
            case 'payout.failed':
                await this.billingConsumer.handlePayoutFailed(event);
                break;
            case 'escrow.released':
                await this.billingConsumer.handleEscrowReleased(event);
                break;
            case 'escrow.auto_released':
                await this.billingConsumer.handleEscrowAutoReleased(event);
                break;
            case 'invoice.paid':
                await this.billingConsumer.handleInvoicePaid(event);
                break;
            case 'subscription.cancelled':
                await this.billingConsumer.handleSubscriptionCancelled(event);
                break;

            case 'status.contact_submitted':
                await this.supportConsumer.handleStatusContact(event);
                break;
            case 'chat.message.created':
                await this.chatConsumer.handleMessageCreated(event.payload as any);
                break;

            // Reputation tier changes
            case 'reputation.tier_changed':
                await this.reputationConsumer.handleTierChanged(event);
                break;
            case 'company_reputation.tier_changed':
                await this.reputationConsumer.handleCompanyTierChanged(event);
                break;

            // Application expiration events
            case 'application.expired':
                await this.applicationsConsumer.handleApplicationExpired(event);
                break;
            case 'application.expiration_warning':
                await this.applicationsConsumer.handleExpirationWarning(event);
                break;
            case 'application.reactivated':
                await this.applicationsConsumer.handleApplicationReactivated(event);
                break;

            // Onboarding domain
            case 'user.registered':
                await this.onboardingConsumer.handleUserRegistered(event);
                break;
            case 'recruiter.created':
                await this.onboardingConsumer.handleRecruiterCreated(event);
                break;
            case 'company.created':
                await this.onboardingConsumer.handleCompanyCreated(event);
                break;

            // Jobs domain
            case 'job.created':
                await this.jobsConsumer.handleJobCreated(event);
                break;
            case 'job.status_changed':
                await this.jobsConsumer.handleJobStatusChanged(event);
                break;

            // Relationships domain
            case 'recruiter_company.connection_requested':
                await this.relationshipsConsumer.handleConnectionRequested(event);
                break;
            case 'recruiter_company.terminated':
                await this.relationshipsConsumer.handleRecruiterCompanyTerminated(event);
                break;
            case 'recruiter_candidate.terminated':
                await this.relationshipsConsumer.handleRecruiterCandidateTerminated(event);
                break;
            case 'candidate.invitation_cancelled':
                await this.relationshipsConsumer.handleInvitationCancelled(event);
                break;

            // Security domain
            case 'fraud_signal.created':
                await this.securityConsumer.handleFraudSignalCreated(event);
                break;
            case 'gpt.oauth.replay_detected':
                await this.securityConsumer.handleReplayDetected(event);
                break;

            // Recruiter codes domain
            case 'recruiter_code.used':
                await this.recruiterCodesConsumer.handleRecruiterCodeUsed(event);
                break;

            // Documents domain
            case 'resume.metadata.extracted':
                await this.documentsConsumer.handleResumeMetadataExtracted(event);
                break;

            // Health monitoring
            case 'system.health.service_unhealthy':
                await this.healthConsumer.handleServiceUnhealthy(event);
                break;
            case 'system.health.service_recovered':
                await this.healthConsumer.handleServiceRecovered(event);
                break;

            // Matches domain — invite to apply
            case 'match.invited':
                await this.matchesConsumer.handleMatchInvited(event);
                break;
            case 'match.invite_denied':
                await this.matchesConsumer.handleMatchInviteDenied(event);
                break;

            // Interviews domain
            case 'interview.created':
                await this.interviewsConsumer.handleInterviewCreated(event);
                break;
            case 'interview.cancelled':
                await this.interviewsConsumer.handleInterviewCancelled(event);
                break;
            case 'interview.rescheduled':
                await this.interviewsConsumer.handleInterviewRescheduled(event);
                break;
            case 'interview.reschedule_requested':
                await this.interviewsConsumer.handleRescheduleRequested(event);
                break;
            case 'interview.reschedule_accepted':
                await this.interviewsConsumer.handleRescheduleAccepted(event);
                break;

            // Gamification domain
            case 'badge.awarded':
                await this.gamificationConsumer.handleBadgeAwarded(event);
                break;
            case 'level.up':
                await this.gamificationConsumer.handleLevelUp(event);
                break;
            case 'streak.milestone':
                await this.gamificationConsumer.handleStreakMilestone(event);
                break;

            default:
                this.logger.debug({ event_type: event.event_type }, 'Unhandled event type');
        }
    }

    isConnected(): boolean {
        return this.connection !== null &&
            this.channel !== null &&
            this.connectionHealthy;
    }

    async close(): Promise<void> {
        this.isClosing = true;

        // Clear any pending reconnect attempts
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        await this.cleanup();
        this.logger.info('Disconnected from RabbitMQ');
    }
}
