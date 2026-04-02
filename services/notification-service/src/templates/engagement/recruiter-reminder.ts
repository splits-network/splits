/**
 * Recruiter Inactivity Reminder Email Template
 * Sent to recruiters who haven't been active in 14+ days but have pending work
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, infoCard, alert, divider } from '../components.js';

export interface RecruiterReminderData {
    recruiterName: string;
    daysSinceActivity: number;
    pendingApplications: number;
    activeJobs: number;
    dashboardUrl: string;
    source?: EmailSource;
}

export function recruiterInactivityReminderEmail(data: RecruiterReminderData): string {
    const content = `
${heading({ level: 1, text: 'You have pending work waiting' })}

${paragraph(
        `Hi <strong>${data.recruiterName}</strong>, it's been <strong>${data.daysSinceActivity} days</strong> since your last activity on Splits Network.`
    )}

${alert({
        type: 'warning',
        title: 'Don\'t miss out',
        message: 'You have applications and opportunities that need your attention. Timely follow-ups lead to better placement outcomes.',
    })}

${infoCard({
        title: 'What Needs Your Attention',
        items: [
            { label: 'Pending Applications', value: data.pendingApplications.toString(), highlight: true },
            { label: 'Active Job Listings', value: data.activeJobs.toString() },
        ],
    })}

${paragraph('<strong>Quick actions to get back on track:</strong>')}

${paragraph('1. <strong>Review pending applications</strong> — candidates are waiting for your response.')}
${paragraph('2. <strong>Check new job listings</strong> — new opportunities may match your candidates.')}
${paragraph('3. <strong>Follow up on active placements</strong> — stay connected with your placed candidates.')}

${button({
        href: data.dashboardUrl,
        text: 'Go to Dashboard →',
        variant: 'primary',
    })}

${divider()}

${paragraph('You received this because you have an active recruiter account on Splits Network. To adjust your email preferences, visit your notification settings.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `You have ${data.pendingApplications} pending applications waiting for your attention`,
        content,
        source: data.source || 'portal',
    });
}
