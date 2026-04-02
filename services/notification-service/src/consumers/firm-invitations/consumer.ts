/**
 * Firm Invitations Event Consumer
 * Listens for firm invitation events and sends emails via InvitationsEmailService
 */

import { NotificationService } from '../../service.js';
import { Logger } from '@splits-network/shared-logging';
import { DataLookupHelper } from '../../helpers/data-lookup.js';
import { ContactLookupHelper } from '../../helpers/contact-lookup.js';

export class FirmInvitationsConsumer {
    constructor(
        private notificationService: NotificationService,
        private logger: Logger,
        private portalUrl: string,
        private dataLookup: DataLookupHelper,
        private contactLookup: ContactLookupHelper
    ) { }

    /**
     * Handle firm.invitation.created event
     * Sends invitation email to the invited firm member
     */
    async handleFirmInvitationCreated(event: any): Promise<void> {
        const { firmId, invitationId, email, role, invitedBy } = event.payload;

        this.logger.info(
            { invitationId, email, firmId },
            'Processing firm.invitation.created event'
        );

        try {
            // Look up firm name
            const firm = await this.dataLookup.getFirm(firmId);
            if (!firm) {
                throw new Error(`Firm not found: ${firmId}`);
            }

            // Look up inviter's name from Clerk user ID
            const inviterContact = await this.contactLookup.getContactByClerkUserId(invitedBy);
            const inviterName = inviterContact?.name || 'A firm member';

            // Look up invitation details (token, expires_at)
            const invitation = await this.dataLookup.getFirmInvitation(invitationId);
            if (!invitation) {
                throw new Error(`Firm invitation not found: ${invitationId}`);
            }

            const invitationLink = `${this.portalUrl}/firms/invitations/${invitation.token}`;

            await this.notificationService.invitations.sendInvitation({
                invitation_id: invitationId,
                email,
                organization_name: firm.name,
                role,
                invited_by_name: inviterName,
                invitation_link: invitationLink,
                expires_at: invitation.expires_at,
            });

            this.logger.info(
                { invitationId, email, firmName: firm.name },
                'Firm invitation email sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, invitationId, email, firmId },
                'Failed to process firm.invitation.created event'
            );
            throw error;
        }
    }
}
