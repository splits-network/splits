/**
 * Invitations Event Consumer
 * Listens for invitation events and sends emails
 */

import { NotificationService } from '../../service';
import { Logger } from '@splits-network/shared-logging';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

export class InvitationsConsumer {
    constructor(
        private notificationService: NotificationService,
        private logger: Logger,
        private portalUrl: string,
        private candidateWebsiteUrl: string,
        private dataLookup: DataLookupHelper,
        private contactLookup: ContactLookupHelper
    ) {}

    /**
     * Handle invitation.created event
     */
    async handleInvitationCreated(event: any): Promise<void> {
        const { invitation_id, email, organization_id, company_id, role, invited_by } = event.payload;

        this.logger.info(
            { invitation_id, email, organization_id, company_id },
            'Processing invitation.created event'
        );

        try {
            // Fetch organization details
            const organization = await this.dataLookup.getOrganization(organization_id);
            if (!organization) {
                throw new Error(`Organization not found: ${organization_id}`);
            }

            // Fetch company details if company_id is present
            let organizationName = organization.name;
            if (company_id) {
                const company = await this.dataLookup.getCompany(company_id);
                if (company) {
                    organizationName = company.name;
                    this.logger.info({ company_id, company_name: company.name }, 'Using company name for invitation');
                }
            }

            // Fetch inviter contact
            const inviterContact = await this.contactLookup.getContactByUserId(invited_by);
            if (!inviterContact) {
                throw new Error(`Inviter contact not found: ${invited_by}`);
            }

            // Fetch full invitation details (to get expires_at)
            const invitation = await this.dataLookup.getInvitation(invitation_id);
            if (!invitation) {
                throw new Error(`Invitation not found: ${invitation_id}`);
            }

            // Determine which URL to use based on the role
            // Company/portal roles: company_admin, hiring_manager
            // Candidate roles: everything else
            const isPortalRole = role === 'company_admin' || role === 'hiring_manager';
            const baseUrl = isPortalRole ? this.portalUrl : this.candidateWebsiteUrl;
            const invitation_link = `${baseUrl}/accept-invitation/${invitation_id}`;

            // Send invitation email
            await this.notificationService.invitations.sendInvitation({
                invitation_id,
                email,
                organization_name: organizationName,
                role,
                invited_by_name: inviterContact.name,
                invitation_link,
                expires_at: invitation.expires_at || '',
            });

            this.logger.info({ invitation_id, email }, 'Invitation email sent successfully');
        } catch (error) {
            this.logger.error(
                { error, invitation_id, email },
                'Failed to process invitation.created event'
            );
            throw error;
        }
    }

    /**
     * Handle invitation.accepted event
     */
    async handleInvitationAccepted(event: any): Promise<void> {
        const { invitation_id, user_id, organization_id, company_id, role } = event.payload;

        this.logger.info(
            { invitation_id, user_id, organization_id },
            'Processing invitation.accepted event'
        );

        try {
            // Fetch organization details
            const organization = await this.dataLookup.getOrganization(organization_id);
            if (!organization) {
                throw new Error(`Organization not found: ${organization_id}`);
            }

            // Use company name if available
            let organizationName = organization.name;
            if (company_id) {
                const company = await this.dataLookup.getCompany(company_id);
                if (company) {
                    organizationName = company.name;
                }
            }

            // Get new member's contact info
            const newMemberContact = await this.contactLookup.getContactByUserId(user_id);
            const newMemberName = newMemberContact?.name || 'A new member';

            // Get company admin contacts to notify
            const adminContacts = organization_id
                ? await this.contactLookup.getCompanyAdminContacts(organization_id)
                : [];

            for (const admin of adminContacts) {
                if (admin.email) {
                    await this.notificationService.invitations.sendInvitationAccepted({
                        email: admin.email,
                        organization_name: organizationName,
                        new_member_name: newMemberName,
                        role,
                        userId: admin.user_id ?? undefined,
                    });
                }
            }

            this.logger.info(
                { invitation_id, admins_notified: adminContacts.length },
                'Invitation accepted notifications sent'
            );
        } catch (error) {
            this.logger.error(
                { error, invitation_id, user_id },
                'Failed to process invitation.accepted event'
            );
        }
    }

    /**
     * Handle invitation.revoked event
     */
    async handleInvitationRevoked(event: any): Promise<void> {
        const { email, organization_id } = event.payload;

        this.logger.info({ email, organization_id }, 'Processing invitation.revoked event');

        try {
            // Fetch organization details
            const organization = await this.dataLookup.getOrganization(organization_id);
            if (!organization) {
                throw new Error(`Organization not found: ${organization_id}`);
            }

            // Send revoked email
            await this.notificationService.invitations.sendInvitationRevoked({
                email,
                organization_name: organization.name,
            });

            this.logger.info({ email, organization_id }, 'Revoked email sent successfully');
        } catch (error) {
            this.logger.error(
                { error, email, organization_id },
                'Failed to process invitation.revoked event'
            );
            // Don't throw - revocation already happened
        }
    }
}
