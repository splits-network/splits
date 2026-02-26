/**
 * Subscription Email Templates
 * Templates for subscription lifecycle notifications
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, alert, infoCard, divider } from '../components';

// ─── Subscription Cancelled ─────────────────────────────────────────────────

export interface SubscriptionCancelledData {
    companyName: string;
    planName?: string;
    endDate?: string;
    billingUrl: string;
    source?: EmailSource;
}

export function subscriptionCancelledEmail(data: SubscriptionCancelledData): string {
    const planLabel = data.planName || 'your current plan';

    const content = `
${heading({ level: 1, text: 'Subscription cancelled' })}

${alert({
        type: 'warning',
        message: `Your ${planLabel} subscription has been cancelled.`,
    })}

${infoCard({
        title: 'Subscription Details',
        items: [
            { label: 'Plan', value: data.planName || 'N/A' },
            ...(data.endDate ? [{ label: 'Access Until', value: data.endDate }] : []),
            { label: 'Status', value: 'Cancelled' },
        ],
    })}

${paragraph(
        'You will continue to have access to your current plan features until the end of your billing period. After that, your account will revert to the free tier.'
    )}

${paragraph(
        'Changed your mind? You can resubscribe at any time from your billing settings.'
    )}

${button({
        href: data.billingUrl,
        text: 'Manage Subscription →',
        variant: 'primary',
    })}

${divider()}

${paragraph('If you have questions about your subscription or need help, contact our <a href="https://splits.network/help" style="color: #233876; text-decoration: underline;">support team</a>.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Your ${planLabel} subscription has been cancelled.`,
        source: data.source || 'portal',
    });
}
