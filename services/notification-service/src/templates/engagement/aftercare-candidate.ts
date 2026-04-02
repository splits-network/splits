/**
 * Candidate Aftercare Reminder Email Templates
 * Sent at milestone intervals after a candidate is hired to celebrate and encourage engagement.
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, alert, divider } from '../components.js';
import { AftercareMilestone } from './aftercare-recruiter.js';

export interface CandidateAftercareData {
    candidateName: string;
    recruiterName: string;
    jobTitle: string;
    companyName: string;
    milestone: AftercareMilestone;
    profileUrl: string;
    source?: EmailSource;
}

const milestoneContent: Record<AftercareMilestone, {
    subject: (data: CandidateAftercareData) => string;
    preheader: (data: CandidateAftercareData) => string;
    headline: string;
    alertTitle: string;
    alertMessage: (data: CandidateAftercareData) => string;
    body: (data: CandidateAftercareData) => string;
    buttonText: string;
} | null> = {
    day_3: {
        subject: () => 'How are your first few days going?',
        preheader: (d) => `We hope you're settling in at ${d.companyName}! Your recruiter is thinking of you.`,
        headline: 'Welcome to your new adventure!',
        alertTitle: 'You did it!',
        alertMessage: (d) =>
            `Congratulations on your first few days as <strong>${d.jobTitle}</strong> at <strong>${d.companyName}</strong>! Starting a new role is a big deal, and we're thrilled for you.`,
        body: (d) =>
            `Your recruiter <strong>${d.recruiterName}</strong> helped make this happen and is here if you need anything. Don't hesitate to reach out — whether it's a question about the role, the team, or just to share how it's going.`,
        buttonText: 'Update Your Profile',
    },
    day_14: {
        subject: () => 'Two weeks in — how\'s it going?',
        preheader: (d) => `You've been at ${d.companyName} for two weeks. We'd love to know how things are going!`,
        headline: 'Two weeks down — you\'re doing great!',
        alertTitle: 'Settling in nicely',
        alertMessage: (d) =>
            `You've been part of the <strong>${d.companyName}</strong> team for two weeks now. By now, you're probably getting into your groove as <strong>${d.jobTitle}</strong>.`,
        body: (d) =>
            `If anything isn't quite what you expected, your recruiter <strong>${d.recruiterName}</strong> is just a message away. They want to make sure this is everything you hoped for.`,
        buttonText: 'Update Your Profile',
    },
    day_30: {
        subject: () => 'One month milestone — congratulations!',
        preheader: (d) => `You've completed your first month at ${d.companyName}! What an achievement.`,
        headline: 'One month — what a milestone!',
        alertTitle: 'First month complete!',
        alertMessage: (d) =>
            `Wow, a full month as <strong>${d.jobTitle}</strong> at <strong>${d.companyName}</strong>! That's a milestone worth celebrating. You should be proud of how far you've come.`,
        body: (d) =>
            `Your recruiter <strong>${d.recruiterName}</strong> is celebrating this milestone with you. If you're loving your new role, consider keeping your profile updated — it helps other candidates see what's possible.`,
        buttonText: 'Update Your Profile',
    },
    guarantee_expiring: null,
    day_90: {
        subject: () => 'Three months in — you\'re thriving!',
        preheader: (d) => `90 days at ${d.companyName}! You've officially made it.`,
        headline: 'Three months — you\'re officially thriving!',
        alertTitle: 'You\'re established!',
        alertMessage: (d) =>
            `Three months as <strong>${d.jobTitle}</strong> at <strong>${d.companyName}</strong>! You're not the new person anymore — you're a valued member of the team.`,
        body: (d) =>
            `Your recruiter <strong>${d.recruiterName}</strong> helped set this journey in motion. If you know someone looking for their next career move, they'd be a great resource. And keep your profile updated — you never know when the next opportunity might come along.`,
        buttonText: 'Update Your Profile',
    },
};

export function candidateAftercareEmail(data: CandidateAftercareData): string | null {
    const m = milestoneContent[data.milestone];
    if (!m) return null;

    const content = `
${heading({ level: 1, text: m.headline, kicker: 'YOUR CAREER JOURNEY' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${alert({
        type: 'success',
        title: m.alertTitle,
        message: m.alertMessage(data),
    })}

${paragraph(m.body(data))}

${button({
        href: data.profileUrl,
        text: m.buttonText,
        variant: 'primary',
    })}

${divider()}

${paragraph('You received this because you were placed through Applicant Network. We send these to celebrate your career milestones.')}
    `.trim();

    return baseEmailTemplate({
        preheader: m.preheader(data),
        content,
        source: data.source || 'candidate',
    });
}

export function getCandidateAftercareSubject(data: CandidateAftercareData): string | null {
    const m = milestoneContent[data.milestone];
    if (!m) return null;
    return m.subject(data);
}
