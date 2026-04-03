/**
 * Call Reminder Email Template
 * Sent at configurable intervals before a scheduled call.
 * Used for both 24h and 1h reminders (timeUntil param varies).
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, infoCard, alert } from '../components.js';

export interface CallReminderData {
    title?: string;
    participantNames: string[];
    dateTime: string;
    timeUntil: string;
    joinUrl: string;
    entityContext?: { companyName?: string; jobTitle?: string };
    source?: EmailSource;
}

export function callReminderEmail(data: CallReminderData): {
    subject: string;
    html: string;
} {
    const displayTitle = data.title || `Call with ${data.participantNames.join(', ')}`;
    const participantList = data.participantNames.join(', ');
    const isUrgent = data.timeUntil.includes('10 min') || data.timeUntil.includes('soon');

    const subject = `Reminder: Call with ${participantList} in ${data.timeUntil}`;

    const infoItems: Array<{ label: string; value: string; highlight?: boolean }> = [
        { label: 'Date & Time', value: data.dateTime, highlight: true },
        { label: 'Participants', value: participantList },
    ];

    if (data.entityContext?.companyName) {
        infoItems.push({ label: 'Company', value: data.entityContext.companyName });
    }
    if (data.entityContext?.jobTitle) {
        infoItems.push({ label: 'Position', value: data.entityContext.jobTitle });
    }

    const urgencyAlert = isUrgent
        ? alert({
            type: 'warning',
            title: 'Starting Soon',
            message: 'Your call is about to begin. Please join now.',
        })
        : '';

    const joinButton = isUrgent
        ? `
<table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; margin: 28px 0;">
  <tr>
    <td align="center" style="background-color: #233876; padding: 0;">
      <a href="${data.joinUrl}" style="display: block; width: 100%; padding: 20px 32px; font-size: 18px; font-weight: 800; line-height: 1; color: #ffffff; text-decoration: none; text-align: center; letter-spacing: 0.02em;">
        Join Now &rarr;
      </a>
    </td>
  </tr>
</table>
        `.trim()
        : button({ href: data.joinUrl, text: 'Join Call \u2192', variant: 'primary' });

    const content = `
${heading({ level: 1, text: `Your call is coming up` })}

${urgencyAlert}

${paragraph(`Your call <strong>${displayTitle}</strong> starts in <strong>${data.timeUntil}</strong>.`)}

${infoCard({ title: 'Call Details', items: infoItems })}

${joinButton}
    `.trim();

    const html = baseEmailTemplate({
        preheader: `Reminder: ${displayTitle} in ${data.timeUntil}`,
        content,
        source: data.source || 'portal',
    });

    return { subject, html };
}
