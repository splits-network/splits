/**
 * Notification Service - Main Coordinator
 * Delegates to domain-specific email services
 */

import { Resend } from 'resend';
import { NotificationRepository } from './repository';
import { Logger } from '@splits-network/shared-logging';
import { ApplicationsEmailService } from './services/applications/service';
import { PlacementsEmailService } from './services/placements/service';
import { CandidatesEmailService } from './services/candidates/service';
import { CollaborationEmailService } from './services/collaboration/service';
import { InvitationsEmailService } from './services/invitations/service';
import { CompanyInvitationsEmailService } from './services/company-invitations/service';
import { RecruiterCompanyInvitationsEmailService } from './services/recruiter-company-invitations/service';
import { RecruiterSubmissionEmailService } from './services/recruiter-submission/service';
import { SupportEmailService } from './services/support/service';
import { ChatEmailService } from './services/chat/service';
import { BillingEmailService } from './services/billing/service';
import { ReputationEmailService } from './services/reputation/service';
import { HealthEmailService } from './services/health/service';
import { OnboardingEmailService } from './services/onboarding/service';
import { JobsEmailService } from './services/jobs/service';
import { RelationshipsEmailService } from './services/relationships/service';
import { SecurityEmailService } from './services/security/service';
import { RecruiterCodesEmailService } from './services/recruiter-codes/service';
import { DocumentsEmailService } from './services/documents/service';

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

    constructor(
        repository: NotificationRepository,
        resendApiKey: string,
        fromEmail: string,
        logger: Logger
    ) {
        const resend = new Resend(resendApiKey);

        this.applications = new ApplicationsEmailService(resend, repository, fromEmail, logger);
        this.placements = new PlacementsEmailService(resend, repository, fromEmail, logger);
        this.candidates = new CandidatesEmailService(resend, repository, fromEmail, logger);
        this.collaboration = new CollaborationEmailService(resend, repository, fromEmail, logger);
        this.invitations = new InvitationsEmailService(resend, repository, fromEmail, logger);
        this.companyInvitations = new CompanyInvitationsEmailService(resend, repository, fromEmail, logger);
        this.recruiterCompanyInvitations = new RecruiterCompanyInvitationsEmailService(resend, repository, fromEmail, logger);
        this.recruiterSubmission = new RecruiterSubmissionEmailService(resend, repository, fromEmail, logger);
        this.support = new SupportEmailService(resend, repository, fromEmail, logger);
        this.chat = new ChatEmailService(resend, repository, fromEmail, logger);
        this.billing = new BillingEmailService(resend, repository, fromEmail, logger);
        this.reputation = new ReputationEmailService(resend, repository, fromEmail, logger);
        this.health = new HealthEmailService(resend, repository, fromEmail, logger);
        this.onboarding = new OnboardingEmailService(resend, repository, fromEmail, logger);
        this.jobs = new JobsEmailService(resend, repository, fromEmail, logger);
        this.relationships = new RelationshipsEmailService(resend, repository, fromEmail, logger);
        this.security = new SecurityEmailService(resend, repository, fromEmail, logger);
        this.recruiterCodes = new RecruiterCodesEmailService(resend, repository, fromEmail, logger);
        this.documents = new DocumentsEmailService(resend, repository, fromEmail, logger);
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

