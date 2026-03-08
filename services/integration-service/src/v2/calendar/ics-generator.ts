import { randomUUID } from 'crypto';

/* ── ICS Generator ────────────────────────────────────────────────────── */

export interface ICSEventParams {
    summary: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    timeZone: string;
    attendeeEmails?: string[];
    organizerEmail?: string;
    location?: string;
    meetingLink?: string;
}

/**
 * Generate an RFC 5545 compliant VCALENDAR string with a single VEVENT.
 * Used for "no-calendar" mode where the user downloads an .ics file
 * instead of creating the event via API.
 *
 * No external dependencies — pure string template.
 */
export function generateICS(params: ICSEventParams): string {
    const uid = randomUUID();
    const now = formatDateTimeUTC(new Date());

    const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Splits Network//Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART;TZID=${params.timeZone}:${formatDateTimeLocal(params.startDateTime)}`,
        `DTEND;TZID=${params.timeZone}:${formatDateTimeLocal(params.endDateTime)}`,
        `SUMMARY:${escapeICSText(params.summary)}`,
    ];

    if (params.description) {
        lines.push(`DESCRIPTION:${escapeICSText(params.description)}`);
    }

    if (params.location) {
        lines.push(`LOCATION:${escapeICSText(params.location)}`);
    }

    if (params.meetingLink) {
        lines.push(`URL:${params.meetingLink}`);
    }

    if (params.organizerEmail) {
        lines.push(`ORGANIZER;CN=${params.organizerEmail}:mailto:${params.organizerEmail}`);
    }

    if (params.attendeeEmails?.length) {
        for (const email of params.attendeeEmails) {
            lines.push(`ATTENDEE;RSVP=TRUE;CN=${email}:mailto:${email}`);
        }
    }

    lines.push(`STATUS:CONFIRMED`);
    lines.push(`SEQUENCE:0`);
    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');

    return lines.join('\r\n') + '\r\n';
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

/** Format a Date to ICS UTC timestamp: 20260307T153000Z */
function formatDateTimeUTC(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Format an ISO datetime string to ICS local format: 20260307T153000
 * Strips timezone offset and formatting characters.
 */
function formatDateTimeLocal(isoDateTime: string): string {
    // Handle ISO format: 2026-03-07T15:30:00 or 2026-03-07T15:30:00Z or 2026-03-07T15:30:00+05:00
    const cleaned = isoDateTime.replace(/[-:]/g, '');
    // Take only the date+time part (first 15 chars: YYYYMMDDTHHmmss)
    const match = cleaned.match(/^(\d{8}T\d{6})/);
    return match ? match[1] : cleaned.slice(0, 15);
}

/**
 * Escape text for ICS format per RFC 5545.
 * Backslash-escape commas, semicolons, and backslashes.
 * Replace newlines with literal \n.
 */
function escapeICSText(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}
