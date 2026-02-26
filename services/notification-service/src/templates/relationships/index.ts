/**
 * Relationship Management Email Templates
 * Templates for connection requests, relationship termination, and invitation cancellation.
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, alert, infoCard, divider } from '../components';

// ─── Connection Requested ────────────────────────────────────────────────────

export interface ConnectionRequestedData {
    companyName: string;
    recruiterName: string;
    message?: string;
    connectionUrl: string;
    source?: EmailSource;
}

export function connectionRequestedEmail(data: ConnectionRequestedData): string {
    const content = `
${heading({ level: 1, text: 'New recruiter connection request' })}

${paragraph(`<strong>${data.recruiterName}</strong> wants to connect with <strong>${data.companyName}</strong> on Splits Network.`)}

${data.message ? alert({
        type: 'info',
        title: 'Message from recruiter',
        message: data.message,
    }) : ''}

${infoCard({
        title: 'Connection Details',
        items: [
            { label: 'Recruiter', value: data.recruiterName },
            { label: 'Request Status', value: 'Pending', highlight: true },
        ],
    })}

${button({
        href: data.connectionUrl,
        text: 'Review Connection Request \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('You can approve or decline this request from your network dashboard.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `${data.recruiterName} wants to connect with ${data.companyName} on Splits Network.`,
        source: data.source || 'portal',
    });
}

// ─── Relationship Terminated ─────────────────────────────────────────────────

export interface RelationshipTerminatedData {
    recipientName: string;
    otherPartyName: string;
    relationshipType: 'recruiter-company' | 'recruiter-candidate';
    reason?: string;
    dashboardUrl: string;
    source?: EmailSource;
}

export function relationshipTerminatedEmail(data: RelationshipTerminatedData): string {
    const typeLabel = data.relationshipType === 'recruiter-company'
        ? 'recruiter/company'
        : 'recruiter/candidate';

    const content = `
${heading({ level: 1, text: 'Recruiting relationship ended' })}

${paragraph(`Your ${typeLabel} relationship with <strong>${data.otherPartyName}</strong> has been terminated.`)}

${data.reason ? alert({
        type: 'info',
        title: 'Reason provided',
        message: data.reason,
    }) : ''}

${paragraph('No new candidate submissions can be made under this relationship. Any existing placements and active submissions will continue to be honored through completion.')}

${button({
        href: data.dashboardUrl,
        text: 'View Your Network \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('If you believe this was done in error, please reach out to the other party or contact support.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Your relationship with ${data.otherPartyName} has been terminated.`,
        source: data.source || 'portal',
    });
}

// ─── Invitation Cancelled ────────────────────────────────────────────────────

export interface InvitationCancelledData {
    candidateName: string;
    recruiterName: string;
    dashboardUrl: string;
    source?: EmailSource;
}

export function invitationCancelledEmail(data: InvitationCancelledData): string {
    const content = `
${heading({ level: 1, text: 'Invitation withdrawn' })}

${paragraph(`<strong>${data.recruiterName}</strong> has withdrawn their invitation. No action is needed on your part.`)}

${paragraph('If you were in the process of accepting this invitation, please disregard any previous links. They are no longer valid.')}

${button({
        href: data.dashboardUrl,
        text: 'Go to Dashboard \u2192',
        variant: 'primary',
    })}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `${data.recruiterName} has withdrawn their invitation.`,
        source: data.source || 'candidate',
    });
}
