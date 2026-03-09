/**
 * Calls Event Consumer
 * Handles call lifecycle events: created (scheduled + instant),
 * cancelled, rescheduled, and recording.ready.
 *
 * Sends email notifications to all call participants and creates
 * in-app notifications for each.
 */

import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { CallsEmailService } from '../../services/calls/service';
import { ContactLookupHelper } from '../../helpers/contact-lookup';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { EmailSource } from '../../templates/base';

/** Shape of call event payloads from call-service */
interface CallEventPayload {
    callId: string;
    title?: string;
    scheduledAt?: string;
    agenda?: string;
    createdBy: string;
    cancelledBy?: string;
    cancelReason?: string;
    newScheduledAt?: string;
    participants: Array<{ userId: string; role: string }>;
    entityLinks?: Array<{ entityType: string; entityId: string }>;
    joinUrl?: string;
    recordingId?: string;
    duration?: number;
}

interface ParticipantContact {
    userId: string;
    name: string;
    email: string;
}

function formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    });
}

export class CallsEventConsumer {
    constructor(
        private emailService: CallsEmailService,
        private logger: Logger,
        private portalUrl: string,
        private contactLookup: ContactLookupHelper,
        private dataLookup: DataLookupHelper
    ) {}

    // ─── Call Created ────────────────────────────────────────────────────────

    async handleCallCreated(event: DomainEvent): Promise<void> {
        try {
            const payload = event.payload as CallEventPayload;
            const { callId, scheduledAt } = payload;

            this.logger.info({ callId }, 'Processing call created notification');

            if (scheduledAt) {
                await this.sendScheduledCallConfirmation(payload);
            } else {
                await this.sendInstantCallNotification(payload);
            }
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to process call.created'
            );
            throw error;
        }
    }

    // ─── Call Cancelled ──────────────────────────────────────────────────────

    async handleCallCancelled(event: DomainEvent): Promise<void> {
        try {
            const payload = event.payload as CallEventPayload;
            const { callId } = payload;

            this.logger.info({ callId }, 'Processing call cancelled notification');

            const contacts = await this.resolveParticipantContacts(payload.participants);
            if (contacts.length === 0) return;

            const entityContext = await this.resolveEntityContext(payload.entityLinks);
            const source = this.determineBrand(payload.entityLinks);
            const allNames = contacts.map(c => c.name);

            // Resolve who cancelled
            let cancelledByName = 'A participant';
            if (payload.cancelledBy) {
                const cancellerContact = await this.contactLookup.getContactByUserId(payload.cancelledBy);
                if (cancellerContact) cancelledByName = cancellerContact.name;
            }

            for (const contact of contacts) {
                await this.emailService.sendCancellation(contact.email, {
                    title: payload.title || undefined,
                    participantNames: allNames.filter(n => n !== contact.name),
                    cancelledByName,
                    reason: payload.cancelReason || undefined,
                    originalDateTime: payload.scheduledAt ? formatDateTime(payload.scheduledAt) : undefined,
                    entityContext,
                    source,
                    userId: contact.userId,
                });
            }

            this.logger.info(
                { callId, recipientCount: contacts.length },
                'Call cancelled notifications sent'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to process call.cancelled'
            );
            throw error;
        }
    }

    // ─── Call Rescheduled ────────────────────────────────────────────────────

    async handleCallRescheduled(event: DomainEvent): Promise<void> {
        try {
            const payload = event.payload as CallEventPayload;
            const { callId } = payload;

            this.logger.info({ callId }, 'Processing call rescheduled notification');

            const contacts = await this.resolveParticipantContacts(payload.participants);
            if (contacts.length === 0) return;

            const entityContext = await this.resolveEntityContext(payload.entityLinks);
            const source = this.determineBrand(payload.entityLinks);
            const allNames = contacts.map(c => c.name);
            const newDateTime = payload.newScheduledAt
                ? formatDateTime(payload.newScheduledAt)
                : 'TBD';
            const joinUrl = payload.joinUrl || `${this.portalUrl}/portal/calls/${callId}`;

            for (const contact of contacts) {
                await this.emailService.sendRescheduleNotification(contact.email, {
                    title: payload.title || undefined,
                    participantNames: allNames.filter(n => n !== contact.name),
                    newDateTime,
                    entityContext,
                    joinUrl,
                    source,
                    userId: contact.userId,
                });
            }

            this.logger.info(
                { callId, recipientCount: contacts.length },
                'Call rescheduled notifications sent'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to process call.rescheduled'
            );
            throw error;
        }
    }

    // ─── Recording Ready ─────────────────────────────────────────────────────

    async handleRecordingReady(event: DomainEvent): Promise<void> {
        try {
            const payload = event.payload as CallEventPayload;
            const { callId } = payload;

            this.logger.info({ callId }, 'Processing call recording ready notification');

            const contacts = await this.resolveParticipantContacts(payload.participants);
            if (contacts.length === 0) return;

            const entityContext = await this.resolveEntityContext(payload.entityLinks);
            const source = this.determineBrand(payload.entityLinks);
            const allNames = contacts.map(c => c.name);
            const viewRecordingUrl = `${this.portalUrl}/portal/calls/${callId}`;
            const callDate = payload.scheduledAt
                ? formatDateTime(payload.scheduledAt)
                : 'Recent call';

            for (const contact of contacts) {
                await this.emailService.sendRecordingReady(contact.email, {
                    title: payload.title || undefined,
                    participantNames: allNames.filter(n => n !== contact.name),
                    callDate,
                    duration: payload.duration || undefined,
                    viewRecordingUrl,
                    entityContext,
                    source,
                    userId: contact.userId,
                });
            }

            this.logger.info(
                { callId, recipientCount: contacts.length },
                'Call recording ready notifications sent'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to process call.recording.ready'
            );
            throw error;
        }
    }

    // ─── Private: Scheduled Call Confirmation ────────────────────────────────

    private async sendScheduledCallConfirmation(payload: CallEventPayload): Promise<void> {
        const { callId } = payload;

        const contacts = await this.resolveParticipantContacts(payload.participants);
        if (contacts.length === 0) return;

        const entityContext = await this.resolveEntityContext(payload.entityLinks);
        const source = this.determineBrand(payload.entityLinks);
        const allNames = contacts.map(c => c.name);
        const dateTime = formatDateTime(payload.scheduledAt!);
        const joinUrl = payload.joinUrl || `${this.portalUrl}/portal/calls/${callId}`;
        const portalDetailUrl = `${this.portalUrl}/portal/calls/${callId}`;

        for (const contact of contacts) {
            await this.emailService.sendConfirmation(contact.email, {
                title: payload.title || undefined,
                participantNames: allNames.filter(n => n !== contact.name),
                dateTime,
                agenda: payload.agenda || undefined,
                joinUrl,
                portalUrl: portalDetailUrl,
                entityContext,
                source,
                userId: contact.userId,
            });
        }

        this.logger.info(
            { callId, recipientCount: contacts.length },
            'Scheduled call confirmation notifications sent'
        );
    }

    // ─── Private: Instant Call Notification ───────────────────────────────────

    private async sendInstantCallNotification(payload: CallEventPayload): Promise<void> {
        const { callId, createdBy } = payload;

        // Exclude the creator from notification recipients
        const nonCreatorParticipants = payload.participants.filter(
            p => p.userId !== createdBy
        );

        const contacts = await this.resolveParticipantContacts(nonCreatorParticipants);
        if (contacts.length === 0) return;

        // Resolve caller name
        let callerName = 'Someone';
        const callerContact = await this.contactLookup.getContactByUserId(createdBy);
        if (callerContact) callerName = callerContact.name;

        const entityContext = await this.resolveEntityContext(payload.entityLinks);
        const source = this.determineBrand(payload.entityLinks);
        const joinUrl = payload.joinUrl || `${this.portalUrl}/portal/calls/${callId}`;

        for (const contact of contacts) {
            await this.emailService.sendInstantCallNotification(contact.email, {
                callerName,
                joinUrl,
                entityContext,
                source,
                userId: contact.userId,
            });
        }

        this.logger.info(
            { callId, recipientCount: contacts.length, callerName },
            'Instant call notifications sent'
        );
    }

    // ─── Context Resolution ──────────────────────────────────────────────────

    /**
     * Resolve participant user IDs to contact info (name + email).
     */
    private async resolveParticipantContacts(
        participants: Array<{ userId: string; role: string }>
    ): Promise<ParticipantContact[]> {
        const contacts: ParticipantContact[] = [];

        for (const participant of participants) {
            const contact = await this.contactLookup.getContactByUserId(participant.userId);
            if (contact) {
                contacts.push({
                    userId: participant.userId,
                    name: contact.name,
                    email: contact.email,
                });
            } else {
                this.logger.warn(
                    { userId: participant.userId },
                    'Could not resolve contact for call participant'
                );
            }
        }

        if (contacts.length === 0) {
            this.logger.error('No participant contacts resolved for call notification');
        }

        return contacts;
    }

    /**
     * Resolve entity link context (company name, job title) for email content.
     */
    private async resolveEntityContext(
        entityLinks?: Array<{ entityType: string; entityId: string }>
    ): Promise<{ companyName?: string; jobTitle?: string } | undefined> {
        if (!entityLinks || entityLinks.length === 0) return undefined;

        let companyName: string | undefined;
        let jobTitle: string | undefined;

        for (const link of entityLinks) {
            if (link.entityType === 'company' && !companyName) {
                const company = await this.dataLookup.getCompany(link.entityId);
                if (company) companyName = company.name;
            }

            if (link.entityType === 'job' && !jobTitle) {
                const job = await this.dataLookup.getJob(link.entityId);
                if (job) {
                    jobTitle = job.title;
                    if (!companyName && job.company?.name) {
                        companyName = job.company.name;
                    }
                }
            }
        }

        if (!companyName && !jobTitle) return undefined;
        return { companyName, jobTitle };
    }

    /**
     * Determine email brand from entity links.
     * Candidate-related entities use applicant.network brand.
     */
    private determineBrand(
        entityLinks?: Array<{ entityType: string; entityId: string }>
    ): EmailSource {
        if (!entityLinks) return 'portal';

        const hasCandidateEntity = entityLinks.some(
            link => link.entityType === 'candidate'
        );

        return hasCandidateEntity ? 'candidate' : 'portal';
    }
}
