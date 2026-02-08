/**
 * Billing Email Templates
 * Templates for Stripe Connect onboarding notifications
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
${heading({ level: 1, text: 'Your Payouts Are Set Up' })}

${alert({
        type: 'success',
        title: 'You\'re all set!',
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

export function stripeConnectDisabledEmail(data: StripeConnectDisabledData): string {
    const content = `
${heading({ level: 1, text: 'Action Required: Update Your Payment Info' })}

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
