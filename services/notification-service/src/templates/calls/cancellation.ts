/**
 * Call Cancellation Email Template
 * Sent to all participants when a call is cancelled.
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, infoCard, alert } from '../components.js';

export interface CallCancellationData {
    title?: string;
    participantNames: string[];
    cancelledByName: string;
    reason?: string;
    originalDateTime?: string;
    entityContext?: { companyName?: string; jobTitle?: string };
    source?: EmailSource;
}

export function callCancellationEmail(data: CallCancellationData): string {
    const displayTitle = data.title || `Call with ${data.participantNames.join(', ')}`;

    const infoItems: Array<{ label: string; value: string; highlight?: boolean }> = [
        { label: 'Cancelled by', value: data.cancelledByName },
    ];

    if (data.originalDateTime) {
        infoItems.push({ label: 'Original Date & Time', value: data.originalDateTime });
    }
    if (data.reason) {
        infoItems.push({ label: 'Reason', value: data.reason });
    }
    if (data.entityContext?.companyName) {
        infoItems.push({ label: 'Company', value: data.entityContext.companyName });
    }
    if (data.entityContext?.jobTitle) {
        infoItems.push({ label: 'Position', value: data.entityContext.jobTitle });
    }

    const content = `
${heading({ level: 1, text: 'Call cancelled' })}

${alert({
        type: 'warning',
        title: 'Call Cancelled',
        message: `<strong>${displayTitle}</strong> has been cancelled by ${data.cancelledByName}.`,
    })}

${infoCard({ title: 'Cancelled Call', items: infoItems })}

${paragraph('No further action is required. The call time has been freed on your calendar.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Call cancelled: ${displayTitle}`,
        content,
        source: data.source || 'portal',
    });
}
