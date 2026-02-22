import { Logger } from '@splits-network/shared-logging';

/* ── Microsoft Graph Calendar API Types ──────────────────────────────── */

export interface MicrosoftCalendar {
    id: string;
    name: string;
    color: string;
    isDefaultCalendar: boolean;
    canEdit: boolean;
    owner: { name: string; address: string };
}

export interface MicrosoftEvent {
    id: string;
    subject?: string;
    bodyPreview?: string;
    body?: { contentType: string; content: string };
    location?: { displayName?: string };
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    isAllDay: boolean;
    isCancelled: boolean;
    webLink?: string;
    attendees?: Array<{
        emailAddress: { name?: string; address: string };
        status: { response: string; time?: string };
        type: string;
    }>;
    organizer?: { emailAddress: { name?: string; address: string } };
    onlineMeeting?: { joinUrl?: string };
    onlineMeetingProvider?: string;
    createdDateTime?: string;
    lastModifiedDateTime?: string;
}

export interface MicrosoftScheduleItem {
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    status: string;
}

export interface MicrosoftCreateEventParams {
    calendarId: string;
    summary: string;
    description?: string;
    location?: string;
    startDateTime: string;
    endDateTime: string;
    timeZone: string;
    attendeeEmails?: string[];
    addTeamsMeeting?: boolean;
}

/* ── Client ──────────────────────────────────────────────────────────── */

const BASE_URL = 'https://graph.microsoft.com/v1.0';

export class MicrosoftCalendarClient {
    constructor(private logger: Logger) {}

    async listCalendars(accessToken: string): Promise<MicrosoftCalendar[]> {
        const res = await this.request(accessToken, '/me/calendars');
        return res.value ?? [];
    }

    async listEvents(
        accessToken: string,
        calendarId: string,
        opts: { timeMin?: string; timeMax?: string; maxResults?: number } = {},
    ): Promise<MicrosoftEvent[]> {
        const params = new URLSearchParams({
            $orderby: 'start/dateTime',
            $top: String(opts.maxResults ?? 50),
        });
        if (opts.timeMin) params.set('$filter', `start/dateTime ge '${opts.timeMin}'`);
        if (opts.timeMax) {
            const existing = params.get('$filter');
            const maxFilter = `end/dateTime le '${opts.timeMax}'`;
            params.set('$filter', existing ? `${existing} and ${maxFilter}` : maxFilter);
        }

        const res = await this.request(
            accessToken,
            `/me/calendars/${calendarId}/events?${params}`,
        );
        return res.value ?? [];
    }

    async getFreeBusy(
        accessToken: string,
        calendarIds: string[],
        timeMin: string,
        timeMax: string,
        userEmail: string,
    ): Promise<Record<string, { start: string; end: string }[]>> {
        // Microsoft uses /me/calendar/getSchedule for free/busy
        const body = {
            schedules: [userEmail],
            startTime: { dateTime: timeMin, timeZone: 'UTC' },
            endTime: { dateTime: timeMax, timeZone: 'UTC' },
        };

        const res = await fetch(`${BASE_URL}/me/calendar/getSchedule`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Microsoft getSchedule failed (${res.status}): ${text}`);
        }

        const data = await res.json() as any;
        const result: Record<string, { start: string; end: string }[]> = {};

        for (const schedule of data.value ?? []) {
            const busy = (schedule.scheduleItems ?? [])
                .filter((item: MicrosoftScheduleItem) => item.status !== 'free')
                .map((item: MicrosoftScheduleItem) => ({
                    start: item.start.dateTime,
                    end: item.end.dateTime,
                }));
            // Map all calendar IDs to the same busy slots (Microsoft uses user-level schedule)
            for (const calId of calendarIds) {
                result[calId] = busy;
            }
        }

        return result;
    }

    async createEvent(accessToken: string, params: MicrosoftCreateEventParams): Promise<MicrosoftEvent> {
        const body: Record<string, any> = {
            subject: params.summary,
            start: { dateTime: params.startDateTime, timeZone: params.timeZone },
            end: { dateTime: params.endDateTime, timeZone: params.timeZone },
        };
        if (params.description) {
            body.body = { contentType: 'text', content: params.description };
        }
        if (params.location) {
            body.location = { displayName: params.location };
        }
        if (params.attendeeEmails?.length) {
            body.attendees = params.attendeeEmails.map(email => ({
                emailAddress: { address: email },
                type: 'required',
            }));
        }
        if (params.addTeamsMeeting) {
            body.isOnlineMeeting = true;
            body.onlineMeetingProvider = 'teamsForBusiness';
        }

        const res = await fetch(`${BASE_URL}/me/calendars/${params.calendarId}/events`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Microsoft createEvent failed (${res.status}): ${text}`);
        }

        return res.json() as Promise<MicrosoftEvent>;
    }

    /* ── Private ─────────────────────────────────────────────────────── */

    private async request(accessToken: string, path: string): Promise<any> {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Microsoft Graph API error (${res.status}): ${text}`);
        }

        return res.json();
    }
}
