/**
 * Recruiter Aftercare Reminder Email Templates
 * Sent at milestone intervals after a candidate is hired to encourage recruiter check-ins.
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, alert, infoCard, divider } from '../components';

export type AftercareMilestone = 'day_3' | 'day_14' | 'day_30' | 'guarantee_expiring' | 'day_90';

export interface RecruiterAftercareData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    hiredAt: string;
    milestone: AftercareMilestone;
    guaranteeDays?: number;
    guaranteeExpiresAt?: string;
    placementUrl: string;
    source?: EmailSource;
}

const milestoneContent: Record<AftercareMilestone, {
    subject: (data: RecruiterAftercareData) => string;
    preheader: (data: RecruiterAftercareData) => string;
    headline: string;
    alertType: 'success' | 'info' | 'warning';
    alertTitle: string;
    alertMessage: (data: RecruiterAftercareData) => string;
    tips: string[];
    buttonText: string;
}> = {
    day_3: {
        subject: (d) => `First days matter — check in with ${d.candidateName}`,
        preheader: (d) => `${d.candidateName} just started at ${d.companyName}. A quick check-in goes a long way.`,
        headline: 'The first days are everything',
        alertType: 'success',
        alertTitle: 'Day 3 — First impressions',
        alertMessage: (d) =>
            `<strong>${d.candidateName}</strong> is settling into their new role as <strong>${d.jobTitle}</strong> at <strong>${d.companyName}</strong>. A quick check-in now shows you care and catches any early concerns.`,
        tips: [
            '<strong>Send a quick message</strong> — "How are the first few days going?" is all it takes.',
            '<strong>Ask about onboarding</strong> — are they getting the support they need?',
            '<strong>Reassure them</strong> — transitions are exciting but can feel overwhelming.',
        ],
        buttonText: 'View Placement Details',
    },
    day_14: {
        subject: (d) => `Two weeks in — how is ${d.candidateName} doing?`,
        preheader: (d) => `${d.candidateName} has been at ${d.companyName} for two weeks. Time for a check-in.`,
        headline: 'Two weeks in — a great time to connect',
        alertType: 'success',
        alertTitle: 'Day 14 — Settling in',
        alertMessage: (d) =>
            `<strong>${d.candidateName}</strong> has been at <strong>${d.companyName}</strong> for two weeks now. By this point, early impressions are forming on both sides. Your check-in can surface any concerns before they grow.`,
        tips: [
            '<strong>Ask how things are going</strong> — both the role and the team dynamic.',
            '<strong>Check expectations vs. reality</strong> — is the job what they expected?',
            '<strong>Offer support</strong> — let them know you\'re here if anything comes up.',
        ],
        buttonText: 'View Placement Details',
    },
    day_30: {
        subject: (d) => `One month milestone! Check in with ${d.candidateName}`,
        preheader: (d) => `${d.candidateName} has completed their first month at ${d.companyName}. Celebrate this milestone!`,
        headline: 'One month — what a milestone!',
        alertType: 'success',
        alertTitle: 'Day 30 — First month complete',
        alertMessage: (d) =>
            `Congratulations! <strong>${d.candidateName}</strong> has completed their first month as <strong>${d.jobTitle}</strong> at <strong>${d.companyName}</strong>. This is a huge milestone worth celebrating.`,
        tips: [
            '<strong>Celebrate the milestone</strong> — acknowledge how far they\'ve come.',
            '<strong>Ask about growth</strong> — are they learning and feeling valued?',
            '<strong>Build the long-term relationship</strong> — great recruiters stay connected.',
        ],
        buttonText: 'View Placement Details',
    },
    guarantee_expiring: {
        subject: (d) => `Guarantee period ending soon for ${d.candidateName}`,
        preheader: (d) => `The guarantee period for ${d.candidateName} at ${d.companyName} expires in 7 days. Confirm the placement is solid.`,
        headline: 'Guarantee period ending soon',
        alertType: 'warning',
        alertTitle: 'Action needed — guarantee expiring',
        alertMessage: (d) => {
            const expiresDate = d.guaranteeExpiresAt
                ? new Date(d.guaranteeExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'soon';
            return `The <strong>${d.guaranteeDays}-day guarantee period</strong> for <strong>${d.candidateName}</strong> at <strong>${d.companyName}</strong> expires on <strong>${expiresDate}</strong>. Now is the time to confirm everything is going well.`;
        },
        tips: [
            '<strong>Check in with both sides</strong> — make sure the candidate and company are both happy.',
            '<strong>Address any concerns now</strong> — it\'s easier to resolve issues before the guarantee ends.',
            '<strong>Document the outcome</strong> — update the placement record with any relevant notes.',
        ],
        buttonText: 'Review Placement',
    },
    day_90: {
        subject: (d) => `Three months! ${d.candidateName} is thriving`,
        preheader: (d) => `${d.candidateName} has been at ${d.companyName} for 90 days. Your great work made this happen.`,
        headline: 'Three months — you made this happen!',
        alertType: 'success',
        alertTitle: 'Day 90 — Fully established',
        alertMessage: (d) =>
            `What an achievement! <strong>${d.candidateName}</strong> has been thriving as <strong>${d.jobTitle}</strong> at <strong>${d.companyName}</strong> for three months. This successful placement is a testament to your skills as a recruiter.`,
        tips: [
            '<strong>Celebrate together</strong> — let them know you\'re proud of their success.',
            '<strong>Ask for a testimonial</strong> — a happy candidate is your best marketing.',
            '<strong>Stay connected</strong> — the best recruiter-candidate relationships last a career.',
        ],
        buttonText: 'View Placement Details',
    },
};

export function recruiterAftercareEmail(data: RecruiterAftercareData): string {
    const m = milestoneContent[data.milestone];
    const hiredDate = new Date(data.hiredAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const content = `
${heading({ level: 1, text: m.headline, kicker: 'PLACEMENT AFTERCARE' })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>, great recruiters don't just place candidates — they stay connected.`)}

${alert({
        type: m.alertType,
        title: m.alertTitle,
        message: m.alertMessage(data),
    })}

${infoCard({
        title: 'Placement Details',
        items: [
            { label: 'Candidate', value: data.candidateName, highlight: true },
            { label: 'Role', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Hired', value: hiredDate },
        ],
    })}

${paragraph('<strong>Recommended actions:</strong>')}

${m.tips.map((tip, i) => paragraph(`${i + 1}. ${tip}`)).join('\n')}

${button({
        href: data.placementUrl,
        text: m.buttonText,
        variant: 'primary',
    })}

${divider()}

${paragraph('You received this because you placed a candidate through Splits Network. These reminders help you build lasting relationships and protect your placements.')}
    `.trim();

    return baseEmailTemplate({
        preheader: m.preheader(data),
        content,
        source: data.source || 'portal',
    });
}

export function getRecruiterAftercareSubject(data: RecruiterAftercareData): string {
    return milestoneContent[data.milestone].subject(data);
}
