import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { BillingEmailService } from '../../services/billing/service.js';
import { ContactLookupHelper } from '../../helpers/contact-lookup.js';
import { DataLookupHelper } from '../../helpers/data-lookup.js';

export class BillingEventConsumer {
    constructor(
        private emailService: BillingEmailService,
        private logger: Logger,
        private portalUrl: string,
        private contactLookup: ContactLookupHelper,
        private dataLookup: DataLookupHelper
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

    async handleCompanyBillingProfileCompleted(event: DomainEvent): Promise<void> {
        try {
            const { company_id, billing_email, billing_terms, has_payment_method } = event.payload;

            this.logger.info({ company_id }, 'Handling company billing profile completed notification');

            if (!billing_email) {
                this.logger.warn({ company_id }, 'No billing email found, skipping notification');
                return;
            }

            await this.emailService.sendCompanyBillingSetupComplete(billing_email, {
                billingEmail: billing_email,
                billingTerms: billing_terms,
                hasPaymentMethod: has_payment_method,
                billingUrl: `${this.portalUrl}/portal/billing`,
                companyId: company_id,
            });

            this.logger.info(
                { company_id, recipient: billing_email },
                'Company billing profile completed notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send company billing profile completed notification'
            );
            throw error;
        }
    }

    async handlePayoutConnectRequired(event: DomainEvent): Promise<void> {
        try {
            const { recruiterId, placementId, transactionId, amount, reason } = event.payload;

            this.logger.info(
                { recruiter_id: recruiterId, placement_id: placementId, amount, reason },
                'Handling payout Connect required notification'
            );

            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiterId);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiterId}`);
            }

            await this.emailService.sendPayoutConnectRequired(recruiterContact.email, {
                recruiterName: recruiterContact.name,
                amount,
                connectUrl: `${this.portalUrl}/portal/profile`,
                reason,
                recruiterId,
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info(
                { recruiter_id: recruiterId, recipient: recruiterContact.email, amount },
                'Payout Connect required notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send payout Connect required notification'
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
                connectUrl: `${this.portalUrl}/portal/profile`,
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

    async handlePayoutProcessed(event: DomainEvent): Promise<void> {
        try {
            const { scheduleId, placementId } = event.payload;

            this.logger.info({ scheduleId, placementId }, 'Handling payout processed notification');

            const placement = placementId ? await this.dataLookup.getPlacement(placementId) : null;
            const job = placement ? await this.dataLookup.getJob(placement.job_id) : null;

            // Look up recruiter from placement
            if (!placement?.recruiter_id) {
                throw new Error(`No recruiter found for payout schedule: ${scheduleId}`);
            }

            const recruiterContact = await this.contactLookup.getRecruiterContact(placement.recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found for placement: ${placementId}`);
            }

            const amount = placement.placement_fee
                ? `$${placement.placement_fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '$0.00';

            await this.emailService.sendPayoutProcessed(recruiterContact.email, {
                recruiterName: recruiterContact.name,
                amount,
                placementTitle: job?.title,
                payoutUrl: `${this.portalUrl}/portal/billing`,
                recruiterId: placement.recruiter_id,
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info(
                { scheduleId, recipient: recruiterContact.email },
                'Payout processed notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send payout processed notification'
            );
            throw error;
        }
    }

    async handlePayoutFailed(event: DomainEvent): Promise<void> {
        try {
            const { scheduleId, reason, retryCount } = event.payload;

            this.logger.info({ scheduleId, reason, retryCount }, 'Handling payout failed notification');

            const placement = await this.resolvePayoutPlacement(scheduleId);
            if (!placement) {
                throw new Error(`Could not resolve placement for payout schedule: ${scheduleId}`);
            }

            const recruiterContact = await this.contactLookup.getRecruiterContact(placement.recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${placement.recruiter_id}`);
            }

            const amount = placement.placement_fee
                ? `$${placement.placement_fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '$0.00';

            await this.emailService.sendPayoutFailed(recruiterContact.email, {
                recruiterName: recruiterContact.name,
                amount,
                reason: reason || 'Unknown error',
                payoutUrl: `${this.portalUrl}/portal/billing`,
                recruiterId: placement.recruiter_id,
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info(
                { scheduleId, recipient: recruiterContact.email },
                'Payout failed notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send payout failed notification'
            );
            throw error;
        }
    }

    async handleEscrowReleased(event: DomainEvent): Promise<void> {
        try {
            const { holdId, placementId, holdAmount, releasedBy } = event.payload;

            this.logger.info({ holdId, placementId, holdAmount }, 'Handling escrow released notification');

            const placement = placementId ? await this.dataLookup.getPlacement(placementId) : null;
            const job = placement ? await this.dataLookup.getJob(placement.job_id) : null;

            if (!placement?.recruiter_id) {
                throw new Error(`No recruiter found for escrow hold: ${holdId}`);
            }

            const recruiterContact = await this.contactLookup.getRecruiterContact(placement.recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${placement.recruiter_id}`);
            }

            const amount = `$${Number(holdAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            await this.emailService.sendEscrowReleased(recruiterContact.email, {
                recruiterName: recruiterContact.name,
                amount,
                placementTitle: job?.title,
                billingUrl: `${this.portalUrl}/portal/billing`,
                recruiterId: placement.recruiter_id,
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info(
                { holdId, recipient: recruiterContact.email },
                'Escrow released notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send escrow released notification'
            );
            throw error;
        }
    }

    async handleEscrowAutoReleased(event: DomainEvent): Promise<void> {
        try {
            const { holdId, placementId, holdAmount } = event.payload;

            this.logger.info({ holdId, placementId, holdAmount }, 'Handling escrow auto-released notification');

            const placement = placementId ? await this.dataLookup.getPlacement(placementId) : null;
            const job = placement ? await this.dataLookup.getJob(placement.job_id) : null;
            const amount = `$${Number(holdAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            // Notify recruiter
            if (placement?.recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(placement.recruiter_id);
                if (recruiterContact) {
                    await this.emailService.sendEscrowAutoReleased(recruiterContact.email, {
                        recipientName: recruiterContact.name,
                        amount,
                        placementTitle: job?.title,
                        billingUrl: `${this.portalUrl}/portal/billing`,
                        isRecruiter: true,
                        userId: recruiterContact.user_id || undefined,
                    });
                }
            }

            // Notify company admins
            if (placement?.company_id) {
                const company = await this.dataLookup.getCompany(placement.company_id);
                if (company?.identity_organization_id) {
                    const admins = await this.contactLookup.getCompanyAdminContacts(company.identity_organization_id);
                    for (const admin of admins) {
                        await this.emailService.sendEscrowAutoReleased(admin.email, {
                            recipientName: admin.name,
                            amount,
                            placementTitle: job?.title,
                            billingUrl: `${this.portalUrl}/portal/billing`,
                            isRecruiter: false,
                            userId: admin.user_id || undefined,
                        });
                    }
                }
            }

            this.logger.info(
                { holdId, placementId },
                'Escrow auto-released notifications sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send escrow auto-released notification'
            );
            throw error;
        }
    }

    async handleInvoicePaid(event: DomainEvent): Promise<void> {
        try {
            const { stripe_invoice_id, amount_paid, paid_at } = event.payload;

            this.logger.info({ stripe_invoice_id, amount_paid }, 'Handling invoice paid notification');

            const amount = `$${Number(amount_paid / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            // Resolve company from the invoice metadata in the event payload
            const { company_id, invoice_number, placement_id } = event.payload;

            if (!company_id) {
                this.logger.warn({ stripe_invoice_id }, 'No company_id in invoice paid event, skipping');
                return;
            }

            const company = await this.dataLookup.getCompany(company_id);
            if (!company?.identity_organization_id) {
                this.logger.warn({ company_id }, 'Company or organization not found for invoice');
                return;
            }

            const placement = placement_id ? await this.dataLookup.getPlacement(placement_id) : null;
            const job = placement ? await this.dataLookup.getJob(placement.job_id) : null;

            const admins = await this.contactLookup.getCompanyAdminContacts(company.identity_organization_id);
            for (const admin of admins) {
                await this.emailService.sendInvoicePaid(admin.email, {
                    companyName: company.name,
                    amount,
                    invoiceNumber: invoice_number,
                    placementTitle: job?.title,
                    billingUrl: `${this.portalUrl}/portal/billing`,
                    companyId: company_id,
                });
            }

            this.logger.info(
                { stripe_invoice_id, company_id, adminCount: admins.length },
                'Invoice paid notifications sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send invoice paid notification'
            );
            throw error;
        }
    }

    async handleSubscriptionCancelled(event: DomainEvent): Promise<void> {
        try {
            const { stripe_subscription_id, company_id, plan_name, end_date } = event.payload;

            this.logger.info({ stripe_subscription_id, company_id }, 'Handling subscription cancelled notification');

            if (!company_id) {
                this.logger.warn({ stripe_subscription_id }, 'No company_id in subscription cancelled event, skipping');
                return;
            }

            const company = await this.dataLookup.getCompany(company_id);
            if (!company?.identity_organization_id) {
                this.logger.warn({ company_id }, 'Company or organization not found for subscription');
                return;
            }

            const admins = await this.contactLookup.getCompanyAdminContacts(company.identity_organization_id);
            for (const admin of admins) {
                await this.emailService.sendSubscriptionCancelled(admin.email, {
                    companyName: company.name,
                    planName: plan_name,
                    endDate: end_date,
                    billingUrl: `${this.portalUrl}/portal/billing`,
                    companyId: company_id,
                });
            }

            this.logger.info(
                { stripe_subscription_id, company_id, adminCount: admins.length },
                'Subscription cancelled notifications sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send subscription cancelled notification'
            );
            throw error;
        }
    }

    /**
     * Helper to resolve a placement from a payout schedule ID.
     * Queries payout_schedules table to find the associated placement.
     */
    private async resolvePayoutPlacement(scheduleId: string) {
        // Try to get placement directly from the schedule's placement_id
        // The payout schedule should reference a placement
        const placement = await this.dataLookup.getPlacement(scheduleId);
        return placement;
    }
}
