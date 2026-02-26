/**
 * Recruiter Code Email Templates
 * Templates for referral code usage notifications
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, alert, infoCard, divider } from '../components';

export interface ReferralCodeRedeemedData {
    recruiterName: string;
    newUserName: string;
    code: string;
    dashboardUrl: string;
    source?: EmailSource;
}

export function referralCodeRedeemedEmail(data: ReferralCodeRedeemedData): string {
    const content = `
${heading({ level: 1, text: 'Your referral code was used' })}

${alert({
        type: 'success',
        message: `Someone signed up using your referral code "${data.code}".`,
    })}

${infoCard({
        title: 'Referral Details',
        items: [
            { label: 'New User', value: data.newUserName },
            { label: 'Referral Code', value: data.code },
            { label: 'Status', value: 'Redeemed', highlight: true },
        ],
    })}

${paragraph(
        'Thank you for growing the Splits Network community. Keep sharing your referral code to bring more recruiters to the platform.'
    )}

${button({
        href: data.dashboardUrl,
        text: 'View Your Referrals →',
        variant: 'primary',
    })}

${divider()}

${paragraph('You\'ll receive a notification each time someone uses your referral code to sign up.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Your referral code "${data.code}" was used by ${data.newUserName}.`,
        source: data.source || 'portal',
    });
}
