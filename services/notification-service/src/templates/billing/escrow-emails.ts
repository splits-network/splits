/**
 * Escrow Email Templates
 * Templates for escrow released and escrow auto-released notifications
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, alert, infoCard, divider } from '../components.js';

// ─── Escrow Released ────────────────────────────────────────────────────────

export interface EscrowReleasedData {
    recruiterName: string;
    amount: string;
    placementTitle?: string;
    billingUrl: string;
    source?: EmailSource;
}

export function escrowReleasedEmail(data: EscrowReleasedData): string {
    const content = `
${heading({ level: 1, text: 'Escrow funds released' })}

${alert({
        type: 'success',
        message: `Escrow of ${data.amount} has been released for your placement.`,
    })}

${infoCard({
        title: 'Escrow Details',
        items: [
            { label: 'Amount Released', value: data.amount, highlight: true },
            ...(data.placementTitle ? [{ label: 'Placement', value: data.placementTitle }] : []),
        ],
    })}

${paragraph(
        'These funds will be included in your next payout cycle. You can track the status from your billing dashboard.'
    )}

${button({
        href: data.billingUrl,
        text: 'View Billing Dashboard →',
        variant: 'primary',
    })}

${divider()}

${paragraph('Payouts are processed on a regular schedule. You\'ll receive a separate notification when the payout is sent.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Escrow of ${data.amount} has been released for your placement.`,
        source: data.source || 'portal',
    });
}

// ─── Escrow Auto-Released ───────────────────────────────────────────────────

export interface EscrowAutoReleasedData {
    recipientName: string;
    amount: string;
    placementTitle?: string;
    billingUrl: string;
    isRecruiter: boolean;
    source?: EmailSource;
}

export function escrowAutoReleasedEmail(data: EscrowAutoReleasedData): string {
    const nextStepMessage = data.isRecruiter
        ? 'Funds will be included in your next payout.'
        : 'The placement guarantee is now complete.';

    const content = `
${heading({ level: 1, text: 'Guarantee period completed — escrow released' })}

${alert({
        type: 'success',
        message: `The guarantee period has been completed successfully. Escrow of ${data.amount} has been automatically released.`,
    })}

${infoCard({
        title: 'Escrow Details',
        items: [
            { label: 'Amount', value: data.amount, highlight: true },
            ...(data.placementTitle ? [{ label: 'Placement', value: data.placementTitle }] : []),
            { label: 'Guarantee Status', value: 'Completed', highlight: true },
        ],
    })}

${paragraph(nextStepMessage)}

${button({
        href: data.billingUrl,
        text: 'View Details →',
        variant: 'primary',
    })}

${divider()}

${paragraph('No further action is needed regarding this escrow hold.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Guarantee period completed — escrow of ${data.amount} has been released.`,
        source: data.source || 'portal',
    });
}
