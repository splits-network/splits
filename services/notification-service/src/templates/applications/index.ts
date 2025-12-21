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
${heading({ level: 1, text: 'New Candidate Application', icon: '📝' })}

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
    'Need help? Visit our <a href="https://splits.network/help" style="color: #233876; text-decoration: underline;">Help Center</a> or reply to this email.'
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
${heading({ level: 1, text: 'Application Status Update', icon: '🔄' })}

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
    'Get real-time updates in your <a href="https://splits.network/dashboard" style="color: #233876; text-decoration: underline;">dashboard</a>.'
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
${heading({ level: 1, text: 'Application Accepted! 🎉', icon: '✅' })}

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
${heading({ level: 1, text: 'Application Update', icon: '📋' })}

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
    href: 'https://splits.network/roles',
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
${heading({ level: 1, text: 'Application Submitted to Company', icon: '✉️' })}

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
