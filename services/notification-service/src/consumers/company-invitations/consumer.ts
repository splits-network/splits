/**
 * Company Platform Invitations Event Consumer
 * Listens for company invitation events and sends emails
 */

import { NotificationService } from '../../service';
import { Logger } from '@splits-network/shared-logging';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

export class CompanyInvitationsConsumer {
    constructor(
        private notificationService: NotificationService,
        private logger: Logger,
        private portalUrl: string,
        private dataLookup: DataLookupHelper,
        private contactLookup: ContactLookupHelper
    ) {}

    /**
     * Handle company_invitation.created event
     * Sends invitation email to potential company
     */
    async handleCompanyInvitationCreated(event: any): Promise<void> {
        const {
            invitation_id,
            recruiter_id,
            recruiter_name,
            invited_email,
            company_name_hint,
            personal_message,
            invite_code,
            invite_link_token,
            expires_at,
            send_email,
            is_resend
        } = event.payload;

        // Only send email if explicitly requested
        if (!send_email || !invited_email) {
            this.logger.info(
                { invitation_id, send_email, has_email: !!invited_email },
                'Skipping email for company invitation (not requested or no email)'
            );
            return;
        }

        this.logger.info(
            { invitation_id, invited_email, is_resend },
            'Processing company_invitation.created event'
        );

        try {
            const invitationLink = `${this.portalUrl}/join/${invite_link_token}`;
            const expiresDate = new Date(expires_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            await this.notificationService.companyInvitations.sendCompanyInvitation({
                invitation_id,
                email: invited_email,
                recruiter_name: recruiter_name || 'A recruiter',
                personal_message,
                company_name_hint,
                invite_code,
                invitation_link: invitationLink,
                expires_at: expiresDate
            });

            this.logger.info(
                { invitation_id, invited_email },
                'Company platform invitation email sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, invitation_id, invited_email },
                'Failed to process company_invitation.created event'
            );
            throw error;
        }
    }

    /**
     * Handle company_invitation.accepted event
     * Notifies recruiter that their invitation was accepted
     */
    async handleCompanyInvitationAccepted(event: any): Promise<void> {
        const {
            invitation_id,
            recruiter_id,
            accepted_by_user_id,
            organization_id,
            company_id,
            company_name
        } = event.payload;

        this.logger.info(
            { invitation_id, recruiter_id, company_name },
            'Processing company_invitation.accepted event'
        );

        try {
            // Get recruiter contact info
            const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
            if (!recruiter) {
                throw new Error(`Recruiter not found: ${recruiter_id}`);
            }

            // Get recruiter's user info for email
            const recruiterContact = await this.contactLookup.getContactByUserId(recruiter.user_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiter.user_id}`);
            }

            // Get accepting user's contact info
            const acceptingContact = await this.contactLookup.getContactByUserId(accepted_by_user_id);
            const companyAdminName = acceptingContact?.name || 'Company Admin';

            await this.notificationService.companyInvitations.sendCompanyInvitationAccepted({
                email: recruiterContact.email,
                recruiter_name: recruiterContact.name,
                company_name: company_name || 'New Company',
                company_admin_name: companyAdminName
            });

            this.logger.info(
                { invitation_id, recruiter_email: recruiterContact.email },
                'Company invitation accepted notification sent'
            );
        } catch (error) {
            this.logger.error(
                { error, invitation_id, recruiter_id },
                'Failed to process company_invitation.accepted event'
            );
            // Don't throw - acceptance already happened
        }
    }
}
