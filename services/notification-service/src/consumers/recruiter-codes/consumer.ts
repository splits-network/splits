import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { RecruiterCodesEmailService } from '../../services/recruiter-codes/service';
import { ContactLookupHelper } from '../../helpers/contact-lookup';
import { DataLookupHelper } from '../../helpers/data-lookup';

export class RecruiterCodesEventConsumer {
    constructor(
        private emailService: RecruiterCodesEmailService,
        private logger: Logger,
        private portalUrl: string,
        private contactLookup: ContactLookupHelper,
        private dataLookup: DataLookupHelper
    ) {}

    async handleRecruiterCodeUsed(event: DomainEvent): Promise<void> {
        try {
            const { code_id, recruiter_id, user_id, code } = event.payload;

            this.logger.info(
                { code_id, recruiter_id, user_id, code },
                'Handling recruiter_code.used notification'
            );

            // Get recruiter contact info
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact?.email) {
                this.logger.warn({ recruiter_id }, 'No email found for recruiter — skipping notification');
                return;
            }

            // Get new user contact info
            const newUserContact = await this.contactLookup.getContactByUserId(user_id);
            const newUserName = newUserContact?.name || 'A new user';

            await this.emailService.sendReferralCodeRedeemed(
                recruiterContact.email,
                {
                    recruiterName: recruiterContact.name || 'Recruiter',
                    newUserName,
                    code: code || 'N/A',
                    dashboardUrl: `${this.portalUrl}/portal/referrals`,
                },
                recruiterContact.user_id ?? undefined
            );

            this.logger.info(
                { recruiter_id, code },
                'Referral code redeemed notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send referral code redeemed notification'
            );
            throw error;
        }
    }
}
