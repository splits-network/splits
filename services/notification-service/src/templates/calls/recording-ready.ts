/**
 * Call Recording Ready Email Template
 * Sent to all participants when a call recording is processed and available.
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, infoCard, divider } from '../components.js';

export interface CallRecordingReadyData {
    title?: string;
    participantNames: string[];
    callDate: string;
    duration?: number;
    viewRecordingUrl: string;
    entityContext?: { companyName?: string; jobTitle?: string };
    source?: EmailSource;
}

export function callRecordingReadyEmail(data: CallRecordingReadyData): string {
    const displayTitle = data.title || `Call with ${data.participantNames.join(', ')}`;

    const infoItems: Array<{ label: string; value: string; highlight?: boolean }> = [
        { label: 'Call Date', value: data.callDate },
    ];

    if (data.duration) {
        infoItems.push({ label: 'Duration', value: `${data.duration} minutes` });
    }
    if (data.entityContext?.companyName) {
        infoItems.push({ label: 'Company', value: data.entityContext.companyName });
    }
    if (data.entityContext?.jobTitle) {
        infoItems.push({ label: 'Position', value: data.entityContext.jobTitle });
    }

    const content = `
${heading({ level: 1, text: 'Your recording is ready' })}

${paragraph(`The recording for <strong>${displayTitle}</strong> is now available to view.`)}

${infoCard({ title: 'Recording Details', items: infoItems })}

${button({ href: data.viewRecordingUrl, text: 'View Recording \u2192', variant: 'primary' })}

${divider()}

${paragraph('Recordings are available in your portal for review and sharing with your team.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Recording ready: ${displayTitle}`,
        content,
        source: data.source || 'portal',
    });
}
