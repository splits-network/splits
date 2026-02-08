import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { BillingEmailService } from '../../services/billing/service';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

export class BillingEventConsumer {
    constructor(
        private emailService: BillingEmailService,
        private logger: Logger,
        private portalUrl: string,
        private contactLookup: ContactLookupHelper
    ) {}

    async handleStripeConnectOnboarded(event: DomainEvent): Promise<void> {
        try {
            const { recruiter_id, account_id, onboarded_at } = event.payload;

            this.logger.info({ recruiter_id, account_id }, 'Handling Stripe Connect onboarded notification');

            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }

            await this.emailService.sendStripeConnectOnboarded(recruiterContact.email, {
                recruiterName: recruiterContact.name,
                billingUrl: `${this.portalUrl}/portal/billing`,
                recruiterId: recruiter_id,
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info(
                { recruiter_id, recipient: recruiterContact.email },
                'Stripe Connect onboarded notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send Stripe Connect onboarded notification'
            );
            throw error;
        }
    }

    async handleStripeConnectDisabled(event: DomainEvent): Promise<void> {
        try {
            const { recruiter_id, account_id, disabled_reason } = event.payload;

            this.logger.info({ recruiter_id, account_id, disabled_reason }, 'Handling Stripe Connect disabled notification');

            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }

            await this.emailService.sendStripeConnectDisabled(recruiterContact.email, {
                recruiterName: recruiterContact.name,
                reason: disabled_reason,
                connectUrl: `${this.portalUrl}/portal/billing/connect`,
                recruiterId: recruiter_id,
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info(
                { recruiter_id, recipient: recruiterContact.email },
                'Stripe Connect disabled notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send Stripe Connect disabled notification'
            );
            throw error;
        }
    }
}
