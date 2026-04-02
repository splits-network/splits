import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { OnboardingEmailService } from '../../services/onboarding/service.js';
import { ContactLookupHelper } from '../../helpers/contact-lookup.js';

export class OnboardingEventConsumer {
    constructor(
        private emailService: OnboardingEmailService,
        private logger: Logger,
        private portalUrl: string,
        private contactLookup: ContactLookupHelper
    ) {}

    async handleUserRegistered(event: DomainEvent): Promise<void> {
        try {
            const { userId, email } = event.payload;

            this.logger.info({ userId }, 'Handling user registered notification');

            const contact = await this.contactLookup.getContactByUserId(userId);

            await this.emailService.sendWelcome(contact?.email || email, {
                userName: contact?.name || 'there',
                dashboardUrl: `${this.portalUrl}/portal`,
                userId,
            });

            this.logger.info(
                { userId, recipient: contact?.email || email },
                'User registered notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send user registered notification'
            );
            throw error;
        }
    }

    async handleRecruiterCreated(event: DomainEvent): Promise<void> {
        try {
            const { recruiterId, userId } = event.payload;

            this.logger.info({ recruiterId }, 'Handling recruiter created notification');

            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiterId);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiterId}`);
            }

            await this.emailService.sendRecruiterOnboarding(recruiterContact.email, {
                recruiterName: recruiterContact.name,
                dashboardUrl: `${this.portalUrl}/portal`,
                userId: recruiterContact.user_id || undefined,
                recruiterId,
            });

            this.logger.info(
                { recruiterId, recipient: recruiterContact.email },
                'Recruiter created notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send recruiter created notification'
            );
            throw error;
        }
    }

    async handleCompanyCreated(event: DomainEvent): Promise<void> {
        try {
            const { companyId, organizationId, companyName } = event.payload;

            this.logger.info({ companyId, organizationId }, 'Handling company created notification');

            const adminContacts = await this.contactLookup.getCompanyAdminContacts(organizationId);
            if (adminContacts.length === 0) {
                this.logger.warn(
                    { organizationId },
                    'No company admin contacts found, skipping notification'
                );
                return;
            }

            for (const admin of adminContacts) {
                await this.emailService.sendCompanyWelcome(admin.email, {
                    companyName: companyName || 'Your company',
                    adminName: admin.name,
                    dashboardUrl: `${this.portalUrl}/portal`,
                    userId: admin.user_id || undefined,
                    companyId,
                });
            }

            this.logger.info(
                { companyId, organizationId, adminCount: adminContacts.length },
                'Company created notifications sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send company created notification'
            );
            throw error;
        }
    }
}
