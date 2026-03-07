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
    recruiterEmail?: string;
    message?: string;
    connectionUrl: string;
    source?: EmailSource;
}

export function connectionRequestedEmail(data: ConnectionRequestedData): string {
    const recruiterIdentifier = data.recruiterEmail
        ? `<strong>${data.recruiterName}</strong> (${data.recruiterEmail})`
        : `<strong>${data.recruiterName}</strong>`;

    const content = `
${heading({ level: 1, text: 'Recruiter representation request' })}

${paragraph(`${recruiterIdentifier} is requesting to <strong>represent ${data.companyName}</strong> as a recruiting partner on Splits Network.`)}

${alert({
        type: 'info',
        title: 'What does this mean?',
        message: 'This is a formal business relationship request — not a social connection. If you accept, this recruiter will represent your company and may earn placement fees for successful hires. You choose exactly which permissions to grant — viewing jobs, submitting candidates, advancing applications, or managing listings. You control the access level and can change or revoke it at any time.',
    })}

${data.message ? alert({
        type: 'info',
        title: 'Message from recruiter',
        message: data.message,
    }) : ''}

${infoCard({
        title: 'Request Details',
        items: [
            { label: 'Recruiter', value: data.recruiterName },
            ...(data.recruiterEmail ? [{ label: 'Email', value: data.recruiterEmail }] : []),
            { label: 'Requesting', value: 'To represent your company as a recruiting partner' },
            { label: 'Status', value: 'Awaiting your review', highlight: true },
        ],
    })}

${paragraph(`<strong>What happens if you accept:</strong><br/>• You set the permissions — view jobs, submit candidates, advance applications, create/edit listings<br/>• When the recruiter submits a candidate who gets hired, they receive placement fees per your billing terms<br/>• You can end the relationship anytime from your network dashboard`)}

${button({
        href: data.connectionUrl,
        text: 'Review & Respond \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('You will walk through a 3-step review: learn about the recruiter, read the agreement, then set permissions and accept or decline.')}

${paragraph(`<em style="color: #71717a; font-size: 13px;">This notification was sent to all administrators of ${data.companyName}.</em>`)}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `${data.recruiterName} is requesting to represent ${data.companyName} as a recruiter. Review and respond.`,
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
