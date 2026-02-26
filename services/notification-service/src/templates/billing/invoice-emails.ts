/**
 * Invoice Email Templates
 * Templates for invoice payment notifications
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, alert, infoCard, divider } from '../components';

// ─── Invoice Paid ───────────────────────────────────────────────────────────

export interface InvoicePaidData {
    companyName: string;
    amount: string;
    invoiceNumber?: string;
    placementTitle?: string;
    billingUrl: string;
    source?: EmailSource;
}

export function invoicePaidEmail(data: InvoicePaidData): string {
    const content = `
${heading({ level: 1, text: 'Payment received' })}

${alert({
        type: 'success',
        message: `Your payment of ${data.amount} has been received.`,
    })}

${infoCard({
        title: 'Payment Details',
        items: [
            { label: 'Amount', value: data.amount, highlight: true },
            ...(data.invoiceNumber ? [{ label: 'Invoice', value: data.invoiceNumber }] : []),
            ...(data.placementTitle ? [{ label: 'Placement', value: data.placementTitle }] : []),
            { label: 'Status', value: 'Paid', highlight: true },
        ],
    })}

${button({
        href: data.billingUrl,
        text: 'View Billing Dashboard →',
        variant: 'primary',
    })}

${divider()}

${paragraph('You can view all invoices and payment history from your billing dashboard.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Payment of ${data.amount} received — thank you.`,
        source: data.source || 'portal',
    });
}
