/**
 * Call Confirmation Email Template
 * Sent to all participants when a scheduled call is created.
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, infoCard, divider } from '../components.js';

export interface CallConfirmationData {
    title?: string;
    participantNames: string[];
    dateTime: string;
    agenda?: string;
    joinUrl: string;
    portalUrl: string;
    entityContext?: { companyName?: string; jobTitle?: string };
    source?: EmailSource;
}

export function callConfirmationEmail(data: CallConfirmationData): string {
    const displayTitle = data.title || `Call with ${data.participantNames.join(', ')}`;
    const participantList = data.participantNames.join(', ');

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

    const content = `
${heading({ level: 1, text: 'Your call is scheduled' })}

${paragraph(`<strong>${displayTitle}</strong> has been scheduled.`)}

${infoCard({ title: 'Call Details', items: infoItems })}

${data.agenda ? `${heading({ level: 3, text: 'Agenda' })}
${paragraph(data.agenda)}` : ''}

${button({ href: data.joinUrl, text: 'Join Call \u2192', variant: 'primary' })}

${button({ href: data.portalUrl, text: 'View in Portal \u2192', variant: 'secondary' })}

${divider()}

${paragraph('You will receive a reminder before the call starts.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Call scheduled: ${displayTitle} \u2014 ${data.dateTime}`,
        content,
        source: data.source || 'portal',
    });
}
