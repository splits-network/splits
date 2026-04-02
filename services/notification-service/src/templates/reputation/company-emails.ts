/**
 * Company Reputation Email Templates
 * Templates for company tier promotion and demotion notifications
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, alert, infoCard, divider } from '../components.js';

export interface CompanyTierChangeData {
    companyName: string;
    oldTier: string;
    newTier: string;
    oldScore: number;
    newScore: number;
    dashboardUrl: string;
    source?: EmailSource;
}

const tierConfig: Record<
    string,
    { label: string; description: string }
> = {
    elite: {
        label: 'Elite',
        description: 'Top-performing company with exceptional responsiveness and recruiter engagement.',
    },
    pro: {
        label: 'Pro',
        description: 'Strong track record of timely reviews and successful hires.',
    },
    active: {
        label: 'Active',
        description: 'Building a positive hiring track record with consistent engagement.',
    },
    new: {
        label: 'New',
        description: 'Just getting started on the platform.',
    },
};

export function companyTierPromotionEmail(data: CompanyTierChangeData): string {
    const newTierInfo = tierConfig[data.newTier] || tierConfig.active;

    const content = `
${heading({ level: 1, text: 'Your company tier has been upgraded' })}

${alert({
        type: 'success',
        title: `${data.companyName} has reached ${newTierInfo.label} status!`,
        message: newTierInfo.description,
    })}

${paragraph(
        `Your company's reputation score has increased to <strong>${data.newScore.toFixed(1)}</strong>, earning <strong>${newTierInfo.label}</strong> tier status.`
    )}

${infoCard({
        title: 'Company Reputation',
        items: [
            { label: 'New Tier', value: newTierInfo.label, highlight: true },
            { label: 'Previous Tier', value: tierConfig[data.oldTier]?.label || data.oldTier },
            { label: 'New Score', value: data.newScore.toFixed(1), highlight: true },
            { label: 'Previous Score', value: data.oldScore.toFixed(1) },
        ],
    })}

${paragraph(
        '<strong>What this means:</strong> Higher tier status makes your company more visible to top recruiters on the marketplace, attracting better candidates for your open positions.'
    )}

${button({
        href: data.dashboardUrl,
        text: 'View Company Dashboard \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        'Your company reputation is based on review responsiveness, hire rates, and recruiter feedback. Keep up the great work!'
    )}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Congratulations! ${data.companyName} has been promoted to ${newTierInfo.label} tier.`,
        source: data.source || 'portal',
    });
}

export function companyTierDemotionEmail(data: CompanyTierChangeData): string {
    const newTierInfo = tierConfig[data.newTier] || tierConfig.active;
    const oldTierInfo = tierConfig[data.oldTier] || tierConfig.active;

    const content = `
${heading({ level: 1, text: 'Your company reputation tier has changed' })}

${alert({
        type: 'info',
        title: `Your company tier has changed to ${newTierInfo.label}`,
        message: 'Your company\'s reputation score has decreased. Review the tips below to improve your standing.',
    })}

${paragraph(
        `${data.companyName}'s reputation score has changed to <strong>${data.newScore.toFixed(1)}</strong>, which places you in the <strong>${newTierInfo.label}</strong> tier.`
    )}

${infoCard({
        title: 'Company Reputation',
        items: [
            { label: 'Current Tier', value: newTierInfo.label },
            { label: 'Previous Tier', value: oldTierInfo.label },
            { label: 'Current Score', value: data.newScore.toFixed(1) },
            { label: 'Previous Score', value: data.oldScore.toFixed(1) },
        ],
    })}

${paragraph('<strong>Tips to improve your company reputation:</strong>')}

${paragraph(
        `<ul style="margin: 0; padding-left: 20px; color: #18181b;">
<li style="margin-bottom: 8px;"><strong>Review applications promptly:</strong> Respond to candidate submissions within the expected timeframe to avoid expirations.</li>
<li style="margin-bottom: 8px;"><strong>Provide timely feedback:</strong> Recruiters value companies that communicate decisions quickly.</li>
<li style="margin-bottom: 8px;"><strong>Complete the hiring process:</strong> Moving candidates through stages efficiently builds trust.</li>
<li style="margin-bottom: 8px;"><strong>Engage with recruiters:</strong> Active communication with recruiting partners improves collaboration scores.</li>
</ul>`
    )}

${button({
        href: data.dashboardUrl,
        text: 'View Company Dashboard \u2192',
        variant: 'secondary',
    })}

${divider()}

${paragraph(
        'Your company reputation updates continuously based on recent activity. Focus on timely reviews and responsive communication to improve your tier.'
    )}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `${data.companyName}'s reputation tier has changed to ${newTierInfo.label}. See tips to improve.`,
        source: data.source || 'portal',
    });
}
