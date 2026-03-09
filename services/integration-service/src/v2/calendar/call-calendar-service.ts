import { Logger } from '@splits-network/shared-logging';
import { ConnectionRepository } from '../connections/repository';
import { TokenRefreshService } from './token-refresh';
import { CalendarService, CreateCalendarEventParams, UpdateCalendarEventParams } from './service';
import { CallCalendarRepository } from './call-calendar-repository';

/* ── Input types ───────────────────────────────────────────────────────── */

export interface CallParticipantInfo {
    userId: string;
    clerkUserId: string;
    email: string;
    name: string;
}

export interface CreateCallCalendarEventParams {
    callId: string;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
    agenda: string | null;
    participants: CallParticipantInfo[];
    joinUrl: string;
    timeZone?: string;
}

export interface UpdateCallCalendarEventParams {
    callId: string;
    newScheduledAt: string;
    newDurationMinutes?: number;
    title?: string;
    agenda?: string | null;
    joinUrl?: string;
    timeZone?: string;
}

/* ── Service ───────────────────────────────────────────────────────────── */

export class CallCalendarService {
    constructor(
        private calendarService: CalendarService,
        private callCalendarRepo: CallCalendarRepository,
        private connectionRepo: ConnectionRepository,
        private tokenRefresh: TokenRefreshService,
        private logger: Logger,
    ) {}

    /**
     * Create calendar events for all participants with connected calendars.
     * Skips participants without a calendar connection.
     */
    async createCallCalendarEvents(params: CreateCallCalendarEventParams): Promise<number> {
        const {
            callId, title, scheduledAt, durationMinutes,
            agenda, participants, joinUrl, timeZone = 'UTC',
        } = params;

        const endAt = new Date(new Date(scheduledAt).getTime() + durationMinutes * 60_000).toISOString();
        const attendeeEmails = participants.map(p => p.email);

        const description = this.buildDescription(agenda, joinUrl);
        let createdCount = 0;

        for (const participant of participants) {
            try {
                const connection = await this.findCalendarConnection(participant.clerkUserId);
                if (!connection) {
                    this.logger.debug(
                        { userId: participant.userId, callId },
                        'No calendar connection for participant, skipping',
                    );
                    continue;
                }

                const calendarId = await this.getPrimaryCalendarId(connection.id, participant.clerkUserId);
                const eventParams: CreateCalendarEventParams = {
                    calendarId,
                    summary: title,
                    description,
                    location: joinUrl,
                    startDateTime: scheduledAt,
                    endDateTime: endAt,
                    timeZone,
                    attendeeEmails,
                    addVideoConference: false,
                };

                const event = await this.calendarService.createEvent(
                    connection.id, participant.clerkUserId, eventParams,
                );

                await this.callCalendarRepo.create({
                    call_id: callId,
                    user_id: participant.userId,
                    connection_id: connection.id,
                    calendar_id: calendarId,
                    provider_event_id: event.id,
                });

                createdCount++;
                this.logger.info(
                    { callId, userId: participant.userId, eventId: event.id },
                    'Calendar event created for call participant',
                );
            } catch (err) {
                this.logger.error(
                    { err, callId, userId: participant.userId },
                    'Failed to create calendar event for participant, continuing',
                );
            }
        }

        return createdCount;
    }

    /**
     * Update all calendar events for a call with new time.
     */
    async updateCallCalendarEvents(params: UpdateCallCalendarEventParams): Promise<number> {
        const { callId, newScheduledAt, newDurationMinutes, title, agenda, joinUrl, timeZone = 'UTC' } = params;

        const calendarEvents = await this.callCalendarRepo.findByCallId(callId);
        if (calendarEvents.length === 0) return 0;

        let updatedCount = 0;

        for (const calEvent of calendarEvents) {
            try {
                const connection = await this.connectionRepo.findById(calEvent.connection_id);
                if (!connection || connection.status !== 'active') {
                    this.logger.warn(
                        { callId, connectionId: calEvent.connection_id },
                        'Calendar connection inactive, skipping update',
                    );
                    continue;
                }

                const updateParams: UpdateCalendarEventParams = {
                    calendarId: calEvent.calendar_id,
                    startDateTime: newScheduledAt,
                    timeZone,
                };

                if (newDurationMinutes) {
                    updateParams.endDateTime = new Date(
                        new Date(newScheduledAt).getTime() + newDurationMinutes * 60_000,
                    ).toISOString();
                }

                if (title) updateParams.summary = title;
                if (agenda !== undefined || joinUrl) {
                    updateParams.description = this.buildDescription(agenda ?? null, joinUrl);
                }
                if (joinUrl) updateParams.location = joinUrl;

                await this.calendarService.updateEvent(
                    connection.id, connection.clerk_user_id, calEvent.calendar_id,
                    calEvent.provider_event_id, updateParams,
                );

                updatedCount++;
            } catch (err) {
                this.logger.error(
                    { err, callId, eventId: calEvent.provider_event_id },
                    'Failed to update calendar event, continuing',
                );
            }
        }

        return updatedCount;
    }

    /**
     * Delete all calendar events for a cancelled call.
     */
    async deleteCallCalendarEvents(callId: string): Promise<number> {
        const calendarEvents = await this.callCalendarRepo.findByCallId(callId);
        if (calendarEvents.length === 0) return 0;

        let deletedCount = 0;

        for (const calEvent of calendarEvents) {
            try {
                const connection = await this.connectionRepo.findById(calEvent.connection_id);
                if (!connection || connection.status !== 'active') continue;

                await this.calendarService.deleteEvent(
                    connection.id, connection.clerk_user_id,
                    calEvent.calendar_id, calEvent.provider_event_id,
                );

                deletedCount++;
            } catch (err) {
                this.logger.error(
                    { err, callId, eventId: calEvent.provider_event_id },
                    'Failed to delete calendar event, continuing',
                );
            }
        }

        await this.callCalendarRepo.deleteByCallId(callId);
        return deletedCount;
    }

    /* ── Private helpers ───────────────────────────────────────────────── */

    private buildDescription(agenda: string | null, joinUrl?: string): string {
        const parts: string[] = [];
        if (agenda) parts.push(agenda);
        if (joinUrl) parts.push(`\nJoin video call: ${joinUrl}`);
        return parts.join('\n') || 'Splits Network Call';
    }

    /**
     * Find the first active calendar connection for a user.
     * Checks google_calendar first, then microsoft_calendar.
     */
    private async findCalendarConnection(clerkUserId: string) {
        const googleConn = await this.connectionRepo.findByUserAndProvider(clerkUserId, 'google_calendar');
        if (googleConn) return googleConn;

        const msConn = await this.connectionRepo.findByUserAndProvider(clerkUserId, 'microsoft_calendar');
        return msConn;
    }

    /**
     * Get the primary calendar ID for a connection.
     * Defaults to 'primary' for Google, or the first writable calendar for Microsoft.
     */
    private async getPrimaryCalendarId(connectionId: string, clerkUserId: string): Promise<string> {
        try {
            const calendars = await this.calendarService.listCalendars(connectionId, clerkUserId);
            const primary = calendars.find(c => c.primary);
            return primary?.id ?? 'primary';
        } catch {
            return 'primary';
        }
    }
}
