/**
 * Recruiter-Company Invitations Event Consumer
 * Listens for recruiter-company invitation events and sends emails
 */

import { NotificationService } from '../../service';
import { Logger } from '@splits-network/shared-logging';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

export class RecruiterCompanyInvitationsConsumer {
    constructor(
        private notificationService: NotificationService,
        private logger: Logger,
        private portalUrl: string,
        private dataLookup: DataLookupHelper,
        private contactLookup: ContactLookupHelper
    ) { }

    /**
     * Handle recruiter_company.invited event
     * Sends invitation email to the recruiter
     */
    async handleRecruiterCompanyInvited(event: any): Promise<void> {
        const {
            relationshipId,
            recruiterId,
            companyId,
            invitedBy,
            message
        } = event.payload;

        this.logger.info(
            { relationshipId, recruiterId, companyId },
            'Processing recruiter_company.invited event'
        );

        try {
            // Look up recruiter contact info
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiterId);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiterId}`);
            }

            // Look up company name
            const company = await this.dataLookup.getCompany(companyId);
            if (!company) {
                throw new Error(`Company not found: ${companyId}`);
            }

            // Look up inviter name
            let inviterName = 'A firm member';
            if (invitedBy) {
                const inviterContact = await this.contactLookup.getContactByClerkUserId(invitedBy);
                if (inviterContact) {
                    inviterName = inviterContact.name;
                }
            }

            const invitationsLink = `${this.portalUrl}/portal/company-invitations`;

            await this.notificationService.recruiterCompanyInvitations.sendInvitation({
                email: recruiterContact.email,
                companyName: company.name,
                inviterName,
                personalMessage: message,
                invitationsLink,
            });

            this.logger.info(
                { relationshipId, recruiterEmail: recruiterContact.email },
                'Recruiter-company invitation email sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, relationshipId, recruiterId, companyId },
                'Failed to process recruiter_company.invited event'
            );
            throw error;
        }
    }

    /**
     * Handle recruiter_company.accepted event
     * Notifies the inviter that the recruiter accepted
     */
    async handleRecruiterCompanyAccepted(event: any): Promise<void> {
        const {
            relationshipId,
            recruiterId,
            companyId,
            respondedBy
        } = event.payload;

        this.logger.info(
            { relationshipId, recruiterId, companyId },
            'Processing recruiter_company.accepted event'
        );

        try {
            // Look up recruiter name
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiterId);
            const recruiterName = recruiterContact?.name || 'A recruiter';

            // Look up company name
            const company = await this.dataLookup.getCompany(companyId);
            const companyName = company?.name || 'your company';

            // Look up the original inviter to notify them
            // respondedBy is the person who accepted — we need to notify company admins
            const companyAdminContacts = company?.identity_organization_id
                ? await this.contactLookup.getCompanyAdminContacts(company.identity_organization_id)
                : [];

            const portalLink = `${this.portalUrl}/portal/company-invitations`;

            for (const admin of companyAdminContacts) {
                await this.notificationService.recruiterCompanyInvitations.sendAccepted({
                    email: admin.email,
                    recruiterName,
                    companyName,
                    portalLink,
                });
            }

            this.logger.info(
                { relationshipId, notifiedCount: companyAdminContacts.length },
                'Recruiter-company accepted notifications sent'
            );
        } catch (error) {
            this.logger.error(
                { error, relationshipId, recruiterId },
                'Failed to process recruiter_company.accepted event'
            );
            // Don't throw - acceptance already happened
        }
    }

    /**
     * Handle recruiter_company.declined event
     * Notifies the inviter that the recruiter declined
     */
    async handleRecruiterCompanyDeclined(event: any): Promise<void> {
        const {
            relationshipId,
            recruiterId,
            companyId,
            respondedBy
        } = event.payload;

        this.logger.info(
            { relationshipId, recruiterId, companyId },
            'Processing recruiter_company.declined event'
        );

        try {
            // Look up recruiter name
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiterId);
            const recruiterName = recruiterContact?.name || 'A recruiter';

            // Look up company name
            const company = await this.dataLookup.getCompany(companyId);
            const companyName = company?.name || 'your company';

            // Notify company admins
            const companyAdminContacts = company?.identity_organization_id
                ? await this.contactLookup.getCompanyAdminContacts(company.identity_organization_id)
                : [];

            const portalLink = `${this.portalUrl}/portal/company-invitations`;

            for (const admin of companyAdminContacts) {
                await this.notificationService.recruiterCompanyInvitations.sendDeclined({
                    email: admin.email,
                    recruiterName,
                    companyName,
                    portalLink,
                });
            }

            this.logger.info(
                { relationshipId, notifiedCount: companyAdminContacts.length },
                'Recruiter-company declined notifications sent'
            );
        } catch (error) {
            this.logger.error(
                { error, relationshipId, recruiterId },
                'Failed to process recruiter_company.declined event'
            );
            // Don't throw - decline already happened
        }
    }
}
