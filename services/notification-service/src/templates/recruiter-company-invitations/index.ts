/**
 * Recruiter-Company Invitation Email Templates
 * Emails for company-to-recruiter invitation flow
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, infoCard, alert, divider } from '../components';

// ─── Invitation Email (sent to recruiter) ────────────────────────────────────

export interface RecruiterCompanyInvitationData {
    companyName: string;
    inviterName: string;
    personalMessage?: string;
    invitationsLink: string;
    source?: EmailSource;
}

export function recruiterCompanyInvitationEmail(data: RecruiterCompanyInvitationData): string {
    const personalMessageSection = data.personalMessage
        ? `
${divider()}

${heading({ level: 3, text: 'Message from ' + data.inviterName })}

${paragraph(`"${data.personalMessage}"`)}
        `.trim()
        : '';

    const content = `
${heading({ level: 1, text: 'Company Invitation' })}

${paragraph(`<strong>${data.inviterName}</strong> from <strong>${data.companyName}</strong> has invited you to join their recruiting network on Splits Network.`)}

${personalMessageSection}

${divider()}

${infoCard({
        title: 'Invitation Details',
        items: [
            { label: 'Company', value: data.companyName, highlight: true },
            { label: 'Invited by', value: data.inviterName },
        ],
    })}

${paragraph('Review and respond to this invitation from your portal:')}

${button({
        href: data.invitationsLink,
        text: 'View Invitation',
        variant: 'primary',
    })}

${divider()}

${alert({
        type: 'info',
        message: 'If you don\'t recognize the sender or weren\'t expecting this invitation, you can safely ignore this email.',
    })}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.companyName} invited you to join their recruiting network`,
        content,
        source: data.source || 'portal',
    });
}

// ─── Accepted Email (sent to inviter) ────────────────────────────────────────

export interface RecruiterCompanyAcceptedData {
    recruiterName: string;
    companyName: string;
    portalLink: string;
    source?: EmailSource;
}

export function recruiterCompanyAcceptedEmail(data: RecruiterCompanyAcceptedData): string {
    const content = `
${heading({ level: 1, text: 'Invitation Accepted' })}

${alert({
        type: 'success',
        title: 'Great news!',
        message: `${data.recruiterName} has accepted the invitation to join ${data.companyName}'s recruiting network.`,
    })}

${infoCard({
        title: 'Connection Details',
        items: [
            { label: 'Recruiter', value: data.recruiterName, highlight: true },
            { label: 'Company', value: data.companyName },
            { label: 'Status', value: 'Active' },
        ],
    })}

${paragraph(`You can now collaborate with ${data.recruiterName} on open roles and placements.`)}

${button({
        href: data.portalLink,
        text: 'View Network',
        variant: 'secondary',
    })}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.recruiterName} accepted your invitation to join ${data.companyName}`,
        content,
        source: data.source || 'portal',
    });
}

// ─── Declined Email (sent to inviter) ────────────────────────────────────────

export interface RecruiterCompanyDeclinedData {
    recruiterName: string;
    companyName: string;
    portalLink: string;
    source?: EmailSource;
}

export function recruiterCompanyDeclinedEmail(data: RecruiterCompanyDeclinedData): string {
    const content = `
${heading({ level: 1, text: 'Invitation Declined' })}

${alert({
        type: 'warning',
        message: `${data.recruiterName} has declined the invitation to join ${data.companyName}'s recruiting network.`,
    })}

${infoCard({
        title: 'Connection Details',
        items: [
            { label: 'Recruiter', value: data.recruiterName },
            { label: 'Company', value: data.companyName },
            { label: 'Status', value: 'Declined' },
        ],
    })}

${paragraph('You can invite other recruiters to join your network from the portal.')}

${button({
        href: data.portalLink,
        text: 'View Network',
        variant: 'secondary',
    })}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.recruiterName} declined your invitation`,
        content,
        source: data.source || 'portal',
    });
}
