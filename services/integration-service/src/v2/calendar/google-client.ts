import { Logger } from '@splits-network/shared-logging';

/* ── Google Calendar API Types ─────────────────────────────────────────── */

export interface GoogleCalendar {
    id: string;
    summary: string;
    description?: string;
    timeZone?: string;
    backgroundColor?: string;
    foregroundColor?: string;
    primary?: boolean;
    accessRole: 'owner' | 'writer' | 'reader' | 'freeBusyReader';
}

export interface GoogleEvent {
    id: string;
    summary?: string;
    description?: string;
    location?: string;
    start: { dateTime?: string; date?: string; timeZone?: string };
    end: { dateTime?: string; date?: string; timeZone?: string };
    status: 'confirmed' | 'tentative' | 'cancelled';
    htmlLink?: string;
    attendees?: Array<{
        email: string;
        displayName?: string;
        responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
        organizer?: boolean;
        self?: boolean;
    }>;
    organizer?: { email: string; displayName?: string; self?: boolean };
    creator?: { email: string; displayName?: string };
    conferenceData?: {
        entryPoints?: Array<{ entryPointType: string; uri: string; label?: string }>;
    };
    created?: string;
    updated?: string;
}

export interface FreeBusySlot {
    start: string;
    end: string;
}

export interface CreateEventParams {
    calendarId: string;
    summary: string;
    description?: string;
    location?: string;
    startDateTime: string;
    endDateTime: string;
    timeZone: string;
    attendeeEmails?: string[];
    addGoogleMeet?: boolean;
}

/* ── Client ────────────────────────────────────────────────────────────── */

const BASE_URL = 'https://www.googleapis.com/calendar/v3';

export class GoogleCalendarClient {
    constructor(private logger: Logger) {}

    async listCalendars(accessToken: string): Promise<GoogleCalendar[]> {
        const res = await this.request(accessToken, '/users/me/calendarList');
        return res.items ?? [];
    }

    async listEvents(
        accessToken: string,
        calendarId: string,
        opts: { timeMin?: string; timeMax?: string; maxResults?: number } = {},
    ): Promise<GoogleEvent[]> {
        const params = new URLSearchParams({
            singleEvents: 'true',
            orderBy: 'startTime',
        });
        if (opts.timeMin) params.set('timeMin', opts.timeMin);
        if (opts.timeMax) params.set('timeMax', opts.timeMax);
        if (opts.maxResults) params.set('maxResults', String(opts.maxResults));

        const res = await this.request(
            accessToken,
            `/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        );
        return res.items ?? [];
    }

    async getFreeBusy(
        accessToken: string,
        calendarIds: string[],
        timeMin: string,
        timeMax: string,
    ): Promise<Record<string, FreeBusySlot[]>> {
        const body = {
            timeMin,
            timeMax,
            items: calendarIds.map(id => ({ id })),
        };

        const res = await fetch(`${BASE_URL}/freeBusy`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Google freeBusy failed (${res.status}): ${text}`);
        }

        const data = await res.json() as any;
        const result: Record<string, FreeBusySlot[]> = {};
        for (const [calId, info] of Object.entries(data.calendars ?? {})) {
            result[calId] = (info as any).busy ?? [];
        }
        return result;
    }

    async createEvent(accessToken: string, params: CreateEventParams): Promise<GoogleEvent> {
        const body: Record<string, any> = {
            summary: params.summary,
            start: { dateTime: params.startDateTime, timeZone: params.timeZone },
            end: { dateTime: params.endDateTime, timeZone: params.timeZone },
        };
        if (params.description) body.description = params.description;
        if (params.location) body.location = params.location;
        if (params.attendeeEmails?.length) {
            body.attendees = params.attendeeEmails.map(email => ({ email }));
        }
        if (params.addGoogleMeet) {
            body.conferenceData = {
                createRequest: {
                    requestId: `splits-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
            };
        }

        const conferenceParam = params.addGoogleMeet ? '?conferenceDataVersion=1' : '';
        const url = `/calendars/${encodeURIComponent(params.calendarId)}/events${conferenceParam}`;

        const res = await fetch(`${BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Google createEvent failed (${res.status}): ${text}`);
        }

        return res.json() as Promise<GoogleEvent>;
    }

    /* ── Private ───────────────────────────────────────────────────────── */

    private async request(accessToken: string, path: string): Promise<any> {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Google Calendar API error (${res.status}): ${text}`);
        }

        return res.json();
    }
}
