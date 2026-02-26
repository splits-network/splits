/**
 * Recruiter Submission Email Templates
 * Notifications for recruiter-initiated opportunity proposals and candidate responses
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, infoCard, alert, divider } from '../components';

/**
 * Email sent to candidate when recruiter proposes a job opportunity
 * Invites candidate to review and approve/decline the opportunity
 */
export interface NewOpportunityData {
    candidateName: string;
    recruiterName: string;
    jobTitle: string;
    companyName: string;
    jobDescription?: string;
    recruiterPitch?: string;
    opportunityUrl: string;
    expiresAt?: string;
    source?: EmailSource;
}

export function newOpportunityEmail(data: NewOpportunityData): string {
    const content = `
${heading({ level: 1, text: 'New opportunity for you' })}

${alert({
    type: 'success',
    title: 'You Have a New Job Opportunity',
    message: `${data.recruiterName} has proposed a role that matches your profile. Review the details and let them know if you're interested!`,
})}

${infoCard({
    title: 'Opportunity Details',
    items: [
        { label: 'Position', value: data.jobTitle },
        { label: 'Company', value: data.companyName },
        { label: 'Proposed By', value: data.recruiterName },
        ...(data.expiresAt ? [{ label: 'Expires', value: data.expiresAt }] : []),
    ],
})}

${data.recruiterPitch ? `
${heading({ level: 2, text: 'Recruiter Message' })}

${paragraph(data.recruiterPitch)}
` : ''}

${data.jobDescription ? `
${heading({ level: 2, text: 'About the Role' })}

${paragraph(data.jobDescription)}
` : ''}

${paragraph(
    'This opportunity has been tailored specifically for you based on your background and experience. You have 7 days to review and respond.'
)}

${button({
    href: data.opportunityUrl,
    text: 'Review & Respond →',
    variant: 'primary',
})}

${divider()}

${paragraph(
    '<strong>What happens next?</strong> If you approve this opportunity, you\'ll complete your application and your recruiter will review it before submitting to the company.'
)}

${paragraph(
    'If this role isn\'t the right fit, you can decline and the recruiter will be notified. No action needed beyond that.'
)}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.recruiterName} has a new opportunity for you: ${data.jobTitle}`,
        content,
        source: data.source || 'candidate',
    });
}

/**
 * Email sent to recruiter when candidate approves a proposed opportunity
 * Confirms move from recruiter_proposed to draft application stage
 */
export interface CandidateApprovedData {
    candidateName: string;
    recruiterName: string;
    jobTitle: string;
    companyName: string;
    candidateEmail: string;
    applicationUrl: string;
    source?: EmailSource;
}

export function candidateApprovedEmail(data: CandidateApprovedData): string {
    const content = `
${heading({ level: 1, text: 'Opportunity approved' })}

${alert({
    type: 'success',
    title: 'Opportunity accepted',
    message: `${data.candidateName} has approved your proposed opportunity for ${data.jobTitle} at ${data.companyName}.`,
})}

${infoCard({
    title: 'Next Steps',
    items: [
        { label: 'Candidate', value: data.candidateName },
        { label: 'Email', value: data.candidateEmail },
        { label: 'Position', value: data.jobTitle },
        { label: 'Company', value: data.companyName },
    ],
})}

${paragraph(
    'The candidate has approved the opportunity. Your next steps:'
)}

${paragraph(`
<ul style="margin: 12px 0; padding-left: 20px;">
  <li><strong>Review the application</strong> and add your professional insights</li>
  <li><strong>Enhance and submit</strong> the application to the company when ready</li>
  <li><strong>Keep the candidate informed</strong> of progress through the process</li>
</ul>
`)}

${button({
    href: data.applicationUrl,
    text: 'View Application →',
    variant: 'primary',
})}

${divider()}

${paragraph(
    '<strong>Reminder:</strong> Maintain regular communication with the candidate and hiring manager to keep momentum and ensure a smooth interview process.'
)}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.candidateName} approved the opportunity for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}

/**
 * Email sent to recruiter when candidate declines a proposed opportunity
 * Includes optional decline reason/notes from candidate
 */
export interface CandidateDeclinedData {
    candidateName: string;
    recruiterName: string;
    jobTitle: string;
    companyName: string;
    declineReason?: string;
    candidateNotes?: string;
    othersSourceUrl?: string;
    source?: EmailSource;
}

export function candidateDeclinedEmail(data: CandidateDeclinedData): string {
    const content = `
${heading({ level: 1, text: 'Opportunity declined' })}

${alert({
    type: 'warning',
    message: `${data.candidateName} has declined your proposed opportunity for ${data.jobTitle} at ${data.companyName}.`,
})}

${infoCard({
    title: 'Decline Information',
    items: [
        { label: 'Candidate', value: data.candidateName },
        { label: 'Position', value: data.jobTitle },
        { label: 'Company', value: data.companyName },
        ...(data.declineReason ? [{ label: 'Reason', value: data.declineReason }] : []),
    ],
})}

${data.candidateNotes ? `
${heading({ level: 2, text: 'Candidate Message' })}

${paragraph(data.candidateNotes)}
` : ''}

${paragraph(
    'While this candidate isn\'t moving forward with this role, you can still explore other opportunities where they might be a better fit.'
)}

${data.othersSourceUrl ? `
${button({
    href: data.othersSourceUrl,
    text: 'Find Other Opportunities →',
    variant: 'secondary',
})}
` : ''}

${divider()}

${paragraph(
    'No action required. If the candidate provided a reason, review it to refine your approach for future proposals.'
)}

${paragraph(
    'If you believe there was a misunderstanding or want to re-engage with this candidate later, you can always reach out directly.'
)}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.candidateName} declined the opportunity for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}

/**
 * Email sent to candidate when a proposed opportunity expires
 * Lets them know they can no longer approve/decline the specific opportunity
 */
export interface OpportunityExpiredData {
    candidateName: string;
    recruiterName: string;
    jobTitle: string;
    companyName: string;
    exploreUrl: string;
    source?: EmailSource;
}

export function opportunityExpiredEmail(data: OpportunityExpiredData): string {
    const content = `
${heading({ level: 1, text: 'Opportunity expired' })}

${alert({
    type: 'info',
    message: `The opportunity proposed by ${data.recruiterName} has expired. No response is needed.`,
})}

${infoCard({
    title: 'Expired Opportunity',
    items: [
        { label: 'Position', value: data.jobTitle },
        { label: 'Company', value: data.companyName },
        { label: 'Proposed By', value: data.recruiterName },
    ],
})}

${paragraph(
    'Opportunities typically expire after 7 days without a response. If you\'re still interested in this role, reach out to the recruiter directly.'
)}

${button({
    href: data.exploreUrl,
    text: 'Explore More Opportunities →',
    variant: 'secondary',
})}

${divider()}

${paragraph(
    'If you\'re still interested in this type of role, reach out to your recruiter directly.'
)}
    `.trim();

    return baseEmailTemplate({
        preheader: `The opportunity for ${data.jobTitle} has expired`,
        content,
        source: data.source || 'candidate',
    });
}
