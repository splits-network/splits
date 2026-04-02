/**
 * Match Invite Email Templates
 * Notifications for the "Invite to Apply" feature on matched candidates
 */

import { baseEmailTemplate, EmailSource } from '../base.js';
import { heading, paragraph, button, infoCard, alert, divider } from '../components.js';

/* ─── Recruiter Invite ──────────────────────────────────────────────────────── */

export interface RecruiterInviteData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    matchScore: number;
    matchUrl: string;
    source?: EmailSource;
}

export function recruiterInviteEmail(data: RecruiterInviteData): string {
    const content = `
${heading({ level: 1, text: 'A company is interested in your candidate' })}

${alert({
    type: 'info',
    title: 'Company Interest Received',
    message: `${data.companyName} has expressed interest in ${data.candidateName} for the ${data.jobTitle} role. Match score: ${data.matchScore}%.`,
})}

${infoCard({
    title: 'Match Details',
    items: [
        { label: 'Candidate', value: data.candidateName },
        { label: 'Position', value: data.jobTitle },
        { label: 'Company', value: data.companyName },
        { label: 'Match Score', value: `${data.matchScore}%` },
    ],
})}

${paragraph(
    'The hiring company has reviewed this candidate match and would like to move forward. Please review the match details and submit the candidate if appropriate.'
)}

${button({
    href: data.matchUrl,
    text: 'Review & Submit Candidate →',
    variant: 'primary',
})}

${divider()}

${paragraph(
    '<strong>What happens next?</strong> Use the Submit Candidate flow to formally present this candidate to the company. Include a pitch and any relevant documents.'
)}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.companyName} is interested in ${data.candidateName} for ${data.jobTitle}`,
        content,
        source: data.source,
    });
}

/* ─── Candidate Represented ─────────────────────────────────────────────────── */

export interface CandidateRepresentedInviteData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    recruiterName: string;
    source?: EmailSource;
}

export function candidateRepresentedInviteEmail(data: CandidateRepresentedInviteData): string {
    const content = `
${heading({ level: 1, text: 'A company is interested in you' })}

${alert({
    type: 'success',
    title: 'Great News!',
    message: `A company has expressed interest in you for the ${data.jobTitle} role at ${data.companyName}.`,
})}

${paragraph(
    `Your recruiter, <strong>${data.recruiterName}</strong>, has been notified and will follow up with you about this opportunity. No action is needed on your part right now.`
)}

${divider()}

${paragraph(
    'Your recruiter will review the role details and reach out to discuss next steps if this is a good fit for you.'
)}
    `.trim();

    return baseEmailTemplate({
        preheader: `A company is interested in you for ${data.jobTitle} — your recruiter has been notified`,
        content,
        source: data.source,
    });
}

/* ─── Candidate Direct (Unrepresented) ──────────────────────────────────────── */

export interface CandidateDirectInviteData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applyUrl: string;
    source?: EmailSource;
}

export function candidateDirectInviteEmail(data: CandidateDirectInviteData): string {
    const content = `
${heading({ level: 1, text: "You've been invited to apply" })}

${alert({
    type: 'success',
    title: 'Company Invitation',
    message: `${data.companyName} has reviewed your profile and would like you to apply for the ${data.jobTitle} role.`,
})}

${infoCard({
    title: 'Role Details',
    items: [
        { label: 'Position', value: data.jobTitle },
        { label: 'Company', value: data.companyName },
    ],
})}

${paragraph(
    "This invitation was sent because your profile is a strong match for this role. Click below to view the full details and submit your application."
)}

${button({
    href: data.applyUrl,
    text: 'View Role & Apply →',
    variant: 'primary',
})}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.companyName} has invited you to apply for ${data.jobTitle}`,
        content,
        source: data.source,
    });
}

/* ─── Invite Denied ─────────────────────────────────────────────────────────── */

export interface InviteDeniedData {
    inviterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    source?: EmailSource;
}

export function inviteDeniedEmail(data: InviteDeniedData): string {
    const content = `
${heading({ level: 1, text: 'Match invite declined' })}

${paragraph(
    `The invite to apply for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> for candidate <strong>${data.candidateName}</strong> has been declined.`
)}

${paragraph(
    'This may happen when the candidate or their recruiter determines the role is not the right fit. You can continue reviewing other matched candidates for this role.'
)}
    `.trim();

    return baseEmailTemplate({
        preheader: `Match invite for ${data.candidateName} was declined`,
        content,
        source: data.source,
    });
}
