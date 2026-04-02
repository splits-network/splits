/**
 * Onboarding & Welcome Email Templates
 * Templates for user registration, recruiter onboarding, and company welcome flows
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, infoCard, divider } from '../components.js';

// ─── Welcome Email ──────────────────────────────────────────────────────────

export interface WelcomeEmailData {
    userName: string;
    dashboardUrl: string;
    source?: EmailSource;
}

export function welcomeEmail(data: WelcomeEmailData): string {
    const content = `
${heading({ level: 1, text: 'Welcome to Splits Network' })}

${paragraph(
        `Hi ${data.userName}, welcome aboard! Splits Network connects companies with skilled recruiters for split-fee placements — making collaborative recruiting easier and more rewarding for everyone.`
    )}

${paragraph(
        'Here\'s what you can do to get started:'
    )}

${infoCard({
        title: 'Next Steps',
        items: [
            { label: '1', value: 'Explore the platform and see what\'s available' },
            { label: '2', value: 'Complete your profile so others can find you' },
            { label: '3', value: 'Connect with recruiters and companies in your network' },
        ],
    })}

${button({
        href: data.dashboardUrl,
        text: 'Get Started \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('If you have any questions, our support team is here to help.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: 'Welcome to Splits Network — the marketplace for collaborative recruiting.',
        source: data.source || 'portal',
    });
}

// ─── Recruiter Onboarding Email ─────────────────────────────────────────────

export interface RecruiterOnboardingData {
    recruiterName: string;
    dashboardUrl: string;
    source?: EmailSource;
}

export function recruiterOnboardingEmail(data: RecruiterOnboardingData): string {
    const content = `
${heading({ level: 1, text: `Welcome to Splits Network, ${data.recruiterName}` })}

${paragraph(
        'You\'re set up as a recruiter on Splits Network. Here\'s how to start making split-fee placements and earning commissions.'
    )}

${infoCard({
        title: 'Getting Started',
        items: [
            { label: '1', value: 'Complete your profile \u2014 add your specializations and experience' },
            { label: '2', value: 'Source candidates \u2014 find and add candidates to your network' },
            { label: '3', value: 'Connect with companies \u2014 build relationships with hiring companies' },
            { label: '4', value: 'Submit applications \u2014 match candidates to open roles and earn split fees' },
        ],
    })}

${button({
        href: data.dashboardUrl,
        text: 'Start Recruiting \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('The more complete your profile, the more likely companies are to work with you. Start by adding your specializations and past experience.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Welcome, ${data.recruiterName} — here's how to get started on Splits Network.`,
        source: data.source || 'portal',
    });
}

// ─── Company Welcome Email ──────────────────────────────────────────────────

export interface CompanyWelcomeData {
    companyName: string;
    adminName: string;
    dashboardUrl: string;
    source?: EmailSource;
}

export function companyWelcomeEmail(data: CompanyWelcomeData): string {
    const content = `
${heading({ level: 1, text: `${data.companyName} is ready to hire on Splits Network` })}

${paragraph(
        `Hi ${data.adminName}, your company is set up and ready to go. Splits Network gives you access to a network of skilled recruiters who can help fill your open roles.`
    )}

${infoCard({
        title: 'Getting Started',
        items: [
            { label: '1', value: 'Post jobs \u2014 create job listings for recruiters to fill' },
            { label: '2', value: 'Connect with recruiters \u2014 invite or accept recruiters to your network' },
            { label: '3', value: 'Set up billing \u2014 configure payment terms and billing details' },
            { label: '4', value: 'Review applications \u2014 screen candidates submitted by your recruiting network' },
        ],
    })}

${button({
        href: data.dashboardUrl,
        text: 'Post Your First Job \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('Recruiters in the Splits Network are ready to help you hire. Post a job to get started, and qualified candidates will start coming in.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `${data.companyName} is set up on Splits Network — start hiring with your recruiter network.`,
        source: data.source || 'portal',
    });
}
