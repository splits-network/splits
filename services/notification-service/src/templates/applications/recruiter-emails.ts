/**
 * Recruiter-Specific Email Templates
 * Tailored notifications for recruiters at key application milestones
 */

import { baseEmailTemplate } from '../base';
import { heading, paragraph, button, infoCard, alert, divider } from '../components';

// ============================================================================
// Company Review Stage
// ============================================================================

export interface RecruiterCompanyReviewData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
}

export function recruiterCompanyReviewEmail(data: RecruiterCompanyReviewData): string {
    const content = `
${heading({ level: 1, text: 'Company Is Reviewing Your Candidate' })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${paragraph(
        `Great news! <strong>${data.companyName}</strong> has started reviewing <strong>${data.candidateName}</strong>'s application for <strong>${data.jobTitle}</strong>.`
    )}

${infoCard({
        title: 'Review Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Status', value: 'Under Company Review', highlight: true },
        ],
    })}

${alert({
        type: 'info',
        title: 'What to Expect',
        message: 'The company will review the application and may provide feedback, request an interview, or make a decision. Typical review times are 3-7 business days.',
    })}

${button({
        href: data.applicationUrl,
        text: 'Track Progress \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('Stay available in case the company has questions about your candidate.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.companyName} is reviewing ${data.candidateName}'s application`,
        content,
        source: 'portal',
    });
}

// ============================================================================
// Company Feedback Stage
// ============================================================================

export interface RecruiterCompanyFeedbackData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
}

export function recruiterCompanyFeedbackEmail(data: RecruiterCompanyFeedbackData): string {
    const content = `
${heading({ level: 1, text: 'Company Feedback Received' })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${paragraph(
        `<strong>${data.companyName}</strong> has provided feedback on <strong>${data.candidateName}</strong>'s application for <strong>${data.jobTitle}</strong>.`
    )}

${infoCard({
        title: 'Feedback Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Status', value: 'Feedback Provided', highlight: true },
        ],
    })}

${alert({
        type: 'info',
        title: 'Action May Be Required',
        message: 'Review the company\'s feedback and coordinate with your candidate on any next steps. The feedback may include requests for additional information or scheduling.',
    })}

${button({
        href: data.applicationUrl,
        text: 'View Feedback \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('Respond to feedback promptly to keep the hiring process moving forward.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.companyName} provided feedback on ${data.candidateName}'s application`,
        content,
        source: 'portal',
    });
}

// ============================================================================
// Interview Stage
// ============================================================================

export interface RecruiterInterviewScheduledData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
}

export function recruiterInterviewScheduledEmail(data: RecruiterInterviewScheduledData): string {
    const content = `
${heading({ level: 1, text: 'Interview Scheduled!' })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${paragraph(
        `Your candidate <strong>${data.candidateName}</strong> has been invited to interview for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong>.`
    )}

${alert({
        type: 'success',
        title: 'Milestone Reached',
        message: 'This is a great sign! The company is seriously considering your candidate.',
    })}

${infoCard({
        title: 'Interview Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Status', value: 'Interview Stage', highlight: true },
        ],
    })}

${paragraph('<strong>Recommended Actions:</strong>')}

${paragraph(
        `1. Reach out to ${data.candidateName} to help them prepare<br>
2. Share any insights about the company culture and interview process<br>
3. Ensure your candidate is responsive and available for scheduling`
    )}

${button({
        href: data.applicationUrl,
        text: 'View Application \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('Tip: Candidates who receive interview prep support from their recruiter are more likely to succeed.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Interview: ${data.candidateName} for ${data.jobTitle} at ${data.companyName}`,
        content,
        source: 'portal',
    });
}

// ============================================================================
// Offer Stage
// ============================================================================

export interface RecruiterOfferExtendedData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
}

export function recruiterOfferExtendedEmail(data: RecruiterOfferExtendedData): string {
    const content = `
${heading({ level: 1, text: 'Offer Extended to Your Candidate!' })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${alert({
        type: 'success',
        title: 'Outstanding News!',
        message: `${data.companyName} has extended a job offer to ${data.candidateName} for the ${data.jobTitle} position.`,
    })}

${infoCard({
        title: 'Offer Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Status', value: 'Offer Extended', highlight: true },
        ],
    })}

${paragraph('<strong>Important Next Steps:</strong>')}

${paragraph(
        `1. Connect with ${data.candidateName} to discuss the offer<br>
2. Help negotiate terms if needed<br>
3. Facilitate a smooth acceptance process`
    )}

${button({
        href: data.applicationUrl,
        text: 'View Offer Details \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('Once the candidate accepts, a placement record will be created automatically.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Offer extended: ${data.candidateName} for ${data.jobTitle} at ${data.companyName}`,
        content,
        source: 'portal',
    });
}

// ============================================================================
// Hired Stage
// ============================================================================

export interface RecruiterCandidateHiredData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
}

export function recruiterCandidateHiredEmail(data: RecruiterCandidateHiredData): string {
    const content = `
${heading({ level: 1, text: 'Congratulations \u2014 Placement Made!' })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${alert({
        type: 'success',
        title: 'Placement Confirmed!',
        message: `${data.candidateName} has been hired for the ${data.jobTitle} position at ${data.companyName}. A placement record has been created.`,
    })}

${infoCard({
        title: 'Placement Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Status', value: 'Hired', highlight: true },
        ],
    })}

${paragraph('<strong>What Happens Next:</strong>')}

${paragraph(
        '1. A placement record has been automatically created<br>2. The split-fee arrangement will be processed per your agreement<br>3. Stay in touch with your candidate during their onboarding period'
    )}

${button({
        href: data.applicationUrl,
        text: 'View Placement \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('Great work! This placement will be reflected in your dashboard and reputation score.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Placement: ${data.candidateName} hired as ${data.jobTitle} at ${data.companyName}`,
        content,
        source: 'portal',
    });
}

// ============================================================================
// Rejected Stage
// ============================================================================

export interface RecruiterCandidateRejectedData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
}

export function recruiterCandidateRejectedEmail(data: RecruiterCandidateRejectedData): string {
    const content = `
${heading({ level: 1, text: 'Application Not Moving Forward' })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${alert({
        type: 'warning',
        title: 'Application Update',
        message: `The application for ${data.candidateName} at ${data.companyName} was not moved forward for the ${data.jobTitle} position.`,
    })}

${infoCard({
        title: 'Application Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Status', value: 'Rejected', highlight: true },
        ],
    })}

${paragraph('<strong>Recommended Actions:</strong>')}

${paragraph(
        `1. Inform ${data.candidateName} with empathy and professionalism<br>
2. Review the application for learnings to improve future submissions<br>
3. Consider other open roles that might be a better fit`
    )}

${button({
        href: data.applicationUrl,
        text: 'View Details \u2192',
        variant: 'secondary',
    })}

${divider()}

${paragraph(
        'Browse other opportunities in your <a href="https://splits.network/portal/roles" style="color: #233876; text-decoration: underline;">roles dashboard</a>.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `Update: ${data.candidateName}'s application for ${data.jobTitle}`,
        content,
        source: 'portal',
    });
}

// ============================================================================
// Application Expired — Stage-Aware
// ============================================================================

export interface RecruiterApplicationExpiredData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    expiredFromStage?: string;
    applicationUrl: string;
}

function getRecruiterExpiredContent(data: RecruiterApplicationExpiredData): {
    title: string;
    alertType: 'info' | 'warning';
    alertTitle: string;
    message: string;
    ctaText: string;
} {
    const stage = data.expiredFromStage;

    if (stage === 'screen') {
        return {
            title: 'Pipeline Stall',
            alertType: 'warning',
            alertTitle: 'Pipeline Stall',
            message: `Your application for <strong>${data.candidateName}</strong> at <strong>${data.jobTitle}</strong> expired during screening.`,
            ctaText: 'Review Your Pipeline \u2192',
        };
    }

    if (stage === 'recruiter_proposed') {
        return {
            title: 'Proposal Unresponded',
            alertType: 'info',
            alertTitle: 'Proposal Unresponded',
            message: `<strong>${data.candidateName}</strong> didn't respond to your proposal for <strong>${data.jobTitle}</strong>.`,
            ctaText: 'Find Another Candidate \u2192',
        };
    }

    if (stage === 'submitted' || stage === 'company_review' || stage === 'company_feedback') {
        const stageLabel = stage === 'submitted' ? 'submission' : stage === 'company_review' ? 'company review' : 'company feedback';
        return {
            title: 'Company Inaction',
            alertType: 'warning',
            alertTitle: 'Company Inaction',
            message: `<strong>${data.companyName}</strong> let the application for <strong>${data.candidateName}</strong> at <strong>${data.jobTitle}</strong> expire during ${stageLabel}.`,
            ctaText: `Follow Up with ${data.companyName} \u2192`,
        };
    }

    return {
        title: 'Application Expired',
        alertType: 'warning',
        alertTitle: 'Application Expired',
        message: `The application for <strong>${data.candidateName}</strong> at <strong>${data.jobTitle}</strong> has expired.`,
        ctaText: 'View Details \u2192',
    };
}

export function recruiterApplicationExpiredEmail(data: RecruiterApplicationExpiredData): string {
    const cfg = getRecruiterExpiredContent(data);

    const content = `
${heading({ level: 1, text: cfg.title })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${alert({ type: cfg.alertType, title: cfg.alertTitle, message: cfg.message })}

${infoCard({
        title: 'Application Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Status', value: 'Expired', highlight: true },
        ],
    })}

${button({
        href: data.applicationUrl,
        text: cfg.ctaText,
        variant: 'primary',
    })}

${divider()}

${paragraph(
        'Browse other opportunities in your <a href="https://splits.network/portal/roles" style="color: #233876; text-decoration: underline;">roles dashboard</a>.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `Application expired: ${data.candidateName} for ${data.jobTitle}`,
        content,
        source: 'portal',
    });
}

// ============================================================================
// Expiration Warning for Recruiters
// ============================================================================

export interface RecruiterExpirationWarningData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    stage: string;
    daysRemaining: number;
    applicationUrl: string;
}

export function recruiterExpirationWarningEmail(data: RecruiterExpirationWarningData): string {
    const isRecruiterResponsible = data.stage === 'screen';
    const message = isRecruiterResponsible
        ? `You have <strong>${data.daysRemaining} day${data.daysRemaining === 1 ? '' : 's'}</strong> to advance <strong>${data.candidateName}</strong>'s application for <strong>${data.jobTitle}</strong>.`
        : `<strong>${data.companyName}</strong> hasn't acted on <strong>${data.candidateName}</strong>'s application for <strong>${data.jobTitle}</strong> \u2014 it expires in <strong>${data.daysRemaining} day${data.daysRemaining === 1 ? '' : 's'}</strong>.`;

    const content = `
${heading({ level: 1, text: 'Application Expiring Soon' })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${alert({ type: 'warning', title: 'Expiring Soon', message })}

${infoCard({
        title: 'Application Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Days Remaining', value: String(data.daysRemaining), highlight: true },
        ],
    })}

${button({
        href: data.applicationUrl,
        text: isRecruiterResponsible ? 'Review Application \u2192' : 'View Application \u2192',
        variant: 'primary',
    })}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.candidateName}'s application for ${data.jobTitle} expires in ${data.daysRemaining} days`,
        content,
        source: 'portal',
    });
}
