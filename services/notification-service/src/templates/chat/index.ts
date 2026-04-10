/**
 * Chat Email Templates
 * Notification emails for new chat messages.
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, infoCard } from '../components.js';

export interface ChatMessageEmailData {
    senderName: string;
    recipientName: string;
    preview?: string | null;
    conversationUrl: string;
    source?: EmailSource;
}

export function chatMessageEmail(data: ChatMessageEmailData): string {
    const preview = data.preview || 'New message';

    const content = `
${heading({ level: 1, text: 'New message', kicker: 'MESSAGING' })}

${paragraph(`<strong>${data.senderName}</strong> sent you a message:`)}

${infoCard({
    title: 'Message Preview',
    items: [
        { label: 'From', value: data.senderName, highlight: true },
        { label: 'Message', value: preview },
    ],
})}

${button({ href: data.conversationUrl, text: 'View Conversation \u2192', variant: 'primary' })}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.senderName}: ${preview}`,
        content,
        source: data.source || 'portal',
    });
}
