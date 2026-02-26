/**
 * Company Admin Email Templates — Application Expiration
 * Professional branded templates for company-facing expiration notifications
 */

import { baseEmailTemplate } from '../base';
import { heading, paragraph, button, infoCard, alert, divider } from '../components';

// ============================================================================
// Application Expired — Company Admin
// ============================================================================

export interface CompanyApplicationExpiredData {
    jobTitle: string;
    candidateName: string;
    expiredFromStage: string;
    daysWaited: number;
    applicationUrl: string;
}

const stageLabels: Record<string, string> = {
    submitted: 'Submission',
    company_review: 'Company Review',
    company_feedback: 'Company Feedback',
};

export function companyApplicationExpiredEmail(data: CompanyApplicationExpiredData): string {
    const stageLabel = stageLabels[data.expiredFromStage] || data.expiredFromStage;

    const content = `
${heading({ level: 1, text: 'Application lost to inaction' })}

${alert({
        type: 'error',
        title: 'Application Lost',
        message: `An application for <strong>${data.jobTitle}</strong> expired because it wasn't reviewed within ${data.daysWaited} days.`,
    })}

${infoCard({
        title: 'Expired Application Details',
        items: [
            { label: 'Job Title', value: data.jobTitle },
            { label: 'Candidate', value: data.candidateName },
            { label: 'Stage When Expired', value: stageLabel },
            { label: 'Days Waited', value: String(data.daysWaited) },
        ],
    })}

${paragraph(
        'Timely reviews help attract the best candidates and build your company\'s reputation with recruiters on the platform.'
    )}

${button({
        href: data.applicationUrl,
        text: 'Review Open Applications \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        'Responding promptly to applications improves your company\'s reputation score and recruiter engagement.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `Application for ${data.jobTitle} expired after ${data.daysWaited} days`,
        content,
        source: 'portal',
    });
}

// ============================================================================
// Expiration Warning — Company Admin
// ============================================================================

export interface CompanyExpirationWarningData {
    companyName: string;
    daysRemaining: number;
    applications: Array<{ jobTitle: string; candidateName: string }>;
    dashboardUrl: string;
}

export function companyExpirationWarningEmail(data: CompanyExpirationWarningData): string {
    const appCount = data.applications.length;
    const appLabel = appCount === 1 ? '1 application' : `${appCount} applications`;
    const jobList = data.applications
        .map(a => `<strong>${a.jobTitle}</strong> (${a.candidateName})`)
        .join('<br>');

    const content = `
${heading({ level: 1, text: 'Applications expiring soon' })}

${alert({
        type: 'warning',
        title: 'Action Required',
        message: `${appLabel} for your open positions will expire within ${data.daysRemaining} day${data.daysRemaining === 1 ? '' : 's'} if not reviewed.`,
    })}

${paragraph('<strong>Affected Applications:</strong>')}
${paragraph(jobList)}

${paragraph(
        'Review these applications now to avoid losing qualified candidates.'
    )}

${button({
        href: data.dashboardUrl,
        text: 'Review Applications Now \u2192',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        'Timely reviews help attract the best candidates and maintain your company\'s reputation on the platform.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `${appLabel} expiring in ${data.daysRemaining} days`,
        content,
        source: 'portal',
    });
}
