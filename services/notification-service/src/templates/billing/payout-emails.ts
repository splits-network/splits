/**
 * Payout Email Templates
 * Templates for payout processed and payout failed notifications
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, alert, infoCard, divider } from '../components';

// ─── Payout Processed ───────────────────────────────────────────────────────

export interface PayoutProcessedData {
    recruiterName: string;
    amount: string;
    placementTitle?: string;
    payoutUrl: string;
    source?: EmailSource;
}

export function payoutProcessedEmail(data: PayoutProcessedData): string {
    const content = `
${heading({ level: 1, text: 'Your payout has been sent' })}

${alert({
        type: 'success',
        message: `Your payout of ${data.amount} has been processed and sent to your bank account.`,
    })}

${infoCard({
        title: 'Payout Summary',
        items: [
            { label: 'Amount', value: data.amount, highlight: true },
            ...(data.placementTitle ? [{ label: 'Placement', value: data.placementTitle }] : []),
            { label: 'Status', value: 'Sent', highlight: true },
            { label: 'Expected Arrival', value: '2–3 business days' },
        ],
    })}

${button({
        href: data.payoutUrl,
        text: 'View Payout Details →',
        variant: 'primary',
    })}

${divider()}

${paragraph('Funds typically arrive within 2–3 business days depending on your bank. You can track all payouts from your billing dashboard.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Your payout of ${data.amount} has been sent to your bank account.`,
        source: data.source || 'portal',
    });
}

// ─── Payout Failed ──────────────────────────────────────────────────────────

export interface PayoutFailedData {
    recruiterName: string;
    amount: string;
    reason: string;
    payoutUrl: string;
    source?: EmailSource;
}

export function payoutFailedEmail(data: PayoutFailedData): string {
    const content = `
${heading({ level: 1, text: 'Payout failed — action required' })}

${alert({
        type: 'error',
        message: `Your payout of ${data.amount} could not be processed.`,
    })}

${infoCard({
        title: 'Payout Details',
        items: [
            { label: 'Amount', value: data.amount, highlight: true },
            { label: 'Reason', value: data.reason },
            { label: 'Status', value: 'Failed' },
        ],
    })}

${paragraph(
        'Please update your payment information or contact support to resolve this issue. Once your payment details are corrected, the payout will be retried automatically.'
    )}

${button({
        href: data.payoutUrl,
        text: 'Update Payment Info →',
        variant: 'primary',
    })}

${divider()}

${paragraph('If you believe this is an error, please contact our <a href="https://splits.network/help" style="color: #233876; text-decoration: underline;">support team</a> for assistance.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Action required: Your payout of ${data.amount} failed.`,
        source: data.source || 'portal',
    });
}
