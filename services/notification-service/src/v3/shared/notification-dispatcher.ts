/**
 * Notification Dispatcher
 *
 * Determines recipients for each event, selects notification channels
 * (email, in-app, SMS), renders templates via the existing email services,
 * sends via the appropriate provider (Resend for email), and logs to
 * the notification_log table.
 *
 * This is a high-level orchestrator that delegates to the existing
 * domain-specific email services for actual template rendering and sending.
 * The email services already handle Resend integration and notification logging.
 */

import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { NotificationRepository } from '../../repository.js';
import { ContactLookupHelper, Contact } from '../../helpers/contact-lookup.js';
import { DataLookupHelper } from '../../helpers/data-lookup.js';
import { NotificationChannel } from '../../helpers/email-entitlement-gate.js';

/** Channel resolution result */
interface ChannelDecision {
    recipient: Contact;
    channel: NotificationChannel | null;
    category: string | null;
}

/**
 * Resolves channel entitlements and user preferences for a recipient.
 * Returns null channel if the notification should be suppressed.
 */
export class NotificationDispatcher {
    constructor(
        private repository: NotificationRepository,
        private contactLookup: ContactLookupHelper,
        private dataLookup: DataLookupHelper,
        private logger: Logger,
    ) {}

    /**
     * Resolve the effective notification channel for a recipient,
     * applying both entitlement gating and user preference gating.
     */
    async resolveRecipientChannel(
        recipientUserId: string | null | undefined,
        requestedChannel: NotificationChannel,
        category: string | null,
    ): Promise<NotificationChannel | null> {
        return this.repository.resolveChannelWithPreferences(
            recipientUserId,
            requestedChannel,
            category,
        );
    }

    /**
     * Resolve a recruiter recipient with channel gating.
     */
    async resolveRecruiterRecipient(
        recruiterId: string,
        requestedChannel: NotificationChannel,
        category: string | null,
    ): Promise<ChannelDecision | null> {
        const contact = await this.contactLookup.getRecruiterContact(recruiterId);
        if (!contact) {
            this.logger.warn({ recruiterId }, 'Recruiter contact not found for dispatch');
            return null;
        }

        const channel = await this.resolveRecipientChannel(
            contact.user_id, requestedChannel, category,
        );

        return { recipient: contact, channel, category };
    }

    /**
     * Resolve a candidate recipient with channel gating.
     */
    async resolveCandidateRecipient(
        candidateId: string,
        requestedChannel: NotificationChannel,
        category: string | null,
    ): Promise<ChannelDecision | null> {
        const contact = await this.contactLookup.getCandidateContact(candidateId);
        if (!contact) {
            this.logger.warn({ candidateId }, 'Candidate contact not found for dispatch');
            return null;
        }

        const channel = await this.resolveRecipientChannel(
            contact.user_id, requestedChannel, category,
        );

        return { recipient: contact, channel, category };
    }

    /**
     * Resolve company admin recipients with channel gating.
     * Returns an array since a company may have multiple admins.
     */
    async resolveCompanyAdminRecipients(
        organizationId: string,
        requestedChannel: NotificationChannel,
        category: string | null,
    ): Promise<ChannelDecision[]> {
        const contacts = await this.contactLookup.getCompanyAdminContacts(organizationId);
        const decisions: ChannelDecision[] = [];

        for (const contact of contacts) {
            const channel = await this.resolveRecipientChannel(
                contact.user_id, requestedChannel, category,
            );
            decisions.push({ recipient: contact, channel, category });
        }

        return decisions;
    }

    /**
     * Categorize an event type into a notification category for preference lookups.
     * Maps event types to human-friendly categories.
     */
    categorizeEvent(eventType: string): string {
        const prefix = eventType.split('.')[0];

        const categoryMap: Record<string, string> = {
            application: 'applications',
            ai_review: 'applications',
            placement: 'placements',
            guarantee: 'placements',
            replacement: 'placements',
            candidate: 'candidates',
            ownership: 'candidates',
            collaborator: 'collaboration',
            reputation: 'reputation',
            company_reputation: 'reputation',
            invitation: 'invitations',
            company_invitation: 'invitations',
            firm: 'invitations',
            recruiter_company: 'relationships',
            recruiter_candidate: 'relationships',
            recruiter: 'billing',
            company: 'billing',
            payout: 'billing',
            payout_transaction: 'billing',
            escrow: 'billing',
            invoice: 'billing',
            subscription: 'billing',
            status: 'support',
            support_ticket: 'support',
            chat: 'messaging',
            user: 'onboarding',
            job: 'jobs',
            job_recommendation: 'jobs',
            fraud_signal: 'security',
            gpt: 'security',
            recruiter_code: 'referrals',
            resume: 'documents',
            system: 'system',
            match: 'matches',
            call: 'calls',
            badge: 'gamification',
            level: 'gamification',
            streak: 'gamification',
        };

        return categoryMap[prefix] || 'general';
    }

    /**
     * Check if a notification was already sent (deduplication).
     * Uses event_type + recipient_email for matching.
     */
    async wasAlreadySent(
        eventType: string,
        recipientEmail: string,
        sinceDateIso?: string,
    ): Promise<boolean> {
        return this.dataLookup.wasMilestoneSent(eventType, recipientEmail);
    }
}
