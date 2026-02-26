/**
 * Monthly Hiring Report Email Template
 * Sent to company admins on the 1st of each month with hiring pipeline metrics
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, infoCard, divider } from '../components';

export interface MonthlyReportData {
    companyName: string;
    monthName: string;
    year: number;
    totalApplications: number;
    applicationsReviewing: number;
    applicationsInterviewing: number;
    applicationsHired: number;
    applicationsRejected: number;
    activeJobs: number;
    placementsCompleted: number;
    dashboardUrl: string;
    source?: EmailSource;
}

export function monthlyHiringReportEmail(data: MonthlyReportData): string {
    const content = `
${heading({ level: 1, text: `${data.monthName} ${data.year} hiring report` })}

${paragraph(
        `Here's your monthly hiring pipeline summary for <strong>${data.companyName}</strong>.`
    )}

${infoCard({
        title: 'Pipeline Overview',
        items: [
            { label: 'Total Applications', value: data.totalApplications.toString() },
            { label: 'In Review', value: data.applicationsReviewing.toString() },
            { label: 'Interviewing', value: data.applicationsInterviewing.toString() },
            { label: 'Hired', value: data.applicationsHired.toString(), highlight: true },
            { label: 'Rejected', value: data.applicationsRejected.toString() },
        ],
    })}

${infoCard({
        title: 'Placement & Job Activity',
        items: [
            { label: 'Active Jobs', value: data.activeJobs.toString() },
            { label: 'Placements Completed', value: data.placementsCompleted.toString(), highlight: true },
        ],
    })}

${paragraph(
        'Review your full pipeline and adjust your hiring strategy based on this month\'s metrics.'
    )}

${button({
        href: data.dashboardUrl,
        text: 'View Full Report →',
        variant: 'primary',
    })}

${divider()}

${paragraph('You receive this report on the 1st of each month. To adjust your email preferences, visit your notification settings.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.monthName} report: ${data.totalApplications} applications, ${data.placementsCompleted} placements`,
        content,
        source: data.source || 'portal',
    });
}
