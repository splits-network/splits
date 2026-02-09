/**
 * Application Email Templates
 * Professional branded templates for application-related notifications
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, infoCard, alert, divider } from '../components';

export interface ApplicationCreatedData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
    recruiterName?: string;
    source?: EmailSource;
}

export function applicationCreatedEmail(data: ApplicationCreatedData): string {
    const content = `
${heading({ level: 1, text: 'New Candidate Application' })}

${paragraph(`Your candidate <strong>${data.candidateName}</strong> has submitted an application for review.`)}

${infoCard({
        title: 'Application Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            ...(data.recruiterName ? [{ label: 'Submitted by', value: data.recruiterName }] : []),
        ],
    })}

${paragraph(
        'Please review the application, add any additional context, and submit it to the company when ready.'
    )}

${button({
        href: data.applicationUrl,
        text: 'Review Application →',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        'Need help? Visit our <a href="https://splits.network/public/help" style="color: #233876; text-decoration: underline;">Help Center</a> or reply to this email.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `New application from ${data.candidateName} for ${data.jobTitle}`,
        source: data.source || 'portal',
        content,
    });
}

export interface ApplicationStageChangedData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    oldStage: string;
    newStage: string;
    applicationUrl: string;
    source?: EmailSource;
}

export function applicationStageChangedEmail(data: ApplicationStageChangedData): string {
    const content = `
${heading({ level: 1, text: 'Application Status Update' })}

${paragraph(
        `The application for <strong>${data.candidateName}</strong> has moved to a new stage in the hiring process.`
    )}

${infoCard({
        title: 'Status Change',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Previous Stage', value: data.oldStage },
            { label: 'New Stage', value: data.newStage, highlight: true },
        ],
    })}

${paragraph('Continue tracking the application progress and prepare for the next steps.')}

${button({
        href: data.applicationUrl,
        text: 'View Application →',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        'Get real-time updates in your <a href="https://splits.network/portal/dashboard" style="color: #233876; text-decoration: underline;">dashboard</a>.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.candidateName} moved to ${data.newStage} for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}

export interface ApplicationAcceptedData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
    source?: EmailSource;
}

export function applicationAcceptedEmail(data: ApplicationAcceptedData): string {
    const content = `
${heading({ level: 1, text: 'Application Accepted!' })}

${alert({
        type: 'success',
        title: 'Great News!',
        message: `The company has accepted your candidate ${data.candidateName} for the ${data.jobTitle} position.`,
    })}

${infoCard({
        title: 'Accepted Application',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
        ],
    })}

${paragraph(
        'The candidate has moved forward in the hiring process. Continue to monitor progress and coordinate next steps with the company.'
    )}

${button({
        href: data.applicationUrl,
        text: 'View Application Details →',
        variant: 'primary',
    })}

${divider()}

${paragraph('<strong>What happens next?</strong>')}

${paragraph(
        'The company will continue their interview process. Stay engaged and be prepared to support your candidate through the hiring journey. When an offer is extended and accepted, a placement will be automatically created.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.candidateName}'s application was accepted by ${data.companyName}`,
        content,
        source: data.source || 'portal',
    });
}

export interface ApplicationRejectedData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    reason?: string;
    applicationUrl: string;
    source?: EmailSource;
}

export function applicationRejectedEmail(data: ApplicationRejectedData): string {
    const content = `
${heading({ level: 1, text: 'Application Update' })}

${alert({
        type: 'warning',
        message: `The application for ${data.candidateName} was not moved forward by ${data.companyName}.`,
    })}

${infoCard({
        title: 'Application Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            ...(data.reason ? [{ label: 'Reason', value: data.reason }] : []),
        ],
    })}

${paragraph('While this opportunity didn\'t work out, there are many more roles available on the platform.')}

${button({
        href: 'https://splits.network/portal/roles',
        text: 'Browse Open Roles →',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        '<strong>Keep Moving Forward:</strong> Every "no" brings you closer to a "yes". Continue submitting quality candidates to build your placement success rate.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `Update on ${data.candidateName}'s application`,
        content,
        source: data.source || 'portal',
    });
}

export interface ApplicationWithdrawnData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    reason?: string;
    withdrawnBy: string;
    applicationUrl: string;
    source?: EmailSource;
}

export function applicationWithdrawnEmail(data: ApplicationWithdrawnData): string {
    const content = `
${heading({ level: 1, text: 'Application Withdrawn' })}

${alert({
        type: 'info',
        message: `The application for ${data.candidateName} has been withdrawn from ${data.companyName}.`,
    })}

${infoCard({
        title: 'Withdrawal Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Withdrawn by', value: data.withdrawnBy },
            ...(data.reason ? [{ label: 'Reason', value: data.reason }] : []),
        ],
    })}

${paragraph(
        'This application has been removed from consideration. The candidate can no longer be considered for this position through this submission.'
    )}

${button({
        href: data.applicationUrl,
        text: 'View Application Record →',
        variant: 'secondary',
    })}

${divider()}

${paragraph(
        'Looking for other opportunities? Browse available roles in your <a href="https://splits.network/portal/roles" style="color: #233876; text-decoration: underline;">dashboard</a>.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `Application withdrawn: ${data.candidateName} for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}

export interface CandidateApplicationSubmittedData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    hasRecruiter: boolean;
    nextSteps: string;
    applicationUrl: string;
    source?: EmailSource;
}

export function candidateApplicationSubmittedEmail(data: CandidateApplicationSubmittedData): string {
    const content = `
${heading({ level: 1, text: 'Application Received' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${paragraph(
        `Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been successfully received.`
    )}

${alert({
        type: 'success',
        title: 'Next Steps',
        message: data.nextSteps,
    })}

${data.hasRecruiter
            ? paragraph(
                'Your recruiter will review your application and make any final enhancements before submitting it to the company.'
            )
            : ''
        }

${paragraph('You can track your application status anytime in your portal.')}

${button({
            href: data.applicationUrl,
            text: 'Track Application Status →',
            variant: 'primary',
        })}

${divider()}

${paragraph('<strong>Good luck!</strong> We\'re here to support you throughout the hiring process.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Application received: ${data.jobTitle} at ${data.companyName}`,
        content,
        source: data.source || 'candidate',
    });
}

export interface CompanyApplicationReceivedData {
    candidateName: string;
    jobTitle: string;
    applicationUrl: string;
    hasRecruiter: boolean;
    recruiterName?: string;
    source?: EmailSource;
}

export function companyApplicationReceivedEmail(data: CompanyApplicationReceivedData): string {
    const content = `
${heading({ level: 1, text: 'New Candidate Application' })}

${paragraph(`A new candidate has applied for <strong>${data.jobTitle}</strong>.`)}

${infoCard({
        title: 'Application Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            ...(data.hasRecruiter && data.recruiterName
                ? [{ label: 'Recruiter', value: data.recruiterName }]
                : []),
        ],
    })}

${data.hasRecruiter && data.recruiterName
            ? alert({
                type: 'info',
                message: `This candidate is represented by recruiter <strong>${data.recruiterName}</strong>.`,
            })
            : alert({
                type: 'info',
                message: 'This is a direct candidate application.',
            })
        }

${paragraph('Review the candidate\'s profile and determine if they\'re a good fit for your role.')}

${button({
            href: data.applicationUrl,
            text: 'Review Application →',
            variant: 'primary',
        })}

${divider()}

${paragraph(
            'Manage all your applications in your <a href="https://splits.network/portal/applications" style="color: #233876; text-decoration: underline;">company portal</a>.'
        )}
    `.trim();

    return baseEmailTemplate({
        preheader: `New application: ${data.candidateName} for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}

export interface PreScreenRequestedData {
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    companyName: string;
    requestedBy: string;
    message?: string;
    portalUrl: string;
    source?: EmailSource;
}

export function preScreenRequestedEmail(data: PreScreenRequestedData): string {
    const content = `
${heading({ level: 1, text: 'Pre-Screen Request' })}

${paragraph(
        `<strong>${data.requestedBy}</strong> from <strong>${data.companyName}</strong> has requested your help reviewing a candidate application.`
    )}

${infoCard({
        title: 'Candidate Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Email', value: data.candidateEmail },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
        ],
    })}

${data.message
            ? alert({
                type: 'info',
                title: `Message from ${data.requestedBy}`,
                message: data.message,
            })
            : ''
        }

${paragraph('<strong>What\'s Expected?</strong>')}

${paragraph(
            `1. Review the candidate's profile and documents<br>
2. Add your professional insights and recommendations<br>
3. Submit the pre-screened application back to the company`
        )}

${button({
            href: data.portalUrl,
            text: 'Start Review →',
            variant: 'primary',
        })}

${divider()}

${paragraph(
            '<em>This direct application came from a candidate who applied without a recruiter. The company values your expertise in evaluating this candidate.</em>'
        )}
    `.trim();

    return baseEmailTemplate({
        preheader: `Pre-screen request: ${data.candidateName} for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}

export interface PreScreenRequestConfirmationData {
    candidateName: string;
    jobTitle: string;
    autoAssign: boolean;
    portalUrl: string;
    source?: EmailSource;
}

export function preScreenRequestConfirmationEmail(data: PreScreenRequestConfirmationData): string {
    const content = `
${heading({ level: 1, text: 'Pre-Screen Request Submitted' })}

${alert({
        type: 'success',
        message: 'Your request for candidate pre-screening has been submitted successfully.',
    })}

${infoCard({
        title: 'Request Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            {
                label: 'Assignment',
                value: data.autoAssign
                    ? 'Auto-assign (system will select a recruiter)'
                    : 'Manually assigned',
            },
        ],
    })}

${data.autoAssign
            ? alert({
                type: 'info',
                title: 'Auto-Assignment',
                message:
                    'Our system will automatically assign an available recruiter to review this candidate. You\'ll be notified once they submit their review.',
            })
            : alert({
                type: 'info',
                title: 'Manual Assignment',
                message:
                    'The selected recruiter has been notified and will review this candidate. You\'ll receive their insights once the review is complete.',
            })
        }

${paragraph('<strong>What Happens Next?</strong>')}

${paragraph(
            `1. Recruiter reviews the candidate's profile<br>
2. Recruiter adds professional insights and recommendations<br>
3. You receive the pre-screened application for final review`
        )}

${button({
            href: data.portalUrl,
            text: 'Track Application Status →',
            variant: 'primary',
        })}

${divider()}

${paragraph('Typical review timelines: <strong>2-3 business days</strong>')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Pre-screen request confirmed: ${data.candidateName}`,
        content,
        source: data.source || 'portal',
    });
}

export interface ApplicationSubmittedToCompanyData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    submittedBy: string;
    applicationUrl: string;
    source?: EmailSource;
}

export function applicationSubmittedToCompanyEmail(data: ApplicationSubmittedToCompanyData): string {
    const content = `
${heading({ level: 1, text: 'Application Submitted to Company' })}

${paragraph(
        `The application for <strong>${data.candidateName}</strong> has been submitted to <strong>${data.companyName}</strong> for review.`
    )}

${infoCard({
        title: 'Submission Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Submitted by', value: data.submittedBy },
        ],
    })}

${alert({
        type: 'info',
        title: 'What\'s Next?',
        message:
            'The company will review the application and provide feedback. You\'ll be notified of any status changes.',
    })}

${button({
        href: data.applicationUrl,
        text: 'Track Application Status →',
        variant: 'primary',
    })}

${divider()}

${paragraph('Typical review timelines: <strong>3-7 business days</strong>')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Application submitted: ${data.candidateName} for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}

export interface AIReviewCompletedCandidateData {
    candidateName: string;
    jobTitle: string;
    fitScore: number;
    recommendation: string;
    strengths: string[];
    concerns: string[];
    applicationUrl: string;
    source?: EmailSource;
}

export function aiReviewCompletedCandidateEmail(data: AIReviewCompletedCandidateData): string {
    const recommendationLabels: Record<string, string> = {
        strong_fit: 'Strong Fit',
        good_fit: 'Good Fit',
        possible_fit: 'Possible Fit',
        weak_fit: 'Needs Development',
    };

    const recommendationLabel = recommendationLabels[data.recommendation] || data.recommendation.replace('_', ' ').toUpperCase();

    const isGoodMatch = data.recommendation === 'strong_fit' || data.recommendation === 'good_fit';
    const alertType = isGoodMatch ? 'success' : 'info';

    const content = `
${heading({ level: 1, text: 'Your Application Has Been Reviewed' })}

${paragraph(
        `Hi <strong>${data.candidateName}</strong>, good news! Your application for <strong>${data.jobTitle}</strong> has been reviewed by our AI system.`
    )}

${infoCard({
        title: 'AI Review Results',
        items: [
            { label: 'Position', value: data.jobTitle },
            { label: 'Match Score', value: `${data.fitScore}/100`, highlight: true },
            { label: 'Assessment', value: recommendationLabel, highlight: true },
        ],
    })}

${data.strengths.length > 0 ? `
${heading({ level: 3, text: 'Your Strengths' })}
<ul style="margin: 8px 0 20px; padding-left: 24px; color: #374151; line-height: 1.6;">
${data.strengths.map(s => `  <li style="margin-bottom: 6px;">${s}</li>`).join('\n')}
</ul>
` : ''}

${data.concerns.length > 0 ? `
${heading({ level: 3, text: 'Areas to Address' })}
<ul style="margin: 8px 0 20px; padding-left: 24px; color: #374151; line-height: 1.6;">
${data.concerns.map(c => `  <li style="margin-bottom: 6px;">${c}</li>`).join('\n')}
</ul>
` : ''}

${alert({
        type: alertType,
        title: 'Next Steps',
        message: isGoodMatch
            ? 'Your application shows strong potential! A recruiter will be in touch soon to discuss the next steps in the process.'
            : 'We\'ll keep you updated on your application status. Continue building your skills in the areas identified above.',
    })}

${button({
        href: data.applicationUrl,
        text: 'View Full Analysis →',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        'Questions about your review? Visit our <a href="https://splits.network/public/help" style="color: #233876; text-decoration: underline;">Help Center</a> to learn more about our AI review process.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `AI review complete: ${data.fitScore}/100 match for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}

export interface AIReviewCompletedRecruiterData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    fitScore: number;
    recommendation: string;
    overallSummary: string;
    strengths: string[];
    concerns: string[];
    matchedSkills: string[];
    missingSkills: string[];
    applicationUrl: string;
    source?: EmailSource;
}

export function aiReviewCompletedRecruiterEmail(data: AIReviewCompletedRecruiterData): string {
    const recommendationLabels: Record<string, string> = {
        strong_fit: 'Strong Fit',
        good_fit: 'Good Fit',
        possible_fit: 'Possible Fit',
        weak_fit: 'Weak Fit',
    };

    const recommendationLabel = recommendationLabels[data.recommendation] || data.recommendation.replace('_', ' ').toUpperCase();

    const isStrongCandidate = data.recommendation === 'strong_fit' || data.recommendation === 'good_fit';
    const alertType = isStrongCandidate ? 'success' : 'info';

    const content = `
${heading({ level: 1, text: 'AI Review Complete' })}

${paragraph(
        `Hi <strong>${data.recruiterName}</strong>, the AI review for <strong>${data.candidateName}</strong>'s application to <strong>${data.jobTitle}</strong> is now complete.`
    )}

${infoCard({
        title: 'Review Summary',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Match Score', value: `${data.fitScore}/100`, highlight: true },
            { label: 'Recommendation', value: recommendationLabel, highlight: true },
        ],
    })}

${heading({ level: 3, text: 'AI Assessment' })}
${paragraph(data.overallSummary)}

${data.matchedSkills.length > 0 ? `
${heading({ level: 3, text: 'Matched Skills' })}
<ul style="margin: 8px 0 20px; padding-left: 24px; color: #374151; line-height: 1.6;">
${data.matchedSkills.map(s => `  <li style="margin-bottom: 6px;"><strong>${s}</strong></li>`).join('\n')}
</ul>
` : ''}

${data.strengths.length > 0 ? `
${heading({ level: 3, text: 'Key Strengths' })}
<ul style="margin: 8px 0 20px; padding-left: 24px; color: #374151; line-height: 1.6;">
${data.strengths.map(s => `  <li style="margin-bottom: 6px;">${s}</li>`).join('\n')}
</ul>
` : ''}

${data.missingSkills.length > 0 ? `
${heading({ level: 3, text: 'Missing Skills' })}
<ul style="margin: 8px 0 20px; padding-left: 24px; color: #6b7280; line-height: 1.6;">
${data.missingSkills.map(s => `  <li style="margin-bottom: 6px;">${s}</li>`).join('\n')}
</ul>
` : ''}

${data.concerns.length > 0 ? `
${heading({ level: 3, text: 'Concerns' })}
<ul style="margin: 8px 0 20px; padding-left: 24px; color: #6b7280; line-height: 1.6;">
${data.concerns.map(c => `  <li style="margin-bottom: 6px;">${c}</li>`).join('\n')}
</ul>
` : ''}

${alert({
        type: alertType,
        title: 'Recommended Action',
        message: isStrongCandidate
            ? 'This candidate shows strong potential for the role. Consider scheduling a phone screen to discuss their qualifications further.'
            : 'Review the detailed analysis carefully to determine if this candidate is worth pursuing. Consider their growth potential and transferable skills.',
    })}

${button({
        href: data.applicationUrl,
        text: 'View Full AI Analysis →',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        'Need help interpreting the AI review? Check out our <a href="https://splits.network/public/help/ai-reviews" style="color: #233876; text-decoration: underline;">AI Review Guide</a>.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `AI review: ${data.candidateName} - ${data.fitScore}/100 match for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}

// ============================================================================
// Phase 4: Recruiter Proposal Templates
// ============================================================================

export interface RecruiterProposedData {
    candidateName: string;
    recruiterName: string;
    jobTitle: string;
    companyName: string;
    pitch?: string;
    proposalUrl: string;
    source?: EmailSource;
}

export function recruiterProposedEmail(data: RecruiterProposedData): string {
    const content = `
${heading({ level: 1, text: `${data.recruiterName} Has Proposed a Job for You!` })}

${alert({
        type: 'info',
        title: 'New Job Opportunity',
        message: `A recruiter thinks you'd be a great fit for the ${data.jobTitle} position at ${data.companyName}.`,
    })}

${data.pitch ? `
${heading({ level: 3, text: 'Personal Message from the Recruiter' })}
${paragraph(data.pitch)}

${divider()}
` : ''}

${infoCard({
        title: 'Position Details',
        items: [
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Proposed by', value: data.recruiterName },
        ],
    })}

${paragraph(
        'Review the full job details and decide if you\'d like to proceed with your application.'
    )}

${button({
        href: data.proposalUrl,
        text: 'Review Proposal →',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        '<strong>Next Steps:</strong> If you\'re interested, accept the proposal and complete your application. If not, you can decline with a brief reason.'
    )}

${paragraph(
        'Questions? Reply to this email or visit our <a href="https://splits.network/public/help" style="color: #233876; text-decoration: underline;">Help Center</a>.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.recruiterName} has proposed the ${data.jobTitle} position at ${data.companyName} for you`,
        content,
        source: data.source || 'candidate',
    });
}

export interface ApplicationProposalAcceptedData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
    source?: EmailSource;
}

export function proposalAcceptedByApplicationEmail(data: ApplicationProposalAcceptedData): string {
    const content = `
${heading({ level: 1, text: 'Your Job Proposal Was Accepted!' })}

${alert({
        type: 'success',
        title: 'Great News!',
        message: `${data.candidateName} has accepted your job proposal and is working on their application.`,
    })}

${infoCard({
        title: 'Application Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
        ],
    })}

${paragraph(
        'The candidate is now completing their application. You\'ll be notified when it\'s ready for your review.'
    )}

${button({
        href: data.applicationUrl,
        text: 'View Application Status →',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        '<strong>Next Steps:</strong> Wait for the candidate to submit their application, then review and provide feedback.'
    )}

${paragraph(
        'Track all your proposals in your <a href="https://splits.network/portal/dashboard" style="color: #233876; text-decoration: underline;">dashboard</a>.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.candidateName} accepted your proposal for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}

export interface ApplicationProposalDeclinedData {
    recruiterName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    reason?: string;
    candidateProfileUrl: string;
    source?: EmailSource;
}

// ============================================================================
// Application Notes Templates
// ============================================================================

export interface ApplicationNoteCreatedData {
    recipientName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    notePreview: string;
    addedByName: string;
    addedByRole: string;
    applicationUrl: string;
    source?: EmailSource;
}

export function applicationNoteCreatedEmail(data: ApplicationNoteCreatedData): string {
    const content = `
${heading({ level: 1, text: 'New Note on Application' })}

${paragraph(`Hi <strong>${data.recipientName}</strong>,`)}

${paragraph(
    `<strong>${data.addedByName}</strong> (${data.addedByRole}) added a note to the application for <strong>${data.candidateName}</strong>.`
)}

${infoCard({
    title: 'Application Details',
    items: [
        { label: 'Candidate', value: data.candidateName },
        { label: 'Position', value: data.jobTitle },
        { label: 'Company', value: data.companyName },
    ],
})}

${heading({ level: 3, text: 'Note Preview' })}
${paragraph(`<em>"${data.notePreview}"</em>`)}

${button({
    href: data.applicationUrl,
    text: 'View Full Note →',
    variant: 'primary',
})}

${divider()}

${paragraph(
    'You can reply to this note directly in the application portal.'
)}
    `.trim();

    return baseEmailTemplate({
        preheader: `New note from ${data.addedByName} on ${data.candidateName}'s application`,
        content,
        source: data.source || 'portal',
    });
}

export function proposalDeclinedByApplicationEmail(data: ApplicationProposalDeclinedData): string {
    const content = `
${heading({ level: 1, text: 'Proposal Update' })}

${alert({
        type: 'warning',
        title: 'Proposal Declined',
        message: `${data.candidateName} has declined your proposal for the ${data.jobTitle} position.`,
    })}

${data.reason ? `
${heading({ level: 3, text: 'Candidate\'s Reason' })}
${paragraph(data.reason)}

${divider()}
` : ''}

${infoCard({
        title: 'Proposal Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
        ],
    })}

${paragraph(
        'Don\'t worry! You can continue exploring other opportunities with this candidate or find other great matches.'
    )}

${button({
        href: data.candidateProfileUrl,
        text: 'View Candidate Profile →',
        variant: 'secondary',
    })}

${divider()}

${paragraph(
        '<strong>Next Steps:</strong> Consider proposing other positions that might be a better fit, or continue your search for the perfect candidate.'
    )}

${paragraph(
        'Need tips on crafting better proposals? Visit our <a href="https://splits.network/public/help/proposals" style="color: #233876; text-decoration: underline;">Proposal Guide</a>.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.candidateName} declined your proposal for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}
