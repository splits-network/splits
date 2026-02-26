/**
 * Candidate Profile Reminder Email Template
 * Sent to candidates who haven't updated their profile or had activity in 30+ days
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, alert, divider } from '../components';

export interface CandidateReminderData {
    candidateName: string;
    daysSinceActivity: number;
    profileUrl: string;
    source?: EmailSource;
}

export function candidateProfileReminderEmail(data: CandidateReminderData): string {
    const content = `
${heading({ level: 1, text: 'Keep your profile up to date' })}

${paragraph(
        `Hi <strong>${data.candidateName}</strong>, it's been <strong>${data.daysSinceActivity} days</strong> since your last activity on Splits Network.`
    )}

${alert({
        type: 'info',
        title: 'An updated profile gets noticed',
        message: 'Recruiters prioritize candidates with current profiles. Updating your skills, experience, and availability helps you get matched with the right opportunities.',
    })}

${paragraph('<strong>Quick wins to boost your visibility:</strong>')}

${paragraph('1. <strong>Update your skills</strong> — add any new technologies or certifications.')}
${paragraph('2. <strong>Refresh your experience</strong> — add recent projects or role changes.')}
${paragraph('3. <strong>Confirm your availability</strong> — let recruiters know you\'re open to opportunities.')}

${button({
        href: data.profileUrl,
        text: 'Update Your Profile →',
        variant: 'primary',
    })}

${divider()}

${paragraph('You received this because you have an account on Splits Network. To adjust your email preferences, visit your notification settings.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Your Splits Network profile hasn't been updated in ${data.daysSinceActivity} days`,
        content,
        source: data.source || 'portal',
    });
}
