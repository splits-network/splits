/**
 * Notification Service - Main Coordinator
 * Delegates to domain-specific email services
 */

import { Resend } from 'resend';
import { NotificationRepository } from './repository.js';
import { Logger } from '@splits-network/shared-logging';
import { ApplicationsEmailService } from './services/applications/service.js';
import { PlacementsEmailService } from './services/placements/service.js';
import { CandidatesEmailService } from './services/candidates/service.js';
import { CollaborationEmailService } from './services/collaboration/service.js';
import { InvitationsEmailService } from './services/invitations/service.js';
import { CompanyInvitationsEmailService } from './services/company-invitations/service.js';
import { RecruiterCompanyInvitationsEmailService } from './services/recruiter-company-invitations/service.js';
import { RecruiterSubmissionEmailService } from './services/recruiter-submission/service.js';
import { SupportEmailService } from './services/support/service.js';
import { ChatEmailService } from './services/chat/service.js';
import { BillingEmailService } from './services/billing/service.js';
import { ReputationEmailService } from './services/reputation/service.js';
import { HealthEmailService } from './services/health/service.js';
import { OnboardingEmailService } from './services/onboarding/service.js';
import { JobsEmailService } from './services/jobs/service.js';
import { RelationshipsEmailService } from './services/relationships/service.js';
import { SecurityEmailService } from './services/security/service.js';
import { RecruiterCodesEmailService } from './services/recruiter-codes/service.js';
import { DocumentsEmailService } from './services/documents/service.js';
import { EngagementEmailService } from './services/engagement/service.js';
import { MatchesEmailService } from './services/matches/service.js';
import { CallsEmailService } from './services/calls/service.js';

export class NotificationService {
    public readonly applications: ApplicationsEmailService;
    public readonly placements: PlacementsEmailService;
    public readonly candidates: CandidatesEmailService;
    public readonly collaboration: CollaborationEmailService;
    public readonly invitations: InvitationsEmailService;
    public readonly companyInvitations: CompanyInvitationsEmailService;
    public readonly recruiterCompanyInvitations: RecruiterCompanyInvitationsEmailService;
    public readonly recruiterSubmission: RecruiterSubmissionEmailService;
    public readonly support: SupportEmailService;
    public readonly chat: ChatEmailService;
    public readonly billing: BillingEmailService;
    public readonly reputation: ReputationEmailService;
    public readonly health: HealthEmailService;
    public readonly onboarding: OnboardingEmailService;
    public readonly jobs: JobsEmailService;
    public readonly relationships: RelationshipsEmailService;
    public readonly security: SecurityEmailService;
    public readonly recruiterCodes: RecruiterCodesEmailService;
    public readonly documents: DocumentsEmailService;
    public readonly engagement: EngagementEmailService;
    public readonly matches: MatchesEmailService;
    public readonly calls: CallsEmailService;

    constructor(
        repository: NotificationRepository,
        resendApiKey: string,
        fromEmail: string,
        candidateFromEmail: string,
        logger: Logger
    ) {
        const resend = new Resend(resendApiKey);

        // Initialize email entitlement gate for plan-based email gating
        repository.initEmailGate(logger);

        // Initialize user preference gate for per-user notification preferences
        repository.initPreferenceGate(logger);

        // Initialize push notification sender (async — non-blocking, push is optional)
        repository.initPushSender(logger);

        this.applications = new ApplicationsEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.placements = new PlacementsEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.candidates = new CandidatesEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.collaboration = new CollaborationEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.invitations = new InvitationsEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.companyInvitations = new CompanyInvitationsEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.recruiterCompanyInvitations = new RecruiterCompanyInvitationsEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.recruiterSubmission = new RecruiterSubmissionEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.support = new SupportEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.chat = new ChatEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.billing = new BillingEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.reputation = new ReputationEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.health = new HealthEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.onboarding = new OnboardingEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.jobs = new JobsEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.relationships = new RelationshipsEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.security = new SecurityEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.recruiterCodes = new RecruiterCodesEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.documents = new DocumentsEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.engagement = new EngagementEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.matches = new MatchesEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
        this.calls = new CallsEmailService(resend, repository, fromEmail, candidateFromEmail, logger);
    }

    // Legacy compatibility methods - delegate to domain services
    async sendApplicationCreated(...args: Parameters<ApplicationsEmailService['sendApplicationCreated']>) {
        return this.applications.sendApplicationCreated(...args);
    }

    async sendApplicationStageChanged(...args: Parameters<ApplicationsEmailService['sendApplicationStageChanged']>) {
        return this.applications.sendApplicationStageChanged(...args);
    }

    async sendApplicationAccepted(...args: Parameters<ApplicationsEmailService['sendApplicationAccepted']>) {
        return this.applications.sendApplicationAccepted(...args);
    }

    async sendPlacementCreated(...args: Parameters<PlacementsEmailService['sendPlacementCreated']>) {
        return this.placements.sendPlacementCreated(...args);
    }

    async sendPlacementActivated(...args: Parameters<PlacementsEmailService['sendPlacementActivated']>) {
        return this.placements.sendPlacementActivated(...args);
    }

    async sendPlacementCompleted(...args: Parameters<PlacementsEmailService['sendPlacementCompleted']>) {
        return this.placements.sendPlacementCompleted(...args);
    }

    async sendPlacementFailed(...args: Parameters<PlacementsEmailService['sendPlacementFailed']>) {
        return this.placements.sendPlacementFailed(...args);
    }

    async sendGuaranteeExpiring(...args: Parameters<PlacementsEmailService['sendGuaranteeExpiring']>) {
        return this.placements.sendGuaranteeExpiring(...args);
    }

    async sendCandidateSourced(...args: Parameters<CandidatesEmailService['sendCandidateSourced']>) {
        return this.candidates.sendCandidateSourced(...args);
    }

    async sendOwnershipConflict(...args: Parameters<CandidatesEmailService['sendOwnershipConflict']>) {
        return this.candidates.sendOwnershipConflict(...args);
    }

    async sendOwnershipConflictRejection(...args: Parameters<CandidatesEmailService['sendOwnershipConflictRejection']>) {
        return this.candidates.sendOwnershipConflictRejection(...args);
    }

    async sendCollaboratorAdded(...args: Parameters<CollaborationEmailService['sendCollaboratorAdded']>) {
        return this.collaboration.sendCollaboratorAdded(...args);
    }
}

