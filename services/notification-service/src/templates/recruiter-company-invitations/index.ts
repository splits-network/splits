/**
 * Recruiter-Company Invitation Email Templates
 * Emails for company-to-recruiter invitation flow
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, infoCard, alert, divider } from '../components.js';

// ─── Invitation Email (sent to recruiter) ────────────────────────────────────

export interface RecruiterCompanyInvitationData {
    companyName: string;
    inviterName: string;
    personalMessage?: string;
    relationshipType?: 'recruiter' | 'sourcer';
    permissions?: {
        can_view_jobs?: boolean;
        can_create_jobs?: boolean;
        can_edit_jobs?: boolean;
        can_submit_candidates?: boolean;
        can_view_applications?: boolean;
        can_advance_candidates?: boolean;
    };
    invitationsLink: string;
    source?: EmailSource;
}

export function recruiterCompanyInvitationEmail(data: RecruiterCompanyInvitationData): string {
    const roleLabel = data.relationshipType === 'sourcer' ? 'Sourcer' : 'Recruiter';

    const content = `
${heading({ level: 1, text: 'Company partnership invitation' })}

${paragraph(`<strong>${data.inviterName}</strong> from <strong>${data.companyName}</strong> has invited you to represent their company as a <strong>${roleLabel.toLowerCase()}</strong> on Splits Network.`)}

${alert({
        type: 'info',
        title: 'What does this mean?',
        message: 'This is a formal business relationship — not a casual connection. If you accept, you will officially represent this company as a recruiting partner. You can submit candidates to their open roles, and when your candidates get hired, you earn placement fees per their billing terms. The company has pre-configured your permissions, and you\'ll review the full agreement before accepting.',
    })}

${data.personalMessage ? alert({
        type: 'info',
        title: 'Message from ' + data.inviterName,
        message: data.personalMessage,
    }) : ''}

${infoCard({
        title: 'Invitation Details',
        items: [
            { label: 'Company', value: data.companyName, highlight: true },
            { label: 'Invited by', value: data.inviterName },
            { label: 'Role', value: roleLabel },
            ...(data.permissions ? [{ label: 'Permissions', value: formatPermissionSummary(data.permissions) }] : []),
            { label: 'Status', value: 'Awaiting your review', highlight: true },
        ],
    })}

${paragraph(`<strong>What happens if you accept:</strong><br/>• You officially represent ${data.companyName} and can submit candidates to their open roles<br/>• When a candidate you submit gets hired, you receive placement attribution and fees<br/>• Your permissions are set by the company — they control what you can view and do<br/>• Either party can end the relationship at any time from the network dashboard`)}

${button({
        href: data.invitationsLink,
        text: 'Review & Respond →',
        variant: 'primary',
    })}

${divider()}

${paragraph('You will walk through a 3-step review: learn about the company, read the agreement, then accept or decline.')}

${paragraph(`<em style="color: #71717a; font-size: 13px;">If you don't recognize the sender or weren't expecting this invitation, you can safely ignore this email.</em>`)}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.companyName} invited you to represent them as a ${roleLabel.toLowerCase()} on Splits Network`,
        content,
        source: data.source || 'portal',
    });
}

function formatPermissionSummary(permissions: Record<string, boolean | undefined>): string {
    const enabled = Object.values(permissions).filter(Boolean).length;
    const total = Object.keys(permissions).length;
    return `${enabled} of ${total} enabled`;
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
${heading({ level: 1, text: 'Invitation accepted' })}

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
        text: 'View Network →',
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
${heading({ level: 1, text: 'Invitation declined' })}

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
        text: 'View Network →',
        variant: 'secondary',
    })}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.recruiterName} declined your invitation`,
        content,
        source: data.source || 'portal',
    });
}
