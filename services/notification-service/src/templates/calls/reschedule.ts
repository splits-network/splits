/**
 * Call Reschedule Email Template
 * Sent to all participants when a call is rescheduled.
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, infoCard, divider } from '../components.js';

export interface CallRescheduleData {
    title?: string;
    participantNames: string[];
    newDateTime: string;
    entityContext?: { companyName?: string; jobTitle?: string };
    joinUrl: string;
    source?: EmailSource;
}

export function callRescheduleEmail(data: CallRescheduleData): string {
    const displayTitle = data.title || `Call with ${data.participantNames.join(', ')}`;
    const participantList = data.participantNames.join(', ');

    const infoItems: Array<{ label: string; value: string; highlight?: boolean }> = [
        { label: 'New Date & Time', value: data.newDateTime, highlight: true },
        { label: 'Participants', value: participantList },
    ];

    if (data.entityContext?.companyName) {
        infoItems.push({ label: 'Company', value: data.entityContext.companyName });
    }
    if (data.entityContext?.jobTitle) {
        infoItems.push({ label: 'Position', value: data.entityContext.jobTitle });
    }

    const content = `
${heading({ level: 1, text: 'Call rescheduled' })}

${paragraph(`<strong>${displayTitle}</strong> has been rescheduled to a new time.`)}

${infoCard({ title: 'Updated Schedule', items: infoItems })}

${button({ href: data.joinUrl, text: 'Join Call \u2192', variant: 'primary' })}

${divider()}

${paragraph('Your calendar has been updated with the new time.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Call rescheduled: ${displayTitle} \u2014 ${data.newDateTime}`,
        content,
        source: data.source || 'portal',
    });
}
