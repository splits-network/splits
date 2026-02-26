/**
 * Weekly Activity Digest Email Template
 * Sent to recruiters every Monday with a summary of their past week's activity
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, infoCard, divider } from '../components';

export interface WeeklyDigestData {
    recruiterName: string;
    weekStartDate: string;
    weekEndDate: string;
    applicationsSubmitted: number;
    applicationsAdvanced: number;
    placementsCreated: number;
    placementsActivated: number;
    totalEarnings: number;
    dashboardUrl: string;
    source?: EmailSource;
}

export function weeklyActivityDigestEmail(data: WeeklyDigestData): string {
    const hasActivity = data.applicationsSubmitted > 0
        || data.applicationsAdvanced > 0
        || data.placementsCreated > 0
        || data.placementsActivated > 0;

    const earningsDisplay = data.totalEarnings > 0
        ? `$${data.totalEarnings.toLocaleString()}`
        : '$0';

    const content = `
${heading({ level: 1, text: 'Your weekly activity summary' })}

${paragraph(
        `Here's a summary of your activity from <strong>${data.weekStartDate}</strong> to <strong>${data.weekEndDate}</strong>.`
    )}

${infoCard({
        title: 'This Week at a Glance',
        items: [
            { label: 'Applications Submitted', value: data.applicationsSubmitted.toString() },
            { label: 'Applications Advanced', value: data.applicationsAdvanced.toString() },
            { label: 'Placements Created', value: data.placementsCreated.toString() },
            { label: 'Placements Activated', value: data.placementsActivated.toString() },
            { label: 'Earnings This Week', value: earningsDisplay, highlight: true },
        ],
    })}

${hasActivity
            ? paragraph('Great work this week! Keep up the momentum by reviewing new opportunities and following up on your active applications.')
            : paragraph('It was a quiet week. Check out new job postings and opportunities to get things moving!')
        }

${button({
        href: data.dashboardUrl,
        text: 'View Your Dashboard →',
        variant: 'primary',
    })}

${divider()}

${paragraph('You receive this digest every Monday. To adjust your email preferences, visit your notification settings.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Weekly digest: ${data.applicationsSubmitted} applications, ${data.placementsCreated} placements`,
        content,
        source: data.source || 'portal',
    });
}
