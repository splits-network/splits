/**
 * Candidate-Specific Email Templates
 * Professional branded templates for candidate-facing notifications
 */

import { baseEmailTemplate, defaultTheme } from '../base';
import { heading, paragraph, button, infoCard, alert } from '../components';

// When candidate submits application with recruiter
export interface CandidateApplicationWithRecruiterData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    recruiterName: string;
    applicationUrl: string;
}

export function candidateApplicationWithRecruiterEmail(data: CandidateApplicationWithRecruiterData): string {
    const content = `
${heading({ level: 1, text: 'Application Submitted for Review' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${paragraph(`Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been received and sent to your recruiter for review.`)}

${infoCard({
        title: 'What happens next?',
        items: [
            { label: 'Recruiter Review', value: `${data.recruiterName} will review and enhance your application` },
            { label: 'Company Submission', value: 'Your recruiter will submit the polished application to the company' },
            { label: 'Timeline', value: 'Expect updates within 2-3 business days' },
        ],
        theme: defaultTheme,
    })}

${alert({
        type: 'info',
        title: 'Your recruiter is working for you',
        message: `${data.recruiterName} will add professional insights and ensure your application stands out.`,
    })}

${button({
        href: data.applicationUrl,
        text: 'Track Application Status →',
        variant: 'primary',
        theme: defaultTheme,
    })}

${paragraph('Questions? Reply to this email and we\'ll connect you with your recruiter.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Your application is being reviewed by ${data.recruiterName}`,
        content,
        source: 'candidate',
        theme: defaultTheme,
    });
}

// When candidate submits directly to company
export interface CandidateDirectApplicationData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
}

export function candidateDirectApplicationEmail(data: CandidateDirectApplicationData): string {
    const content = `
${heading({ level: 1, text: 'Application Submitted Successfully' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${paragraph(`Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been submitted directly to the hiring team.`)}

${alert({
        type: 'success',
        title: 'Application received',
        message: 'The company has received your application and will review it within 5-7 business days.',
    })}

${infoCard({
        title: 'Next steps',
        items: [
            { label: 'Company Review', value: 'The hiring team will review your qualifications' },
            { label: 'Initial Screening', value: 'If interested, they\'ll contact you for a phone screen' },
            { label: 'Timeline', value: 'Expect to hear back within 1 week' },
        ],
        theme: defaultTheme,
    })}

${button({
        href: data.applicationUrl,
        text: 'View Application →',
        variant: 'primary',
        theme: defaultTheme,
    })}

${paragraph('We\'ll notify you of any status updates. Good luck!')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Application submitted to ${data.companyName}`,
        content,
        source: 'candidate',
        theme: defaultTheme,
    });
}

// When candidate moves to interview stage
export interface CandidateInterviewInviteData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
    hasRecruiter: boolean;
    recruiterName?: string;
}

export function candidateInterviewInviteEmail(data: CandidateInterviewInviteData): string {
    const content = `
${heading({ level: 1, text: 'Interview Request!' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${alert({
        type: 'success',
        title: 'Great news!',
        message: `${data.companyName} would like to interview you for the ${data.jobTitle} position.`,
    })}

${paragraph('The company was impressed with your application and wants to learn more about you.')}

${data.hasRecruiter && data.recruiterName ? `
${infoCard({
        title: 'Next steps with your recruiter',
        items: [
            { label: 'Recruiter Prep', value: `${data.recruiterName} will help you prepare for the interview` },
            { label: 'Scheduling', value: 'The company will reach out to schedule directly' },
            { label: 'Support', value: 'Your recruiter will provide interview tips and guidance' },
        ],
        theme: defaultTheme,
    })}
` : `
${infoCard({
        title: 'Next steps',
        items: [
            { label: 'Scheduling', value: 'The company will contact you directly to schedule' },
            { label: 'Preparation', value: 'Research the company and prepare your questions' },
            { label: 'Timeline', value: 'Interviews typically happen within 1-2 weeks' },
        ],
        theme: defaultTheme,
    })}
`}

${button({
        href: data.applicationUrl,
        text: 'View Application Details →',
        variant: 'primary',
        theme: defaultTheme,
    })}

${paragraph('Congratulations on this exciting opportunity!')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Interview request from ${data.companyName} for ${data.jobTitle}`,
        content,
        source: 'candidate',
        theme: defaultTheme,
    });
}

// When candidate receives offer
export interface CandidateOfferReceivedData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    applicationUrl: string;
    hasRecruiter: boolean;
    recruiterName?: string;
}

export function candidateOfferReceivedEmail(data: CandidateOfferReceivedData): string {
    const content = `
${heading({ level: 1, text: '🎉 Job Offer Received!' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${alert({
        type: 'success',
        title: 'Congratulations!',
        message: `${data.companyName} has extended an offer for the ${data.jobTitle} position!`,
    })}

${paragraph('After careful consideration, the company has decided you\'re the perfect fit for their team.')}

${data.hasRecruiter && data.recruiterName ? `
${infoCard({
        title: 'Next steps with your recruiter',
        items: [
            { label: 'Offer Review', value: `${data.recruiterName} will help you review the offer details` },
            { label: 'Negotiation Support', value: 'Your recruiter can assist with any negotiations' },
            { label: 'Decision Timeline', value: 'Take time to consider - your recruiter will guide you' },
        ],
        theme: defaultTheme,
    })}
` : `
${infoCard({
        title: 'Next steps',
        items: [
            { label: 'Review Carefully', value: 'Take time to review all offer details' },
            { label: 'Ask Questions', value: 'Clarify anything you\'re unsure about' },
            { label: 'Decision Timeline', value: 'Most offers require a response within 3-5 days' },
        ],
        theme: defaultTheme,
    })}
`}

${button({
        href: data.applicationUrl,
        text: 'View Offer Details →',
        variant: 'primary',
        theme: defaultTheme,
    })}

${paragraph('This is a significant milestone - congratulations on your success!')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Job offer from ${data.companyName}! 🎉`,
        content,
        source: 'candidate',
        theme: defaultTheme,
    });
}

// When candidate is hired
export interface CandidateHiredData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    startDate?: string;
    hasRecruiter: boolean;
    recruiterName?: string;
}

export function candidateHiredEmail(data: CandidateHiredData): string {
    const content = `
${heading({ level: 1, text: '🎉 Welcome to Your New Role!' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${alert({
        type: 'success',
        title: 'Congratulations!',
        message: `You've officially been hired as ${data.jobTitle} at ${data.companyName}!`,
    })}

${paragraph('Your journey with Applicant Network has led to this amazing opportunity. We\'re thrilled to have been part of your success story.')}

${data.startDate ? `
${infoCard({
        title: 'Your new role details',
        items: [
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Start Date', value: data.startDate },
        ],
        theme: defaultTheme,
    })}
` : ''}

${data.hasRecruiter && data.recruiterName ? `
${paragraph(`Special thanks to your recruiter <strong>${data.recruiterName}</strong> for their support throughout this process.`)}
` : ''}

${paragraph('As you begin this new chapter:')}
${paragraph('• Stay connected with the Applicant Network community<br>• Share your experience to help other candidates<br>• Remember us for future career moves')}

${paragraph('We wish you tremendous success in your new role!')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Congratulations on your new role at ${data.companyName}!`,
        content,
        source: 'candidate',
        theme: defaultTheme,
    });
}

// When candidate application is rejected  
export interface CandidateApplicationRejectedData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    hasRecruiter: boolean;
    recruiterName?: string;
    reason?: string;
}

export function candidateApplicationRejectedEmail(data: CandidateApplicationRejectedData): string {
    const content = `
${heading({ level: 1, text: 'Application Update' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${paragraph(`We wanted to update you on your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong>.`)}

${alert({
        type: 'info',
        title: 'Not selected for this role',
        message: 'While this particular opportunity didn\'t work out, this is a normal part of the job search process.',
    })}

${data.reason ? paragraph(`<strong>Feedback:</strong> ${data.reason}`) : ''}

${data.hasRecruiter && data.recruiterName ? `
${paragraph(`Your recruiter <strong>${data.recruiterName}</strong> is already working to identify other opportunities that may be a great fit for your skills and experience.`)}

${infoCard({
        title: 'Next steps with your recruiter',
        items: [
            { label: 'New Opportunities', value: `${data.recruiterName} will continue searching for relevant roles` },
            { label: 'Profile Enhancement', value: 'Your recruiter may suggest profile improvements' },
            { label: 'Market Insights', value: 'Get feedback on current market conditions' },
        ],
        theme: defaultTheme,
    })}
` : `
${infoCard({
        title: 'Keep moving forward',
        items: [
            { label: 'Stay Active', value: 'Continue applying to relevant positions' },
            { label: 'Skills Development', value: 'Consider strengthening key skills' },
            { label: 'Network', value: 'Connect with industry professionals' },
        ],
        theme: defaultTheme,
    })}
`}

${paragraph('Remember, finding the right role is often about timing and fit. Stay positive and keep pursuing opportunities that align with your goals.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Update on your application to ${data.companyName}`,
        content,
        source: 'candidate',
        theme: defaultTheme,
    });
}

// When recruiter proposes a job to candidate
export interface RecruiterJobProposalData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    recruiterName: string;
    jobDescription: string;
    proposalUrl: string;
}

export function recruiterJobProposalEmail(data: RecruiterJobProposalData): string {
    const content = `
${heading({ level: 1, text: 'New Job Opportunity!' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${paragraph(`Your recruiter <strong>${data.recruiterName}</strong> has identified an exciting opportunity that matches your profile and career goals.`)}

${alert({
        type: 'info',
        title: 'Opportunity Match',
        message: `${data.recruiterName} believes this ${data.jobTitle} role at ${data.companyName} would be a great fit for you.`,
    })}

${infoCard({
        title: 'Role Details',
        items: [
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Recruiter', value: data.recruiterName },
        ],
        theme: defaultTheme,
    })}

${paragraph('<strong>About this role:</strong>')}
${paragraph(data.jobDescription)}

${button({
        href: data.proposalUrl,
        text: 'Review Job Details & Respond →',
        variant: 'primary',
        theme: defaultTheme,
    })}

${paragraph('Take your time to review the details. If you\'re interested, your recruiter will guide you through the application process.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.recruiterName} has a ${data.jobTitle} opportunity for you`,
        content,
        source: 'candidate',
        theme: defaultTheme,
    });
}

// When application is sent for AI review
export interface CandidateAIReviewData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    hasRecruiter: boolean;
    applicationUrl: string;
}

export function candidateAIReviewEmail(data: CandidateAIReviewData): string {
    const nextSteps = data.hasRecruiter
        ? 'Once our AI review is complete, your recruiter will review and submit it to the company.'
        : 'Once our AI review is complete, your application will be submitted directly to the company.';

    const content = `
${heading({ level: 1, text: 'Application Under AI Review' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${paragraph(`Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> is now being analyzed by our AI system to ensure it's optimized for success.`)}

${alert({
        type: 'info',
        title: 'AI Analysis in Progress',
        message: 'Our AI is reviewing your skills match, experience alignment, and application completeness.',
    })}

${infoCard({
        title: 'What our AI analyzes',
        items: [
            { label: 'Skills Match', value: 'How well your skills align with job requirements' },
            { label: 'Experience Fit', value: 'Relevance of your background to the role' },
            { label: 'Application Quality', value: 'Completeness and presentation optimization' },
            { label: 'Success Probability', value: 'Likelihood of interview invitation' },
        ],
        theme: defaultTheme,
    })}

${paragraph(`<strong>What happens next:</strong> ${nextSteps}`)}

${button({
        href: data.applicationUrl,
        text: 'Track AI Review Status →',
        variant: 'primary',
        theme: defaultTheme,
    })}

${paragraph('Our AI review typically completes within 15-30 minutes. You\'ll receive another update once the analysis is finished.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Your ${data.jobTitle} application is being AI-analyzed for optimal results`,
        content,
        source: 'candidate',
        theme: defaultTheme,
    });
}

// When recruiter submits application to company after review
export interface CandidateApplicationSubmittedByRecruiterData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    recruiterName: string;
    applicationUrl: string;
}

export function candidateApplicationSubmittedByRecruiterEmail(data: CandidateApplicationSubmittedByRecruiterData): string {
    const content = `
${heading({ level: 1, text: 'Application Submitted to Company!' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${paragraph(`Great news! <strong>${data.recruiterName}</strong> has reviewed and submitted your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong>.`)}

${alert({
        type: 'success',
        title: 'Application Enhanced & Submitted',
        message: `Your recruiter has optimized your application and submitted it directly to ${data.companyName}.`,
    })}

${infoCard({
        title: 'What your recruiter did',
        items: [
            { label: 'Application Review', value: 'Enhanced presentation and highlighted key strengths' },
            { label: 'Company Submission', value: 'Submitted directly to hiring team with professional insights' },
            { label: 'Follow-up', value: 'Will track responses and keep you updated on progress' },
        ],
        theme: defaultTheme,
    })}

${paragraph('Your application is now in the hands of the hiring team. Your recruiter will monitor the process and update you on any developments.')}

${button({
        href: data.applicationUrl,
        text: 'Track Application Status →',
        variant: 'primary',
        theme: defaultTheme,
    })}

${paragraph(`Have questions about your application? Your recruiter <strong>${data.recruiterName}</strong> is here to help. Just reply to this email.`)}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.recruiterName} submitted your ${data.jobTitle} application to ${data.companyName}`,
        content,
        source: 'candidate',
        theme: defaultTheme,
    });
}