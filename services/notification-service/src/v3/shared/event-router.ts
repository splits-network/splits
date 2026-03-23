/**
 * Event Router
 *
 * Maps each event type to the appropriate domain consumer handler.
 * Extracted from the domain consumer to keep the switch statement
 * manageable and the consumer class focused on RabbitMQ lifecycle.
 */

import { DomainEvent } from '@splits-network/shared-types';
import { Logger } from '@splits-network/shared-logging';
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

export interface DomainConsumers {
    applications: ApplicationsEventConsumer;
    placements: PlacementsEventConsumer;
    candidates: CandidatesEventConsumer;
    collaboration: CollaborationEventConsumer;
    invitations: InvitationsConsumer;
    companyInvitations: CompanyInvitationsConsumer;
    recruiterCompanyInvitations: RecruiterCompanyInvitationsConsumer;
    firmInvitations: FirmInvitationsConsumer;
    recruiterSubmission: RecruiterSubmissionEventConsumer;
    support: SupportEventConsumer;
    chat: ChatEventConsumer;
    billing: BillingEventConsumer;
    reputation: ReputationEventConsumer;
    health: HealthEventConsumer;
    onboarding: OnboardingEventConsumer;
    jobs: JobsEventConsumer;
    relationships: RelationshipsEventConsumer;
    security: SecurityEventConsumer;
    recruiterCodes: RecruiterCodesEventConsumer;
    documents: DocumentsEventConsumer;
    gamification: GamificationEventConsumer;
    matches: MatchesEventConsumer;
    calls: CallsEventConsumer;
}

/**
 * Route a domain event to the appropriate consumer handler.
 * Returns true if the event was handled, false if unrecognized.
 */
export async function routeEvent(
    event: DomainEvent,
    consumers: DomainConsumers,
    logger: Logger,
): Promise<boolean> {
    const c = consumers;

    switch (event.event_type) {
        // --- Applications domain ---
        case 'application.created':
            await c.applications.handleCandidateApplicationSubmitted(event);
            return true;
        case 'application.submitted_to_company':
            await c.applications.handleRecruiterSubmittedToCompany(event);
            return true;
        case 'application.withdrawn':
            await c.applications.handleApplicationWithdrawn(event);
            return true;
        case 'application.accepted':
            await c.applications.handleApplicationAccepted(event);
            return true;
        case 'application.stage_changed':
            await c.applications.handleApplicationStageChanged(event);
            return true;
        case 'application.prescreen_requested':
            await c.applications.handlePreScreenRequested(event);
            return true;
        case 'application.expired':
            await c.applications.handleApplicationExpired(event);
            return true;
        case 'application.expiration_warning':
            await c.applications.handleExpirationWarning(event);
            return true;
        case 'application.reactivated':
            await c.applications.handleApplicationReactivated(event);
            return true;
        case 'application.note.created':
            await c.applications.handleNoteCreated(event);
            return true;
        case 'application.offer_accepted':
            await c.applications.handleOfferAccepted(event);
            return true;
        case 'application.proposal_accepted':
            await c.applications.handleApplicationProposalAccepted(event);
            return true;
        case 'application.proposal_declined':
            await c.applications.handleApplicationProposalDeclined(event);
            return true;

        // --- AI Review ---
        case 'ai_review.started':
            await c.applications.handleAIReviewStarted(event);
            return true;
        case 'ai_review.completed':
            await c.applications.handleAIReviewCompleted(event);
            return true;
        case 'ai_review.failed':
            await c.applications.handleAIReviewFailed(event);
            return true;
        case 'application.draft_completed':
            await c.applications.handleDraftCompleted(event);
            return true;

        // --- Recruiter Submission ---
        case 'application.recruiter_proposed':
            await c.recruiterSubmission.handleRecruiterProposedJob(event);
            return true;
        case 'application.recruiter_approved':
            await c.recruiterSubmission.handleCandidateApprovedOpportunity(event);
            return true;
        case 'application.recruiter_declined':
            await c.recruiterSubmission.handleCandidateDeclinedOpportunity(event);
            return true;
        case 'application.recruiter_opportunity_expired':
            await c.recruiterSubmission.handleOpportunityExpired(event);
            return true;

        // --- Placements domain ---
        case 'placement.created':
            await c.placements.handlePlacementCreated(event);
            return true;
        case 'placement.activated':
            await c.placements.handlePlacementActivated(event);
            return true;
        case 'placement.completed':
            await c.placements.handlePlacementCompleted(event);
            return true;
        case 'placement.failed':
            await c.placements.handlePlacementFailed(event);
            return true;
        case 'guarantee.expiring':
            await c.placements.handleGuaranteeExpiring(event);
            return true;

        default:
            return routeEventContinued(event, consumers, logger);
    }
}

/**
 * Continuation of routeEvent — handles remaining domains.
 * Split to keep each function under ~200 lines.
 */
async function routeEventContinued(
    event: DomainEvent,
    consumers: DomainConsumers,
    logger: Logger,
): Promise<boolean> {
    const c = consumers;

    switch (event.event_type) {
        // --- Candidates domain ---
        case 'candidate.sourced':
            await c.candidates.handleCandidateSourced(event);
            return true;
        case 'ownership.conflict_detected':
            await c.candidates.handleOwnershipConflict(event);
            return true;
        case 'candidate.invited':
            await c.candidates.handleCandidateInvited(event);
            return true;
        case 'candidate.consent_given':
            await c.candidates.handleConsentGiven(event);
            return true;
        case 'candidate.consent_declined':
            await c.candidates.handleConsentDeclined(event);
            return true;

        // --- Collaboration ---
        case 'collaborator.added':
            await c.collaboration.handleCollaboratorAdded(event);
            return true;
        case 'reputation.tier_changed':
            await c.reputation.handleTierChanged(event);
            return true;
        case 'company_reputation.tier_changed':
            await c.reputation.handleCompanyTierChanged(event);
            return true;

        // --- Invitations ---
        case 'invitation.created':
            await c.invitations.handleInvitationCreated(event);
            return true;
        case 'invitation.revoked':
            await c.invitations.handleInvitationRevoked(event);
            return true;
        case 'invitation.accepted':
            await c.invitations.handleInvitationAccepted(event);
            return true;
        case 'company_invitation.created':
            await c.companyInvitations.handleCompanyInvitationCreated(event);
            return true;
        case 'company_invitation.accepted':
            await c.companyInvitations.handleCompanyInvitationAccepted(event);
            return true;
        case 'firm.invitation.created':
            await c.firmInvitations.handleFirmInvitationCreated(event);
            return true;
        case 'recruiter_company.invited':
            await c.recruiterCompanyInvitations.handleRecruiterCompanyInvited(event);
            return true;
        case 'recruiter_company.accepted':
            await c.recruiterCompanyInvitations.handleRecruiterCompanyAccepted(event);
            return true;
        case 'recruiter_company.declined':
            await c.recruiterCompanyInvitations.handleRecruiterCompanyDeclined(event);
            return true;

        default:
            return routeEventFinal(event, consumers, logger);
    }
}

/**
 * Final continuation — billing, support, onboarding, jobs, relationships,
 * security, documents, matches, calls, gamification.
 */
async function routeEventFinal(
    event: DomainEvent,
    consumers: DomainConsumers,
    logger: Logger,
): Promise<boolean> {
    const c = consumers;

    switch (event.event_type) {
        // --- Billing ---
        case 'recruiter.stripe_connect_onboarded':
            await c.billing.handleStripeConnectOnboarded(event);
            return true;
        case 'recruiter.stripe_connect_disabled':
            await c.billing.handleStripeConnectDisabled(event);
            return true;
        case 'company.billing_profile_completed':
            await c.billing.handleCompanyBillingProfileCompleted(event);
            return true;
        case 'payout_transaction.connect_required':
            await c.billing.handlePayoutConnectRequired(event);
            return true;
        case 'payout.processed':
            await c.billing.handlePayoutProcessed(event);
            return true;
        case 'payout.failed':
            await c.billing.handlePayoutFailed(event);
            return true;
        case 'escrow.released':
            await c.billing.handleEscrowReleased(event);
            return true;
        case 'escrow.auto_released':
            await c.billing.handleEscrowAutoReleased(event);
            return true;
        case 'invoice.paid':
            await c.billing.handleInvoicePaid(event);
            return true;
        case 'subscription.cancelled':
            await c.billing.handleSubscriptionCancelled(event);
            return true;

        // --- Support / Chat ---
        case 'status.contact_submitted':
            await c.support.handleStatusContact(event);
            return true;
        case 'support_ticket.replied':
            await c.support.handleTicketReplied(event);
            return true;
        case 'chat.message.created':
            await c.chat.handleMessageCreated(event.payload as any);
            return true;

        // --- Onboarding ---
        case 'user.registered':
            await c.onboarding.handleUserRegistered(event);
            return true;
        case 'recruiter.created':
            await c.onboarding.handleRecruiterCreated(event);
            return true;
        case 'company.created':
            await c.onboarding.handleCompanyCreated(event);
            return true;

        // --- Jobs ---
        case 'job.created':
            await c.jobs.handleJobCreated(event);
            return true;
        case 'job.status_changed':
            await c.jobs.handleJobStatusChanged(event);
            return true;
        case 'job.updated':
            await c.jobs.handleJobUpdated(event);
            return true;
        case 'job.deleted':
            await c.jobs.handleJobDeleted(event);
            return true;
        case 'job_recommendation.created':
            await c.jobs.handleJobRecommendationCreated(event);
            return true;

        // --- Relationships ---
        case 'recruiter_company.connection_requested':
            await c.relationships.handleConnectionRequested(event);
            return true;
        case 'recruiter_company.terminated':
            await c.relationships.handleRecruiterCompanyTerminated(event);
            return true;
        case 'recruiter_candidate.terminated':
            await c.relationships.handleRecruiterCandidateTerminated(event);
            return true;
        case 'candidate.invitation_cancelled':
            await c.relationships.handleInvitationCancelled(event);
            return true;

        // --- Security ---
        case 'fraud_signal.created':
            await c.security.handleFraudSignalCreated(event);
            return true;
        case 'gpt.oauth.replay_detected':
            await c.security.handleReplayDetected(event);
            return true;

        // --- Recruiter codes ---
        case 'recruiter_code.used':
            await c.recruiterCodes.handleRecruiterCodeUsed(event);
            return true;

        // --- Documents ---
        case 'resume.metadata.extracted':
            await c.documents.handleResumeMetadataExtracted(event);
            return true;

        // --- Health monitoring ---
        case 'system.health.service_unhealthy':
            await c.health.handleServiceUnhealthy(event);
            return true;
        case 'system.health.service_recovered':
            await c.health.handleServiceRecovered(event);
            return true;

        // --- Matches ---
        case 'match.invited':
            await c.matches.handleMatchInvited(event);
            return true;
        case 'match.invite_denied':
            await c.matches.handleMatchInviteDenied(event);
            return true;

        // --- Calls ---
        case 'call.created':
            await c.calls.handleCallCreated(event);
            return true;
        case 'call.cancelled':
            await c.calls.handleCallCancelled(event);
            return true;
        case 'call.rescheduled':
            await c.calls.handleCallRescheduled(event);
            return true;
        case 'call.recording_ready':
            await c.calls.handleRecordingReady(event);
            return true;
        case 'call.starting_soon':
            await c.calls.handleStartingSoon(event);
            return true;
        case 'call.reminder':
            await c.calls.handleReminder(event);
            return true;
        case 'call.declined':
            await c.calls.handleCallDeclined(event);
            return true;
        case 'call.participant.joined':
            await c.calls.handleParticipantJoined(event);
            return true;

        // --- Gamification ---
        case 'badge.awarded':
            await c.gamification.handleBadgeAwarded(event);
            return true;
        case 'level.up':
            await c.gamification.handleLevelUp(event);
            return true;
        case 'streak.milestone':
            await c.gamification.handleStreakMilestone(event);
            return true;

        default:
            logger.debug({ event_type: event.event_type }, 'Unhandled event type');
            return false;
    }
}
