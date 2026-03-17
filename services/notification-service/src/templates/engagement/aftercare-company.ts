/**
 * Company Admin Aftercare Reminder Email Templates
 * Sent at milestone intervals after a candidate is hired to encourage check-ins with new hires.
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, alert, infoCard, divider } from '../components';
import { AftercareMilestone } from './aftercare-recruiter';

export interface CompanyAftercareData {
    adminName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    hiredAt: string;
    milestone: AftercareMilestone;
    placementUrl: string;
    source?: EmailSource;
}

const milestoneContent: Record<AftercareMilestone, {
    subject: (data: CompanyAftercareData) => string;
    preheader: (data: CompanyAftercareData) => string;
    headline: string;
    alertTitle: string;
    alertMessage: (data: CompanyAftercareData) => string;
    tips: string[];
    buttonText: string;
} | null> = {
    day_3: {
        subject: (d) => `Welcome ${d.candidateName} — first days matter`,
        preheader: (d) => `${d.candidateName} just started as ${d.jobTitle}. A warm welcome sets the tone for success.`,
        headline: 'Make their first days count',
        alertTitle: 'New hire — Day 3',
        alertMessage: (d) =>
            `<strong>${d.candidateName}</strong> is in their first few days as <strong>${d.jobTitle}</strong>. First impressions go both ways — a warm, structured onboarding experience sets the foundation for long-term success.`,
        tips: [
            '<strong>Check in personally</strong> — a quick hello from leadership makes a big impression.',
            '<strong>Ensure onboarding is on track</strong> — do they have access to everything they need?',
            '<strong>Introduce them to the team</strong> — connection with colleagues drives early engagement.',
        ],
        buttonText: 'View Placement Details',
    },
    day_14: null,
    day_30: {
        subject: (d) => `${d.candidateName} has been here a month — celebrate!`,
        preheader: (d) => `${d.candidateName} completed their first month as ${d.jobTitle}. A great moment to connect.`,
        headline: 'One month — time to celebrate!',
        alertTitle: 'First month milestone',
        alertMessage: (d) =>
            `<strong>${d.candidateName}</strong> has completed their first month as <strong>${d.jobTitle}</strong>. This is a key retention moment — employees who feel valued at 30 days are far more likely to stay long-term.`,
        tips: [
            '<strong>Celebrate the milestone</strong> — even a quick acknowledgment goes a long way.',
            '<strong>Schedule a 1:1</strong> — check in on how they feel about the role and team.',
            '<strong>Gather feedback</strong> — ask what\'s working and what could be better.',
        ],
        buttonText: 'View Placement Details',
    },
    guarantee_expiring: null,
    day_90: null,
};

export function companyAftercareEmail(data: CompanyAftercareData): string | null {
    const m = milestoneContent[data.milestone];
    if (!m) return null;

    const hiredDate = new Date(data.hiredAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const content = `
${heading({ level: 1, text: m.headline, kicker: 'NEW HIRE ONBOARDING' })}

${paragraph(`Hi <strong>${data.adminName}</strong>,`)}

${alert({
        type: 'success',
        title: m.alertTitle,
        message: m.alertMessage(data),
    })}

${infoCard({
        title: 'Hire Details',
        items: [
            { label: 'New Hire', value: data.candidateName, highlight: true },
            { label: 'Role', value: data.jobTitle },
            { label: 'Start Date', value: hiredDate },
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

${paragraph('You received this because your company hired a candidate through Splits Network. These reminders help ensure successful new hire onboarding.')}
    `.trim();

    return baseEmailTemplate({
        preheader: m.preheader(data),
        content,
        source: data.source || 'portal',
    });
}

export function getCompanyAftercareSubject(data: CompanyAftercareData): string | null {
    const m = milestoneContent[data.milestone];
    if (!m) return null;
    return m.subject(data);
}
