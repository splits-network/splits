/**
 * Calls Event Consumer
 * Handles call lifecycle events: created (scheduled + instant),
 * cancelled, rescheduled, and recording_ready.
 *
 * Sends email notifications to all call participants and creates
 * in-app notifications for each.
 */

import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { CallsEmailService } from '../../services/calls/service.js';
import { CallInAppNotificationService } from '../../services/calls/in-app-service.js';
import { ContactLookupHelper } from '../../helpers/contact-lookup.js';
import { DataLookupHelper } from '../../helpers/data-lookup.js';
import { EmailSource } from '../../templates/base.js';

/** Normalized call event payload (camelCase, after normalizePayload) */
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
    /** Reminder-specific */
    reminderType?: string;
    /** Decline-specific */
    declinedBy?: string;
    /** Participant joined-specific */
    participantUserId?: string;
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
        private inAppService: CallInAppNotificationService,
        private logger: Logger,
        private portalUrl: string,
        private candidateWebsiteUrl: string,
        private contactLookup: ContactLookupHelper,
        private dataLookup: DataLookupHelper,
    ) {}

    /** Build a map of userId -> isCandidate for all contacts */
    private async buildCandidateStatusMap(contacts: ParticipantContact[]): Promise<Map<string, boolean>> {
        const statusMap = new Map<string, boolean>();
        for (const contact of contacts) {
            statusMap.set(contact.userId, await this.dataLookup.isCandidate(contact.userId));
        }
        return statusMap;
    }

    /** Get the join URL for a call participant based on candidate status */
    private getJoinUrl(callId: string, isCandidate: boolean): string {
        const baseUrl = isCandidate ? this.candidateWebsiteUrl : this.portalUrl;
        return `${baseUrl}/portal/calls/${callId}/join`;
    }

    /** Get the detail URL for a call participant based on candidate status */
    private getDetailUrl(callId: string, isCandidate: boolean): string {
        if (isCandidate) {
            return `${this.candidateWebsiteUrl}/portal/dashboard`;
        }
        return `${this.portalUrl}/portal/calls/${callId}`;
    }

    /** Normalize snake_case payload from call-service to camelCase */
    private normalizePayload(raw: any): CallEventPayload {
        const participants = (raw.participants || []).map((p: any) => ({
            userId: p.userId || p.user_id || '',
            role: p.role,
            email: p.email,
            first_name: p.first_name,
            last_name: p.last_name,
        })).filter((p: any) => p.userId);

        return {
            callId: raw.callId || raw.call_id,
            title: raw.title,
            scheduledAt: raw.scheduledAt || raw.scheduled_at,
            agenda: raw.agenda,
            createdBy: raw.createdBy || raw.created_by,
            cancelledBy: raw.cancelledBy || raw.cancelled_by,
            cancelReason: raw.cancelReason || raw.cancel_reason,
            newScheduledAt: raw.newScheduledAt || raw.new_scheduled_at,
            participants,
            entityLinks: raw.entityLinks || raw.entity_links?.map((l: any) => ({
                entityType: l.entityType || l.entity_type,
                entityId: l.entityId || l.entity_id,
            })),
            joinUrl: raw.joinUrl,
            recordingId: raw.recordingId,
            duration: raw.duration,
            reminderType: raw.reminderType || raw.reminder_type,
            declinedBy: raw.declinedBy || raw.declined_by,
            participantUserId: raw.participantUserId || raw.participant_user_id,
        };
    }

    // ─── Call Created ────────────────────────────────────────────────────────

    async handleCallCreated(event: DomainEvent): Promise<void> {
        try {
            const payload = this.normalizePayload(event.payload);
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
            const payload = this.normalizePayload(event.payload);
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

                await this.inAppService.notifyCancellation(contact.userId, {
                    callId,
                    title: payload.title,
                    cancelledByName,
                    reason: payload.cancelReason,
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
            const payload = this.normalizePayload(event.payload);
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
            const candidateStatus = await this.buildCandidateStatusMap(contacts);

            for (const contact of contacts) {
                const isCandidate = candidateStatus.get(contact.userId) || false;
                const joinUrl = payload.joinUrl || this.getDetailUrl(callId, isCandidate);

                await this.emailService.sendRescheduleNotification(contact.email, {
                    title: payload.title || undefined,
                    participantNames: allNames.filter(n => n !== contact.name),
                    newDateTime,
                    entityContext,
                    joinUrl,
                    source,
                    userId: contact.userId,
                });

                await this.inAppService.notifyReschedule(contact.userId, {
                    callId,
                    title: payload.title,
                    newDateTime,
                    isCandidate,
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
            const payload = this.normalizePayload(event.payload);
            const { callId } = payload;

            this.logger.info({ callId }, 'Processing call recording ready notification');

            const contacts = await this.resolveParticipantContacts(payload.participants);
            if (contacts.length === 0) return;

            const entityContext = await this.resolveEntityContext(payload.entityLinks);
            const source = this.determineBrand(payload.entityLinks);
            const allNames = contacts.map(c => c.name);
            const callDate = payload.scheduledAt
                ? formatDateTime(payload.scheduledAt)
                : 'Recent call';
            const candidateStatus = await this.buildCandidateStatusMap(contacts);

            for (const contact of contacts) {
                const isCandidate = candidateStatus.get(contact.userId) || false;
                const viewRecordingUrl = this.getDetailUrl(callId, isCandidate);

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

                await this.inAppService.notifyRecordingReady(contact.userId, {
                    callId,
                    title: payload.title,
                    callDate,
                    isCandidate,
                });
            }

            this.logger.info(
                { callId, recipientCount: contacts.length },
                'Call recording ready notifications sent'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to process call.recording_ready'
            );
            throw error;
        }
    }

    // ─── Starting Soon (5-min toast) ────────────────────────────────────────

    async handleStartingSoon(event: DomainEvent): Promise<void> {
        try {
            const payload = this.normalizePayload(event.payload);
            const { callId } = payload;

            this.logger.info({ callId }, 'Processing call starting soon notification');

            const contacts = await this.resolveParticipantContacts(payload.participants || []);
            if (contacts.length === 0) return;

            const allNames = contacts.map(c => c.name);

            const dateTime = payload.scheduledAt
                ? formatDateTime(payload.scheduledAt)
                : 'Now';

            const candidateStatus = await this.buildCandidateStatusMap(contacts);

            // Send email reminder
            for (const contact of contacts) {
                const isCandidate = candidateStatus.get(contact.userId) || false;

                await this.emailService.sendReminder(contact.email, {
                    title: payload.title || undefined,
                    participantNames: allNames.filter(n => n !== contact.name),
                    dateTime,
                    timeUntil: '5 minutes',
                    joinUrl: this.getJoinUrl(callId, isCandidate),
                    entityContext: undefined,
                    source: 'portal',
                    userId: contact.userId,
                });
            }

            // Send in-app toast notification
            for (const contact of contacts) {
                const isCandidate = candidateStatus.get(contact.userId) || false;

                await this.inAppService.notifyStartingSoon(contact.userId, {
                    callId,
                    title: payload.title,
                    scheduledAt: payload.scheduledAt || new Date().toISOString(),
                    participantNames: allNames.filter(n => n !== contact.name),
                    isCandidate,
                });
            }

            this.logger.info(
                { callId, recipientCount: contacts.length },
                'Call starting soon notifications sent',
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to process call.starting_soon',
            );
            throw error;
        }
    }

    // ─── Call Reminder (24h / 1h) ────────────────────────────────────────────

    async handleReminder(event: DomainEvent): Promise<void> {
        try {
            const payload = this.normalizePayload(event.payload);
            const { callId, reminderType } = payload;

            this.logger.info({ callId, reminderType }, 'Processing call reminder notification');

            const contacts = await this.resolveParticipantContacts(payload.participants || []);
            if (contacts.length === 0) return;

            const allNames = contacts.map(c => c.name);
            const entityContext = await this.resolveEntityContext(payload.entityLinks);
            const source = this.determineBrand(payload.entityLinks);

            const dateTime = payload.scheduledAt
                ? formatDateTime(payload.scheduledAt)
                : 'Upcoming';

            const timeUntil = reminderType === '24h' ? '24 hours' : '1 hour';
            const candidateStatus = await this.buildCandidateStatusMap(contacts);

            for (const contact of contacts) {
                const isCandidate = candidateStatus.get(contact.userId) || false;

                await this.emailService.sendReminder(contact.email, {
                    title: payload.title || undefined,
                    participantNames: allNames.filter(n => n !== contact.name),
                    dateTime,
                    timeUntil,
                    joinUrl: this.getJoinUrl(callId, isCandidate),
                    entityContext,
                    source,
                    userId: contact.userId,
                });
            }

            // No in-app toast for 24h/1h reminders (only 5-min starting_soon gets toast)

            this.logger.info(
                { callId, recipientCount: contacts.length, reminderType },
                'Call reminder notifications sent',
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to process call.reminder',
            );
            throw error;
        }
    }

    // ─── Call Declined ────────────────────────────────────────────────────────

    async handleCallDeclined(event: DomainEvent): Promise<void> {
        try {
            const payload = this.normalizePayload(event.payload);
            const { callId, declinedBy } = payload;

            this.logger.info({ callId, declinedBy }, 'Processing call declined notification');

            if (!declinedBy) {
                this.logger.warn({ callId }, 'call.declined event missing declinedBy');
                return;
            }

            // Resolve who declined
            let declinedByName = 'A participant';
            const declinerContact = await this.contactLookup.getContactByUserId(declinedBy);
            if (declinerContact) declinedByName = declinerContact.name;

            // Notify the call creator (and other participants except the decliner)
            const contacts = await this.resolveParticipantContacts(
                (payload.participants || []).filter(p => p.userId !== declinedBy),
            );
            if (contacts.length === 0) return;

            const candidateStatus = await this.buildCandidateStatusMap(contacts);

            for (const contact of contacts) {
                const isCandidate = candidateStatus.get(contact.userId) || false;

                await this.inAppService.notifyDecline(contact.userId, {
                    callId,
                    title: payload.title,
                    declinedByName,
                    isCandidate,
                });
            }

            this.logger.info(
                { callId, recipientCount: contacts.length, declinedByName },
                'Call declined notifications sent',
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to process call.declined',
            );
            throw error;
        }
    }

    // ─── Participant Joined ───────────────────────────────────────────────────

    async handleParticipantJoined(event: DomainEvent): Promise<void> {
        try {
            const payload = this.normalizePayload(event.payload);
            const { callId, participantUserId } = payload;

            this.logger.info({ callId, participantUserId }, 'Processing participant joined notification');

            if (!participantUserId) {
                this.logger.warn({ callId }, 'call.participant.joined event missing participantUserId');
                return;
            }

            // Resolve who joined
            let participantName = 'Someone';
            const joinedContact = await this.contactLookup.getContactByUserId(participantUserId);
            if (joinedContact) participantName = joinedContact.name;

            // Notify other participants (not the one who joined)
            const contacts = await this.resolveParticipantContacts(
                (payload.participants || []).filter(p => p.userId !== participantUserId),
            );
            if (contacts.length === 0) return;

            const candidateStatus = await this.buildCandidateStatusMap(contacts);

            for (const contact of contacts) {
                const isCandidate = candidateStatus.get(contact.userId) || false;

                await this.inAppService.notifyParticipantJoined(contact.userId, {
                    callId,
                    title: payload.title,
                    participantName,
                    isCandidate,
                });
            }

            this.logger.info(
                { callId, recipientCount: contacts.length, participantName },
                'Participant joined notifications sent',
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to process call.participant.joined',
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
        const candidateStatus = await this.buildCandidateStatusMap(contacts);

        for (const contact of contacts) {
            const isCandidate = candidateStatus.get(contact.userId) || false;
            const joinUrl = payload.joinUrl || this.getJoinUrl(callId, isCandidate);
            const portalDetailUrl = this.getDetailUrl(callId, isCandidate);

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

            // In-app notification for scheduled calls (excluding creator)
            if (contact.userId !== payload.createdBy) {
                await this.inAppService.notifyScheduledCall(contact.userId, {
                    callId,
                    title: payload.title,
                    scheduledAt: payload.scheduledAt!,
                    participantNames: allNames.filter(n => n !== contact.name),
                    isCandidate,
                });
            }
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
        const candidateStatus = await this.buildCandidateStatusMap(contacts);

        for (const contact of contacts) {
            const isCandidate = candidateStatus.get(contact.userId) || false;
            const joinUrl = payload.joinUrl || this.getJoinUrl(callId, isCandidate);

            await this.emailService.sendInstantCallNotification(contact.email, {
                callerName,
                joinUrl,
                entityContext,
                source,
                userId: contact.userId,
            });

            await this.inAppService.notifyInstantCall(contact.userId, {
                callId,
                callerName,
                joinUrl,
                isCandidate,
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
