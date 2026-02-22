import { Logger } from '@splits-network/shared-logging';
import { ConnectionRepository } from '../connections/repository';
import { TokenRefreshService } from './token-refresh';
import { GoogleCalendarClient, CreateEventParams as GoogleCreateParams } from './google-client';
import { MicrosoftCalendarClient, MicrosoftCreateEventParams } from './microsoft-client';
import type { CalendarInfo, CalendarEvent, CalendarBusySlot } from '@splits-network/shared-types';

/* ── Unified create-event params ─────────────────────────────────────── */

export interface CreateCalendarEventParams {
    calendarId: string;
    summary: string;
    description?: string;
    location?: string;
    startDateTime: string;
    endDateTime: string;
    timeZone: string;
    attendeeEmails?: string[];
    addVideoConference?: boolean;
}

/* ── Service ─────────────────────────────────────────────────────────── */

export class CalendarService {
    private googleClient: GoogleCalendarClient;
    private microsoftClient: MicrosoftCalendarClient;

    constructor(
        private connectionRepo: ConnectionRepository,
        private tokenRefresh: TokenRefreshService,
        private logger: Logger,
    ) {
        this.googleClient = new GoogleCalendarClient(logger);
        this.microsoftClient = new MicrosoftCalendarClient(logger);
    }

    /**
     * List all calendars for a given connection — normalized to CalendarInfo.
     */
    async listCalendars(connectionId: string, clerkUserId: string): Promise<CalendarInfo[]> {
        const connection = await this.authorize(connectionId, clerkUserId);
        const token = await this.tokenRefresh.getValidToken(connectionId);

        if (connection.provider_slug.startsWith('google_')) {
            const calendars = await this.googleClient.listCalendars(token);
            return calendars.map(c => ({
                id: c.id,
                summary: c.summary,
                description: c.description,
                timeZone: c.timeZone,
                primary: c.primary,
                accessRole: c.accessRole,
            }));
        }

        if (connection.provider_slug.startsWith('microsoft_')) {
            const calendars = await this.microsoftClient.listCalendars(token);
            return calendars.map(c => ({
                id: c.id,
                summary: c.name,
                primary: c.isDefaultCalendar,
                accessRole: c.canEdit ? 'writer' : 'reader',
            }));
        }

        throw new Error(`Unsupported calendar provider: ${connection.provider_slug}`);
    }

    /**
     * List events in a given time range — normalized to CalendarEvent.
     */
    async listEvents(
        connectionId: string,
        clerkUserId: string,
        calendarId: string,
        timeMin: string,
        timeMax: string,
        maxResults?: number,
    ): Promise<CalendarEvent[]> {
        const connection = await this.authorize(connectionId, clerkUserId);
        const token = await this.tokenRefresh.getValidToken(connectionId);

        if (connection.provider_slug.startsWith('google_')) {
            const events = await this.googleClient.listEvents(token, calendarId, { timeMin, timeMax, maxResults });
            return events.map(e => ({
                id: e.id,
                summary: e.summary,
                description: e.description,
                location: e.location,
                start: e.start,
                end: e.end,
                status: e.status,
                htmlLink: e.htmlLink,
                attendees: e.attendees?.map(a => ({
                    email: a.email,
                    displayName: a.displayName,
                    responseStatus: a.responseStatus,
                })),
                conferenceData: e.conferenceData,
            }));
        }

        if (connection.provider_slug.startsWith('microsoft_')) {
            const events = await this.microsoftClient.listEvents(token, calendarId, { timeMin, timeMax, maxResults });
            return events.map(e => ({
                id: e.id,
                summary: e.subject,
                description: e.bodyPreview,
                location: e.location?.displayName,
                start: { dateTime: e.start.dateTime, timeZone: e.start.timeZone },
                end: { dateTime: e.end.dateTime, timeZone: e.end.timeZone },
                status: e.isCancelled ? 'cancelled' : 'confirmed',
                htmlLink: e.webLink,
                attendees: e.attendees?.map(a => ({
                    email: a.emailAddress.address,
                    displayName: a.emailAddress.name,
                    responseStatus: this.mapMicrosoftResponse(a.status.response),
                })),
                conferenceData: e.onlineMeeting?.joinUrl ? {
                    entryPoints: [{ entryPointType: 'video', uri: e.onlineMeeting.joinUrl }],
                } : undefined,
            }));
        }

        throw new Error(`Unsupported calendar provider: ${connection.provider_slug}`);
    }

    /**
     * Get free/busy information for one or more calendars.
     */
    async getAvailability(
        connectionId: string,
        clerkUserId: string,
        calendarIds: string[],
        timeMin: string,
        timeMax: string,
    ): Promise<Record<string, CalendarBusySlot[]>> {
        const connection = await this.authorize(connectionId, clerkUserId);
        const token = await this.tokenRefresh.getValidToken(connectionId);

        if (connection.provider_slug.startsWith('google_')) {
            return this.googleClient.getFreeBusy(token, calendarIds, timeMin, timeMax);
        }

        if (connection.provider_slug.startsWith('microsoft_')) {
            const userEmail = connection.provider_account_id || '';
            return this.microsoftClient.getFreeBusy(token, calendarIds, timeMin, timeMax, userEmail);
        }

        throw new Error(`Unsupported calendar provider: ${connection.provider_slug}`);
    }

    /**
     * Create a calendar event (interview scheduling).
     * Returns a normalized CalendarEvent.
     */
    async createEvent(
        connectionId: string,
        clerkUserId: string,
        params: CreateCalendarEventParams,
    ): Promise<CalendarEvent> {
        const connection = await this.authorize(connectionId, clerkUserId);
        const token = await this.tokenRefresh.getValidToken(connectionId);

        let event: CalendarEvent;

        if (connection.provider_slug.startsWith('google_')) {
            const googleParams: GoogleCreateParams = {
                calendarId: params.calendarId,
                summary: params.summary,
                description: params.description,
                location: params.location,
                startDateTime: params.startDateTime,
                endDateTime: params.endDateTime,
                timeZone: params.timeZone,
                attendeeEmails: params.attendeeEmails,
                addGoogleMeet: params.addVideoConference,
            };
            const e = await this.googleClient.createEvent(token, googleParams);
            event = {
                id: e.id,
                summary: e.summary,
                description: e.description,
                location: e.location,
                start: e.start,
                end: e.end,
                status: e.status,
                htmlLink: e.htmlLink,
                attendees: e.attendees?.map(a => ({
                    email: a.email,
                    displayName: a.displayName,
                    responseStatus: a.responseStatus,
                })),
                conferenceData: e.conferenceData,
            };
        } else if (connection.provider_slug.startsWith('microsoft_')) {
            const msParams: MicrosoftCreateEventParams = {
                calendarId: params.calendarId,
                summary: params.summary,
                description: params.description,
                location: params.location,
                startDateTime: params.startDateTime,
                endDateTime: params.endDateTime,
                timeZone: params.timeZone,
                attendeeEmails: params.attendeeEmails,
                addTeamsMeeting: params.addVideoConference,
            };
            const e = await this.microsoftClient.createEvent(token, msParams);
            event = {
                id: e.id,
                summary: e.subject,
                description: e.bodyPreview,
                location: e.location?.displayName,
                start: { dateTime: e.start.dateTime, timeZone: e.start.timeZone },
                end: { dateTime: e.end.dateTime, timeZone: e.end.timeZone },
                status: e.isCancelled ? 'cancelled' : 'confirmed',
                htmlLink: e.webLink,
                attendees: e.attendees?.map(a => ({
                    email: a.emailAddress.address,
                    displayName: a.emailAddress.name,
                    responseStatus: this.mapMicrosoftResponse(a.status.response),
                })),
                conferenceData: e.onlineMeeting?.joinUrl ? {
                    entryPoints: [{ entryPointType: 'video', uri: e.onlineMeeting.joinUrl }],
                } : undefined,
            };
        } else {
            throw new Error(`Unsupported calendar provider: ${connection.provider_slug}`);
        }

        // Update last_synced_at
        await this.connectionRepo.update(connectionId, {
            last_synced_at: new Date().toISOString(),
        });

        this.logger.info(
            { connectionId, eventId: event.id, calendarId: params.calendarId, provider: connection.provider_slug },
            'Calendar event created',
        );

        return event;
    }

    /* ── Private ───────────────────────────────────────────────────────── */

    private async authorize(connectionId: string, clerkUserId: string) {
        const connection = await this.connectionRepo.findById(connectionId);
        if (!connection) throw new Error('Connection not found');
        if (connection.clerk_user_id !== clerkUserId) throw new Error('Unauthorized');
        if (connection.status !== 'active') throw new Error(`Connection is ${connection.status}`);
        return connection;
    }

    /** Map Microsoft response status to Google-compatible values */
    private mapMicrosoftResponse(response: string): string {
        switch (response) {
            case 'accepted': return 'accepted';
            case 'tentativelyAccepted': return 'tentative';
            case 'declined': return 'declined';
            default: return 'needsAction';
        }
    }
}
