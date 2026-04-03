import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { RelationshipsEmailService } from '../../services/relationships/service.js';
import { ContactLookupHelper } from '../../helpers/contact-lookup.js';
import { DataLookupHelper } from '../../helpers/data-lookup.js';

export class RelationshipsEventConsumer {
    constructor(
        private emailService: RelationshipsEmailService,
        private logger: Logger,
        private portalUrl: string,
        private candidateWebsiteUrl: string,
        private contactLookup: ContactLookupHelper,
        private dataLookup: DataLookupHelper
    ) {}

    async handleConnectionRequested(event: DomainEvent): Promise<void> {
        try {
            const { relationshipId, recruiterId, companyId, relationshipType, requestedBy, message } = event.payload;

            this.logger.info({ relationshipId, recruiterId, companyId }, 'Handling connection requested notification');

            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiterId);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiterId}`);
            }

            const company = await this.dataLookup.getCompany(companyId);
            if (!company) {
                throw new Error(`Company not found: ${companyId}`);
            }

            // Notify company admins
            const adminContacts = company.identity_organization_id
                ? await this.contactLookup.getCompanyAdminContacts(company.identity_organization_id)
                : [];

            if (adminContacts.length === 0) {
                this.logger.warn({ companyId }, 'No company admin contacts found, skipping notification');
                return;
            }

            for (const admin of adminContacts) {
                await this.emailService.sendConnectionRequested(admin.email, {
                    companyName: company.name,
                    recruiterName: recruiterContact.name,
                    recruiterEmail: recruiterContact.email,
                    relationshipType,
                    message,
                    connectionUrl: `${this.portalUrl}/portal/invitation/company/${relationshipId}`,
                    userId: admin.user_id || undefined,
                    companyId,
                });
            }

            this.logger.info(
                { relationshipId, adminCount: adminContacts.length },
                'Connection requested notifications sent to company admins'
            );
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send connection requested notification');
            throw error;
        }
    }

    async handleRecruiterCompanyTerminated(event: DomainEvent): Promise<void> {
        try {
            const { relationshipId, recruiterId, companyId, reason, terminatedBy } = event.payload;

            this.logger.info({ relationshipId, recruiterId, companyId }, 'Handling recruiter-company terminated notification');

            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiterId);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiterId}`);
            }

            const company = await this.dataLookup.getCompany(companyId);
            if (!company) {
                throw new Error(`Company not found: ${companyId}`);
            }

            // Notify recruiter
            await this.emailService.sendRelationshipTerminated(recruiterContact.email, {
                recipientName: recruiterContact.name,
                otherPartyName: company.name,
                relationshipType: 'recruiter-company',
                reason,
                dashboardUrl: `${this.portalUrl}/portal/network`,
                userId: recruiterContact.user_id || undefined,
                relationshipId,
            });

            // Notify company admins
            const adminContacts = company.identity_organization_id
                ? await this.contactLookup.getCompanyAdminContacts(company.identity_organization_id)
                : [];

            for (const admin of adminContacts) {
                await this.emailService.sendRelationshipTerminated(admin.email, {
                    recipientName: admin.name,
                    otherPartyName: recruiterContact.name,
                    relationshipType: 'recruiter-company',
                    reason,
                    dashboardUrl: `${this.portalUrl}/portal/network`,
                    userId: admin.user_id || undefined,
                    relationshipId,
                });
            }

            this.logger.info(
                { relationshipId, recruiterId, companyId },
                'Recruiter-company terminated notifications sent'
            );
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send recruiter-company terminated notification');
            throw error;
        }
    }

    async handleRecruiterCandidateTerminated(event: DomainEvent): Promise<void> {
        try {
            const { relationship_id, recruiter_id, candidate_id, reason, terminated_by } = event.payload;

            this.logger.info({ relationship_id, recruiter_id, candidate_id }, 'Handling recruiter-candidate terminated notification');

            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }

            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }

            // Notify recruiter
            await this.emailService.sendRelationshipTerminated(recruiterContact.email, {
                recipientName: recruiterContact.name,
                otherPartyName: candidateContact.name,
                relationshipType: 'recruiter-candidate',
                reason,
                dashboardUrl: `${this.portalUrl}/portal/network`,
                source: 'portal',
                userId: recruiterContact.user_id || undefined,
                relationshipId: relationship_id,
            });

            // Notify candidate
            await this.emailService.sendRelationshipTerminated(candidateContact.email, {
                recipientName: candidateContact.name,
                otherPartyName: recruiterContact.name,
                relationshipType: 'recruiter-candidate',
                reason,
                dashboardUrl: `${this.candidateWebsiteUrl}/dashboard`,
                source: 'candidate',
                userId: candidateContact.user_id || undefined,
                relationshipId: relationship_id,
            });

            this.logger.info(
                { relationship_id, recruiter_id, candidate_id },
                'Recruiter-candidate terminated notifications sent'
            );
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send recruiter-candidate terminated notification');
            throw error;
        }
    }

    async handleInvitationCancelled(event: DomainEvent): Promise<void> {
        try {
            const { relationship_id, recruiter_id, candidate_id } = event.payload;

            this.logger.info({ relationship_id, recruiter_id, candidate_id }, 'Handling invitation cancelled notification');

            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }

            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }

            // Notify candidate
            await this.emailService.sendInvitationCancelled(candidateContact.email, {
                candidateName: candidateContact.name,
                recruiterName: recruiterContact.name,
                dashboardUrl: `${this.candidateWebsiteUrl}/dashboard`,
                userId: candidateContact.user_id || undefined,
                relationshipId: relationship_id,
            });

            this.logger.info(
                { relationship_id, candidate_id, recipient: candidateContact.email },
                'Invitation cancelled notification sent to candidate'
            );
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send invitation cancelled notification');
            throw error;
        }
    }
}
