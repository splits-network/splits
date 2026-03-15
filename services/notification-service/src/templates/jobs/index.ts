/**
 * Job Lifecycle Email Templates
 * Templates for job creation, status changes, and expiration notifications.
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, alert, infoCard, divider } from '../components';

// ─── Job Created Confirmation ────────────────────────────────────────────────

export interface JobCreatedConfirmationData {
    jobTitle: string;
    companyName: string;
    jobUrl: string;
    source?: EmailSource;
}

export function jobCreatedConfirmationEmail(data: JobCreatedConfirmationData): string {
    const content = `
${heading({ level: 1, text: 'Your job posting is live' })}

${paragraph(`<strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been posted. Recruiters in your network can now submit candidates.`)}

${infoCard({
        title: 'Job Details',
        items: [
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Status', value: 'Active', highlight: true },
        ],
    })}

${button({
        href: data.jobUrl,
        text: 'View Job Posting →',
        variant: 'primary',
    })}

${divider()}

${paragraph('You can manage your job posting, review applications, and update details from your dashboard at any time.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `${data.jobTitle} at ${data.companyName} is now live and accepting candidates.`,
        source: data.source || 'portal',
    });
}

// ─── Job Status Changed ──────────────────────────────────────────────────────

export interface JobStatusChangedData {
    jobTitle: string;
    companyName: string;
    previousStatus: string;
    newStatus: string;
    jobUrl: string;
    recipientName: string;
    source?: EmailSource;
}

export function jobStatusChangedEmail(data: JobStatusChangedData): string {
    const isPaused = data.newStatus === 'paused';
    const alertType = isPaused ? 'warning' : 'info';
    const impactMessage = isPaused
        ? 'This job is no longer accepting new applications. Existing applications will continue to be processed.'
        : 'This job has been closed. Existing applications will be processed to completion, but no new submissions will be accepted.';

    const content = `
${heading({ level: 1, text: 'Job status updated' })}

${paragraph(`<strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been changed from <strong>${data.previousStatus}</strong> to <strong>${data.newStatus}</strong>.`)}

${alert({
        type: alertType,
        title: `Job ${data.newStatus}`,
        message: impactMessage,
    })}

${button({
        href: data.jobUrl,
        text: 'View Job Details →',
        variant: 'primary',
    })}

${divider()}

${paragraph('If this change was unexpected, contact the job owner or visit the job details page for more information.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `${data.jobTitle} at ${data.companyName} has been ${data.newStatus}.`,
        source: data.source || 'portal',
    });
}

// ─── First Job Posted (Milestone) ───────────────────────────────────────────

export interface FirstJobPostedData {
    jobTitle: string;
    companyName: string;
    jobUrl: string;
    source?: EmailSource;
}

export function firstJobPostedEmail(data: FirstJobPostedData): string {
    const content = `
${heading({ level: 1, text: 'Your first job is live!' })}

${alert({
        type: 'success',
        title: 'Milestone achieved',
        message: `Congratulations! ${data.companyName} just posted its first job on Splits Network.`,
    })}

${infoCard({
        title: 'Your First Posting',
        items: [
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Status', value: 'Active and accepting candidates', highlight: true },
        ],
    })}

${paragraph('<strong>What happens next?</strong>')}

${paragraph('Recruiters in your network can now discover this job and submit qualified candidates. Here are a few tips to get quality submissions faster:')}

${paragraph('1. <strong>Complete the job description</strong> — detailed requirements help recruiters match the right candidates.')}
${paragraph('2. <strong>Invite preferred recruiters</strong> — connect with recruiters who specialize in your industry.')}
${paragraph('3. <strong>Review applications promptly</strong> — fast responses attract better candidates.')}

${button({
        href: data.jobUrl,
        text: 'View Your Job Listing →',
        variant: 'primary',
    })}

${divider()}

${paragraph('Welcome to the Splits Network recruiting marketplace. We\'re excited to help you find great talent.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `Your first job is live! ${data.jobTitle} at ${data.companyName} is now accepting candidates.`,
        source: data.source || 'portal',
    });
}

// ─── Job Fields Updated ─────────────────────────────────────────────────────

export interface JobFieldsUpdatedData {
    jobTitle: string;
    companyName: string;
    updatedFields: string[];
    jobUrl: string;
    source?: EmailSource;
}

export function jobFieldsUpdatedEmail(data: JobFieldsUpdatedData): string {
    const fieldLabels: Record<string, string> = {
        title: 'Title', location: 'Location', salary_min: 'Minimum salary',
        salary_max: 'Maximum salary', fee_percentage: 'Fee percentage', status: 'Status',
    };
    const labels = data.updatedFields.map(f => fieldLabels[f] || f).join(', ');

    const content = `
${heading({ level: 1, text: 'Job posting updated' })}

${paragraph(`<strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been updated.`)}

${alert({
        type: 'info',
        title: 'Fields changed',
        message: labels,
    })}

${button({
        href: data.jobUrl,
        text: 'View Job Details →',
        variant: 'primary',
    })}

${divider()}

${paragraph('Visit the job details page to review the latest changes.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `${data.jobTitle} at ${data.companyName} has been updated.`,
        source: data.source || 'portal',
    });
}

// ─── Job Deleted ────────────────────────────────────────────────────────────

export interface JobDeletedData {
    jobTitle: string;
    companyName: string;
    source?: EmailSource;
}

export function jobDeletedEmail(data: JobDeletedData): string {
    const content = `
${heading({ level: 1, text: 'Job posting removed' })}

${paragraph(`<strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been deleted.`)}

${alert({
        type: 'error',
        title: 'Job removed',
        message: 'This job posting has been removed and is no longer accepting applications. Any active applications will be handled separately.',
    })}

${divider()}

${paragraph('If this was unexpected, please contact the job owner for more information.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `${data.jobTitle} at ${data.companyName} has been removed.`,
        source: data.source || 'portal',
    });
}

// ─── Job Recommendation ──────────────────────────────────────────────────────

export interface JobRecommendationData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    message?: string;
    jobUrl: string;
    source?: EmailSource;
}

export function jobRecommendationEmail(data: JobRecommendationData): string {
    const messageBlock = data.message
        ? alert({ type: 'info', title: 'Message from the hiring team', message: data.message })
        : '';

    const content = [
        heading({ level: 1, text: 'A job was recommended for you' }),
        paragraph(`Hi <strong>${data.candidateName}</strong>,`),
        paragraph(`The team at <strong>${data.companyName}</strong> thinks you'd be a great fit for <strong>${data.jobTitle}</strong>.`),
        messageBlock,
        infoCard({
            title: 'Recommended Position',
            items: [
                { label: 'Position', value: data.jobTitle },
                { label: 'Company', value: data.companyName },
            ],
        }),
        button({ href: data.jobUrl, text: 'View Job Details', variant: 'primary' }),
        divider(),
        paragraph('This recommendation was sent because a member of the hiring team thought your profile was a strong match. You can view, apply, or dismiss it from your dashboard.'),
    ].filter(Boolean).join('\n\n');

    return baseEmailTemplate({
        content,
        preheader: `${data.companyName} recommended you for ${data.jobTitle}.`,
        source: data.source || 'candidate',
    });
}

// ─── Job Expired ─────────────────────────────────────────────────────────────

export interface JobExpiredData {
    jobTitle: string;
    companyName: string;
    jobUrl: string;
    source?: EmailSource;
}

export function jobExpiredEmail(data: JobExpiredData): string {
    const content = `
${heading({ level: 1, text: 'Job posting expired' })}

${paragraph(`<strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has expired and is no longer accepting applications.`)}

${alert({
        type: 'warning',
        title: 'Posting expired',
        message: 'This job has reached its expiration date. You can repost the job to continue accepting candidates, or archive it if the position has been filled.',
    })}

${paragraph('<strong>Your options:</strong>')}
${paragraph('Repost the job to make it active again and continue receiving candidate submissions, or archive the listing to remove it from your active jobs.')}

${button({
        href: data.jobUrl,
        text: 'Repost or Archive →',
        variant: 'primary',
    })}

${divider()}

${paragraph('Expired jobs can be reposted at any time from your job management dashboard.')}
    `.trim();

    return baseEmailTemplate({
        content,
        preheader: `${data.jobTitle} at ${data.companyName} has expired — repost or archive it.`,
        source: data.source || 'portal',
    });
}
