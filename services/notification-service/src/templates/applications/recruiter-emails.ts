/**
 * Recruiter-Specific Email Templates
 * Tailored notifications for recruiters at key application milestones
 */

import { baseEmailTemplate } from '../base.js';
import { heading, paragraph, button, infoCard, alert, divider } from '../components.js';

// ============================================================================
// Formatting Helpers
// ============================================================================

function formatSalary(salary?: number): string {
    if (!salary) return 'Not specified';
    return `$${salary.toLocaleString()}`;
}

function formatFee(fee?: number): string {
    if (!fee) return 'To be calculated';
    return `$${fee.toLocaleString()}`;
}

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
${heading({ level: 1, text: 'Company is reviewing your candidate' })}

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
${heading({ level: 1, text: 'Company feedback received' })}

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
${heading({ level: 1, text: 'Interview scheduled' })}

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
    salary?: number;
    feePercentage?: number;
    estimatedFee?: number;
}

export function recruiterOfferExtendedEmail(data: RecruiterOfferExtendedData): string {
    const offerItems: Array<{ label: string; value: string | number; highlight?: boolean }> = [
        { label: 'Candidate', value: data.candidateName },
        { label: 'Position', value: data.jobTitle },
        { label: 'Company', value: data.companyName },
        { label: 'Salary', value: formatSalary(data.salary) },
    ];

    if (data.feePercentage) {
        offerItems.push({ label: 'Fee Rate', value: `${data.feePercentage}%` });
    }

    if (data.estimatedFee || (data.salary && data.feePercentage)) {
        const estimated = data.estimatedFee || Math.round((data.salary! * data.feePercentage!) / 100);
        offerItems.push({ label: 'Estimated Fee', value: formatFee(estimated), highlight: true });
    }

    offerItems.push({ label: 'Status', value: 'Offer Extended', highlight: true });

    const content = `
${heading({ level: 1, text: 'Formal offer extended to your candidate' })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${alert({
        type: 'info',
        title: 'What this means',
        message: 'This is a significant milestone \u2014 a formal job offer means the company wants to hire your candidate. If they accept, a placement record will be created and your fee will be calculated.',
    })}

${infoCard({
        title: 'Offer Details',
        items: offerItems,
    })}

${paragraph(`<strong>What happens next:</strong><br/>\u2022 Connect with <strong>${data.candidateName}</strong> to discuss the offer details<br/>\u2022 Help negotiate terms if needed \u2014 salary, benefits, start date<br/>\u2022 Facilitate a smooth acceptance process<br/>\u2022 When the candidate is hired, a placement record and fee are created automatically`)}

${button({
        href: data.applicationUrl,
        text: 'View Application \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('When the candidate accepts and is marked as hired, your placement fee will be calculated based on the agreed salary.')}

${paragraph(`<em style="color: #71717a; font-size: 13px;">This is an automated notification from Splits Network based on an application stage change.</em>`)}
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
    salary?: number;
    placementFee?: number;
    feePercentage?: number;
    guaranteeDays?: number;
    guaranteeExpiresAt?: string;
    startDate?: string;
}

export function recruiterCandidateHiredEmail(data: RecruiterCandidateHiredData): string {
    const placementItems: Array<{ label: string; value: string | number; highlight?: boolean }> = [
        { label: 'Candidate', value: data.candidateName },
        { label: 'Position', value: data.jobTitle },
        { label: 'Company', value: data.companyName },
        { label: 'Salary', value: formatSalary(data.salary) },
        { label: 'Placement Fee', value: formatFee(data.placementFee), highlight: true },
    ];

    if (data.feePercentage) {
        placementItems.push({ label: 'Fee Rate', value: `${data.feePercentage}%` });
    }

    if (data.startDate) {
        placementItems.push({ label: 'Start Date', value: data.startDate });
    }

    if (data.guaranteeDays) {
        placementItems.push({ label: 'Guarantee Period', value: `${data.guaranteeDays} days` });
    }

    if (data.guaranteeExpiresAt) {
        placementItems.push({ label: 'Guarantee Expires', value: data.guaranteeExpiresAt });
    }

    placementItems.push({ label: 'Status', value: 'Hired', highlight: true });

    const guaranteeSection = data.guaranteeDays
        ? `\n${alert({
            type: 'info',
            title: 'Important: Guarantee Period',
            message: `During the ${data.guaranteeDays}-day guarantee period, if the candidate leaves or is terminated, the placement fee may be adjusted. The guarantee period runs from ${data.startDate || 'the start date'} to ${data.guaranteeExpiresAt || 'the expiry date'}. Stay in regular contact with your candidate during this time.`,
        })}`
        : '';

    const content = `
${heading({ level: 1, text: 'Placement confirmed \u2014 you earned a fee' })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${alert({
        type: 'success',
        title: 'Congratulations!',
        message: `Your candidate <strong>${data.candidateName}</strong> has been hired for the <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>! A placement record has been created and your fee has been calculated.`,
    })}

${infoCard({
        title: 'Placement Details',
        items: placementItems,
    })}

${paragraph(`<strong>What happens next:</strong><br/>\u2022 A placement record has been automatically created in your dashboard<br/>\u2022 Your fee will be processed per the agreed billing terms<br/>\u2022 Stay in touch with <strong>${data.candidateName}</strong> during their onboarding and guarantee period<br/>\u2022 This placement will be reflected in your reputation score`)}
${guaranteeSection}

${button({
        href: data.applicationUrl,
        text: 'View Placement Record \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('Great work! Successful placements build your reputation and unlock more opportunities on the platform.')}

${paragraph(`<em style="color: #71717a; font-size: 13px;">This is an automated notification from Splits Network based on an application stage change.</em>`)}
    `.trim();

    return baseEmailTemplate({
        preheader: `Placement confirmed: ${data.candidateName} hired as ${data.jobTitle} at ${data.companyName}`,
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
${heading({ level: 1, text: 'Application not moving forward' })}

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
${heading({ level: 1, text: 'Application expiring soon' })}

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

// ============================================================================
// Offer Accepted by Candidate — Recruiter
// ============================================================================

export interface RecruiterOfferAcceptedData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
}

export function recruiterOfferAcceptedEmail(data: RecruiterOfferAcceptedData): string {
    const content = `
${heading({ level: 1, text: 'Offer accepted!' })}

${paragraph(`Hi <strong>${data.recruiterName}</strong>,`)}

${alert({
        type: 'success',
        title: 'Candidate Accepted the Offer',
        message: `<strong>${data.candidateName}</strong> has accepted the offer for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong>.`,
    })}

${infoCard({
        title: 'Acceptance Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Status', value: 'Offer Accepted', highlight: true },
        ],
    })}

${paragraph(
        'The next step is for the company to confirm the hire and finalize placement details.'
    )}

${button({
        href: data.applicationUrl,
        text: 'View Application \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph('Coordinate with the company to complete the hiring process and set up the placement.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.candidateName} accepted the offer for ${data.jobTitle}`,
        content,
        source: 'portal',
    });
}
