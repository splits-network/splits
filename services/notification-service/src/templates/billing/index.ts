/**
 * Billing Email Templates
 * Templates for Stripe Connect onboarding, company billing, payouts, escrow,
 * invoices, and subscription notifications
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, alert, infoCard, divider } from '../components';

export interface StripeConnectOnboardedData {
    recruiterName: string;
    billingUrl: string;
    source?: EmailSource;
}

export function stripeConnectOnboardedEmail(data: StripeConnectOnboardedData): string {
    const content = `
${heading({ level: 1, text: 'Your payouts are set up' })}

${alert({
        type: 'success',
        title: 'Setup complete',
        message: 'Your bank account has been verified and connected. You can now receive placement commissions directly to your account.',
    })}

${infoCard({
        title: 'Payout Details',
        items: [
            { label: 'Status', value: 'Active', highlight: true },
            { label: 'Identity Verified', value: 'Yes' },
            { label: 'Bank Account Connected', value: 'Yes' },
            { label: 'Payouts Enabled', value: 'Yes' },
        ],
    })}

${paragraph(
        '<strong>How payouts work:</strong> When you make a successful placement, your commission will be calculated based on the agreed split. Payouts are processed after the guarantee period and deposited directly into your connected bank account.'
    )}

${button({
        href: data.billingUrl,
        text: 'View Payout Settings →',
        variant: 'primary',
    })}

${divider()}

${paragraph('If you need to update your bank account or personal details, you can do so from your billing settings at any time.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: 'Your payouts are set up and ready to receive commissions.',
        source: data.source || 'portal',
    });
}

export interface StripeConnectDisabledData {
    recruiterName: string;
    reason?: string;
    connectUrl: string;
    source?: EmailSource;
}

export interface CompanyBillingSetupCompleteData {
    billingEmail: string;
    billingTerms: string;
    hasPaymentMethod: boolean;
    billingUrl: string;
    source?: EmailSource;
}

export function companyBillingSetupCompleteEmail(data: CompanyBillingSetupCompleteData): string {
    const termsLabel: Record<string, string> = {
        immediate: 'Immediate (Charge on completion)',
        net_30: 'Net 30',
        net_60: 'Net 60',
        net_90: 'Net 90',
    };

    const content = `
${heading({ level: 1, text: 'Company billing is set up' })}

${alert({
        type: 'success',
        title: 'Setup complete',
        message: 'Your company billing profile is configured and ready for placement invoicing.',
    })}

${infoCard({
        title: 'Billing Details',
        items: [
            { label: 'Billing Email', value: data.billingEmail },
            { label: 'Payment Terms', value: termsLabel[data.billingTerms] || data.billingTerms },
            { label: 'Payment Method', value: data.hasPaymentMethod ? 'Card on file' : 'Pay via invoice link', highlight: data.hasPaymentMethod },
        ],
    })}

${paragraph(
        '<strong>How invoicing works:</strong> When a placement is confirmed, an invoice is generated and sent to your billing email. Payment is due within your billing terms. You can view all invoices on your billing page.'
    )}

${button({
        href: data.billingUrl,
        text: 'View Billing Dashboard →',
        variant: 'primary',
    })}

${divider()}

${paragraph('You can update your billing details, payment method, or billing terms from your billing settings at any time.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: 'Your company billing is set up and ready for placement invoicing.',
        source: data.source || 'portal',
    });
}

export interface PayoutConnectRequiredData {
    recruiterName: string;
    amount: number;
    connectUrl: string;
    reason: 'no_connect_account' | 'not_onboarded';
    source?: EmailSource;
}

export function payoutConnectRequiredEmail(data: PayoutConnectRequiredData): string {
    const isNoAccount = data.reason === 'no_connect_account';
    const reasonText = isNoAccount
        ? 'You don\'t have a payout account set up yet. Connect your bank account through Stripe to start receiving commissions.'
        : 'Your Stripe account setup is not yet complete. Please finish the onboarding process to receive your commissions.';

    const content = `
${heading({ level: 1, text: 'Set up your payout account' })}

${alert({
        type: 'warning',
        title: 'You have a commission waiting',
        message: `A $${data.amount.toLocaleString()} commission is ready to be paid out, but we can't send it until your payout account is set up.`,
    })}

${paragraph(reasonText)}

${button({
        href: data.connectUrl,
        text: isNoAccount ? 'Set Up Payouts →' : 'Complete Setup →',
        variant: 'primary',
    })}

${divider()}

${paragraph('Setup takes about 5 minutes. Once complete, your pending commission will be processed automatically.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `You have a $${data.amount.toLocaleString()} commission waiting — set up your payout account to receive it.`,
        source: data.source || 'portal',
    });
}

export function stripeConnectDisabledEmail(data: StripeConnectDisabledData): string {
    const content = `
${heading({ level: 1, text: 'Action required: update your payment info' })}

${alert({
        type: 'warning',
        title: 'Your payouts have been paused',
        message: 'Stripe needs additional information to keep your payouts active. Please update your details to continue receiving commissions.',
    })}

${paragraph(
        data.reason
            ? `<strong>Reason:</strong> ${data.reason}`
            : 'Stripe periodically reviews connected accounts for compliance. Your account may need updated information such as identity verification, address confirmation, or bank account details.'
    )}

${button({
        href: data.connectUrl,
        text: 'Update Information →',
        variant: 'primary',
    })}

${divider()}

${paragraph('This is typically a quick process. Once you provide the required information, your payouts will be re-enabled automatically.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: 'Action required: Update your payment information to continue receiving payouts.',
        source: data.source || 'portal',
    });
}

// Re-export Phase 4 templates
export { payoutProcessedEmail, type PayoutProcessedData } from './payout-emails';
export { payoutFailedEmail, type PayoutFailedData } from './payout-emails';
export { escrowReleasedEmail, type EscrowReleasedData } from './escrow-emails';
export { escrowAutoReleasedEmail, type EscrowAutoReleasedData } from './escrow-emails';
export { invoicePaidEmail, type InvoicePaidData } from './invoice-emails';
export { subscriptionCancelledEmail, type SubscriptionCancelledData } from './subscription-emails';
