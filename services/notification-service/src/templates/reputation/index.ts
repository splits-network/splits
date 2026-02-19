/**
 * Reputation Email Templates
 * Templates for tier promotion and demotion notifications
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, alert, infoCard, divider } from '../components';

export interface TierChangeData {
    recruiterName: string;
    oldTier: string;
    newTier: string;
    oldScore: number;
    newScore: number;
    profileUrl: string;
    source?: EmailSource;
}

// Tier display configuration
const tierConfig: Record<
    string,
    { label: string; color: string; icon: string; description: string }
> = {
    elite: {
        label: 'Elite',
        color: '#233876', // Memphis Coral
        icon: 'crown',
        description:
            'Top-performing recruiter with exceptional placement success rates.',
    },
    pro: {
        label: 'Pro',
        color: '#0f9d8a', // Memphis Teal
        icon: 'star',
        description:
            'Proven track record of successful placements and collaboration.',
    },
    active: {
        label: 'Active',
        color: '#A78BFA', // Memphis Purple
        icon: 'check',
        description: 'Building placement history with consistent activity.',
    },
    new: {
        label: 'New',
        color: '#18181b', // Memphis Dark
        icon: 'seedling',
        description: 'Just getting started on the platform.',
    },
};

/**
 * Email template for tier promotion (moving up to a better tier).
 */
export function tierPromotionEmail(data: TierChangeData): string {
    const newTierInfo = tierConfig[data.newTier] || tierConfig.active;

    const content = `
${heading({ level: 1, text: 'Congratulations on Your Tier Upgrade!' })}

${alert({
        type: 'success',
        title: `You've reached ${newTierInfo.label} status!`,
        message: newTierInfo.description,
    })}

${paragraph(
        `Great work, ${data.recruiterName}! Your reputation score has increased to <strong>${data.newScore.toFixed(1)}</strong>, earning you <strong>${newTierInfo.label}</strong> tier status.`
    )}

${infoCard({
        title: 'Your Reputation',
        items: [
            { label: 'New Tier', value: newTierInfo.label, highlight: true },
            { label: 'Previous Tier', value: tierConfig[data.oldTier]?.label || data.oldTier },
            { label: 'New Score', value: data.newScore.toFixed(1), highlight: true },
            { label: 'Previous Score', value: data.oldScore.toFixed(1) },
        ],
    })}

${paragraph(
        '<strong>What this means:</strong> Your higher tier status is visible to hiring companies on the marketplace, making you more attractive for new assignments. Keep up the great work!'
    )}

${button({
        href: data.profileUrl,
        text: 'View Your Profile',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        'Your reputation is calculated based on placement completion rates, hire rates, collaboration history, and responsiveness. Continue delivering great results to maintain or improve your tier.'
    )}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Congratulations! You've been promoted to ${newTierInfo.label} tier.`,
        source: data.source || 'portal',
    });
}

/**
 * Email template for tier demotion (moving down to a lower tier).
 */
export function tierDemotionEmail(data: TierChangeData): string {
    const newTierInfo = tierConfig[data.newTier] || tierConfig.active;
    const oldTierInfo = tierConfig[data.oldTier] || tierConfig.active;

    const content = `
${heading({ level: 1, text: 'Your Reputation Tier Has Changed' })}

${alert({
        type: 'info',
        title: `Your tier has changed to ${newTierInfo.label}`,
        message:
            'Your reputation score has decreased. Review the tips below to improve your standing.',
    })}

${paragraph(
        `Hi ${data.recruiterName}, your reputation score has changed to <strong>${data.newScore.toFixed(1)}</strong>, which places you in the <strong>${newTierInfo.label}</strong> tier.`
    )}

${infoCard({
        title: 'Your Reputation',
        items: [
            { label: 'Current Tier', value: newTierInfo.label },
            { label: 'Previous Tier', value: oldTierInfo.label },
            { label: 'Current Score', value: data.newScore.toFixed(1) },
            { label: 'Previous Score', value: data.oldScore.toFixed(1) },
        ],
    })}

${paragraph('<strong>Tips to improve your reputation:</strong>')}

${paragraph(
        `<ul style="margin: 0; padding-left: 20px; color: #18181b;">
<li style="margin-bottom: 8px;"><strong>Complete placements successfully:</strong> Candidates who stay through the guarantee period boost your completion rate.</li>
<li style="margin-bottom: 8px;"><strong>Submit high-quality candidates:</strong> Focus on candidates who are a strong fit for the role to improve hire rates.</li>
<li style="margin-bottom: 8px;"><strong>Respond promptly:</strong> Quick responses to information requests show professionalism.</li>
<li style="margin-bottom: 8px;"><strong>Collaborate effectively:</strong> Working well with other recruiters on split placements is valued.</li>
</ul>`
    )}

${button({
        href: data.profileUrl,
        text: 'View Your Profile',
        variant: 'secondary',
    })}

${divider()}

${paragraph(
        'Your reputation updates continuously based on your recent activity. Focus on quality placements and you can move back up to your previous tier.'
    )}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Your reputation tier has changed to ${newTierInfo.label}. See tips to improve.`,
        source: data.source || 'portal',
    });
}
