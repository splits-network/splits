/**
 * Company Platform Invitation Email Templates
 * Branded templates for recruiter-to-company platform invitations
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, infoCard, alert, divider, list } from '../components';

export interface CompanyPlatformInvitationData {
    recruiterName: string;
    personalMessage?: string;
    companyNameHint?: string;
    inviteCode: string;
    invitationLink: string;
    expiresDate: string;
    source?: EmailSource;
}

export function companyPlatformInvitationEmail(data: CompanyPlatformInvitationData): string {
    const greeting = data.companyNameHint
        ? `<strong>${data.recruiterName}</strong> has invited ${data.companyNameHint} to join`
        : `<strong>${data.recruiterName}</strong> has invited you to join`;

    const personalMessageSection = data.personalMessage
        ? `
${divider()}

${heading({ level: 3, text: 'Message from ' + data.recruiterName })}

${paragraph(`"${data.personalMessage}"`)}
        `.trim()
        : '';

    const content = `
${heading({ level: 1, text: 'Join Splits Network' })}

${paragraph(`${greeting} <strong>Splits Network</strong> — the marketplace for collaborative recruiting.`)}

${personalMessageSection}

${divider()}

${heading({ level: 2, text: 'Why Join Splits Network?' })}

${list([
    { text: 'Access a network of vetted recruiters ready to help fill your open roles', bold: false },
    { text: 'Reduce time-to-hire with split-fee recruiting partnerships', bold: false },
    { text: 'Pay only for successful placements — no upfront costs', bold: false },
    { text: 'Transparent, market-driven fee structures', bold: false },
])}

${divider()}

${paragraph('Click the button below to create your company account:')}

${button({
    href: data.invitationLink,
    text: 'Join Splits Network',
    variant: 'primary',
})}

${divider({ text: 'or use this code' })}

${infoCard({
    title: 'Your Invitation Code',
    items: [
        { label: 'Code', value: data.inviteCode, highlight: true },
        { label: 'Invited by', value: data.recruiterName },
        { label: 'Expires', value: data.expiresDate },
    ],
})}

${paragraph(`Visit <a href="${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/join" style="color: #233876; text-decoration: none; font-weight: 600;">splits.network/join</a> and enter the code above to join.`)}

${divider()}

${alert({
    type: 'info',
    message: `This invitation expires on ${data.expiresDate}. If you don't recognize the sender or weren't expecting this invitation, you can safely ignore this email.`,
})}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.recruiterName} invited you to join Splits Network`,
        content,
        source: data.source || 'portal',
    });
}

export interface CompanyInvitationAcceptedData {
    recruiterName: string;
    companyName: string;
    companyAdminName: string;
    source?: EmailSource;
}

export function companyInvitationAcceptedEmail(data: CompanyInvitationAcceptedData): string {
    const content = `
${heading({ level: 1, text: 'Invitation Accepted!' })}

${alert({
    type: 'success',
    title: 'Great news!',
    message: `${data.companyName} has joined Splits Network using your invitation.`,
})}

${infoCard({
    title: 'New Company Details',
    items: [
        { label: 'Company', value: data.companyName, highlight: true },
        { label: 'Admin', value: data.companyAdminName },
        { label: 'Your Role', value: 'Sourcer (platform attribution)' },
    ],
})}

${paragraph(`As the recruiter who brought ${data.companyName} to Splits Network, you've been automatically connected as their <strong>sourcer</strong>. This means you'll be recognized for helping grow the platform.`)}

${divider()}

${heading({ level: 2, text: 'What\'s Next?' })}

${list([
    { text: 'The company will set up their profile and post open roles', bold: false },
    { text: 'You can reach out to discuss potential recruiting partnerships', bold: false },
    { text: 'Build your network by inviting more companies', bold: false },
])}

${button({
    href: `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/dashboard`,
    text: 'View Dashboard',
    variant: 'secondary',
})}

${divider()}

${paragraph('Keep growing your network — each company you bring helps expand opportunities for everyone.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.companyName} accepted your invitation to Splits Network`,
        content,
        source: data.source || 'portal',
    });
}
