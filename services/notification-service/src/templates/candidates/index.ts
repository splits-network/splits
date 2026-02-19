/**
 * Candidate Email Templates
 * Professional branded templates for candidate-related notifications
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, infoCard, alert, divider, badge, list } from '../components';

export interface CandidateSourcedData {
    candidateName: string;
    sourceMethod: string;
    protectionPeriod: string;
    candidatesUrl: string;
    source?: EmailSource;
}

export function candidateSourcedEmail(data: CandidateSourcedData): string {
    const content = `
${heading({ level: 1, text: 'Candidate Successfully Sourced' })}

${alert({
        type: 'success',
        message: 'You have successfully claimed sourcing ownership for this candidate.',
    })}

${infoCard({
        title: 'Candidate Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Source Method', value: data.sourceMethod },
            { label: 'Protection Period', value: data.protectionPeriod, highlight: true },
        ],
    })}

${paragraph(
        'You now have exclusive rights to work with this candidate. Other recruiters will be notified if they attempt to source the same candidate.'
    )}

${button({
        href: data.candidatesUrl,
        text: 'View Candidate Profile →',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        '<strong>Protection Benefits:</strong> Your ownership is protected during the specified period, ensuring you receive credit for placements facilitated with this candidate.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `Sourcing ownership claimed for ${data.candidateName}`,
        content,
        source: data.source || 'portal',
    });
}

export interface OwnershipConflictData {
    candidateName: string;
    attemptingRecruiterName: string;
    candidateUrl: string;
    source?: EmailSource;
}

export function ownershipConflictEmail(data: OwnershipConflictData): string {
    const content = `
${heading({ level: 1, text: 'Ownership Conflict Detected' })}

${alert({
        type: 'warning',
        title: 'Another Recruiter Attempted to Source Your Candidate',
        message: `${data.attemptingRecruiterName} attempted to claim sourcing ownership for a candidate you already sourced.`,
    })}

${infoCard({
        title: 'Conflict Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Attempting Recruiter', value: data.attemptingRecruiterName },
        ],
    })}

${paragraph(
        '<strong>Your ownership protection remains in place.</strong> The other recruiter has been informed that you have prior claim.'
    )}

${button({
        href: data.candidateUrl,
        text: 'View Candidate →',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        'This notification is for your awareness. No action is required - your rights are automatically protected by the platform.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `Ownership conflict for ${data.candidateName}`,
        content,
        source: data.source || 'portal',
    });
}

export interface OwnershipConflictRejectionData {
    candidateName: string;
    originalSourcerName: string;
    candidatesUrl: string;
    source?: EmailSource;
}

export function ownershipConflictRejectionEmail(data: OwnershipConflictRejectionData): string {
    const content = `
${heading({ level: 1, text: 'Candidate Already Claimed' })}

${alert({
        type: 'error',
        message: 'The candidate you attempted to source has already been claimed by another recruiter.',
    })}

${infoCard({
        title: 'Conflict Information',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Original Sourcer', value: data.originalSourcerName },
        ],
    })}

${paragraph(
        'The original sourcer has protection rights to this candidate. You may collaborate with them if they add you to a placement.'
    )}

${button({
        href: data.candidatesUrl,
        text: 'Browse Available Candidates →',
        variant: 'secondary',
    })}

${divider()}

${paragraph(
        '<strong>Why does this happen?</strong> Sourcing protection prevents duplicate claims and ensures fair credit allocation in split-fee recruiting.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `Cannot source ${data.candidateName} - already claimed`,
        content,
        source: data.source || 'portal',
    });
}

export interface CandidateAddedToNetworkData {
    candidateName: string;
    recruiterName?: string;
    portalUrl: string;
    source?: EmailSource;
}

export function candidateAddedToNetworkEmail(data: CandidateAddedToNetworkData): string {
    const content = `
${heading({ level: 1, text: "You've Been Added to a Recruiter's Network" })}

${alert({
        type: 'info',
        message: 'A recruiter has added you to their professional network on Splits.',
    })}

${infoCard({
        title: 'What This Means',
        items: [
            { label: 'Network Protection', value: 'This recruiter has exclusive rights to represent you' },
            { label: 'Duration', value: '365 days from today' },
            { label: 'Your Benefits', value: 'Priority access to job opportunities' },
        ],
    })}

${paragraph(
        'This recruiter will be your primary contact for job opportunities and career guidance. They are committed to helping you find the right position.'
    )}

${button({
        href: data.portalUrl,
        text: 'View Your Profile →',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        '<strong>Questions?</strong> If you did not expect this or have concerns, please contact us at help@splits.network'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: "You've been added to a recruiter's network",
        content,
        source: data.source || 'candidate',
    });
}

export interface CollaboratorAddedData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    role: string;
    splitPercentage: number;
    placementUrl: string;
    source?: EmailSource;
}

export function collaboratorAddedEmail(data: CollaboratorAddedData): string {
    const content = `
${heading({ level: 1, text: "You've Been Added as a Collaborator" })}

${alert({
        type: 'success',
        message: "You've been added to a placement team and will receive a split of the fee.",
    })}

${infoCard({
        title: 'Placement Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Your Role', value: data.role },
            { label: 'Your Split', value: `${data.splitPercentage}%`, highlight: true },
        ],
    })}

${paragraph('Work with the team to ensure a successful placement and earn your share of the fee.')}

${button({
        href: data.placementUrl,
        text: 'View Placement Details →',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        '<strong>Next Steps:</strong> Coordinate with other team members and fulfill your role responsibilities to help close this placement successfully.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `Added to placement: ${data.candidateName} at ${data.companyName}`,
        content,
        source: data.source || 'portal',
    });
}

// ─── Candidate Invitation ────────────────────────────────────────────────────

export interface CandidateInvitationEmailData {
    candidateName: string;
    recruiterName: string;
    recruiterEmail: string;
    recruiterBio: string;
    invitationUrl: string;
    expiryDate: string;
    source?: EmailSource;
}

export function candidateInvitationEmail(data: CandidateInvitationEmailData): string {
    const content = `
${heading({ level: 1, text: `${data.recruiterName} wants to represent you` })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${paragraph(`<strong>${data.recruiterName}</strong> has invited you to join the <strong>Applicant Network</strong> and represent you in your job search.`)}

${infoCard({
        title: 'About Your Recruiter',
        items: [
            { label: 'Recruiter', value: data.recruiterName, highlight: true },
            { label: 'Contact', value: data.recruiterEmail },
            ...(data.recruiterBio ? [{ label: 'About', value: data.recruiterBio }] : []),
        ],
    })}

${heading({ level: 2, text: 'What is the Applicant Network?' })}

${list([
        { text: 'Track job opportunities your recruiter finds for you', bold: false },
        { text: 'Manage your applications in one place', bold: false },
        { text: 'Communicate directly with your recruiter', bold: false },
        { text: 'Stay informed about your job search progress', bold: false },
    ])}

${heading({ level: 2, text: 'What is "Right to Represent"?' })}

${paragraph(`By accepting, you\'re giving <strong>${data.recruiterName}</strong> permission to submit your profile to job opportunities on your behalf. This formalises your working relationship, prevents duplicate submissions, and ensures fair credit for placements they help facilitate.`)}

${button({
        href: data.invitationUrl,
        text: 'Review & Accept Invitation →',
        variant: 'primary',
    })}

${divider()}

${alert({
        type: 'info',
        title: `Invitation expires ${data.expiryDate}`,
        message: `If you don't respond, ${data.recruiterName} will need to send a new invitation.`,
    })}

${paragraph(`Questions? Contact ${data.recruiterName} at <a href="mailto:${data.recruiterEmail}" style="color: #233876;">${data.recruiterEmail}</a>.`)}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.recruiterName} invited you to join Applicant Network`,
        content,
        source: 'candidate',
    });
}

// ─── Consent Given (recruiter notification) ─────────────────────────────────

export interface ConsentGivenEmailData {
    recruiterName: string;
    candidateName: string;
    candidateEmail: string;
    consentDate: string;
    candidatesUrl: string;
    source?: EmailSource;
}

export function consentGivenEmail(data: ConsentGivenEmailData): string {
    const content = `
${heading({ level: 1, text: `${data.candidateName} accepted your invitation!` })}

${alert({
        type: 'success',
        title: 'Right to represent granted',
        message: `${data.candidateName} has accepted your invitation and given you permission to represent them.`,
    })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${paragraph(`<strong>${data.candidateName}</strong> has accepted your invitation. You can now submit their profile to job opportunities.`)}

${infoCard({
        title: 'Candidate Details',
        items: [
            { label: 'Name', value: data.candidateName, highlight: true },
            { label: 'Email', value: data.candidateEmail },
            { label: 'Accepted On', value: data.consentDate },
        ],
    })}

${heading({ level: 2, text: "What's Next?" })}

${list([
        { text: 'Review their profile and update any missing information', bold: false },
        { text: 'Identify suitable job opportunities that match their skills', bold: false },
        { text: 'Submit their profile to open positions', bold: false },
        { text: 'Keep them updated on application progress', bold: false },
    ])}

${button({
        href: data.candidatesUrl,
        text: 'View Candidate Profile →',
        variant: 'primary',
    })}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.candidateName} accepted your invitation`,
        content,
        source: data.source || 'portal',
    });
}

// ─── Consent Declined (recruiter notification) ───────────────────────────────

export interface ConsentDeclinedEmailData {
    recruiterName: string;
    candidateName: string;
    candidateEmail: string;
    declinedDate: string;
    declinedReason?: string | null;
    candidatesUrl: string;
    source?: EmailSource;
}

export function consentDeclinedEmail(data: ConsentDeclinedEmailData): string {
    const reasonSection = data.declinedReason
        ? `\n\n${infoCard({
            title: "Their Message",
            items: [{ label: 'Reason', value: `"${data.declinedReason}"` }],
        })}`
        : '';

    const content = `
${heading({ level: 1, text: `${data.candidateName} declined your invitation` })}

${alert({
        type: 'warning',
        title: 'Invitation declined',
        message: `${data.candidateName} has decided not to proceed at this time.`,
    })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${paragraph(`<strong>${data.candidateName}</strong> has declined your invitation to work together on Applicant Network.`)}

${infoCard({
        title: 'Response Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Email', value: data.candidateEmail },
            { label: 'Declined On', value: data.declinedDate },
        ],
    })}${reasonSection}

${heading({ level: 2, text: 'What You Can Do' })}

${list([
        { text: 'If they provided feedback, consider adjusting your outreach approach', bold: false },
        { text: 'You can reach out directly to address any concerns or misunderstandings', bold: false },
        { text: 'Focus on building relationships with other candidates in your network', bold: false },
        { text: 'Review your invitation message and strategy', bold: false },
    ])}

${button({
        href: data.candidatesUrl,
        text: 'View Your Candidates →',
        variant: 'secondary',
    })}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.candidateName} declined your invitation`,
        content,
        source: data.source || 'portal',
    });
}
