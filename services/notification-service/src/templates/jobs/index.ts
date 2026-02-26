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
