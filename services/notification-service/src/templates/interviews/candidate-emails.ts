/**
 * Candidate Email Templates — Interview Lifecycle
 * Professional branded templates for candidate-facing interview notifications.
 * Includes prep info, join links, and reschedule options.
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, infoCard, alert, divider } from '../components';

// ============================================================================
// Interview Scheduled — Candidate
// ============================================================================

export interface CandidateInterviewScheduledData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    dateTime: string;
    interviewerName?: string;
    meetingPlatform: string;
    joinUrl?: string;
    prepUrl?: string;
    rescheduleUrl?: string;
    source?: EmailSource;
}

export function candidateInterviewScheduledEmail(data: CandidateInterviewScheduledData): string {
    const content = `
${heading({ level: 1, text: 'Your interview is confirmed' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${paragraph(
        `Your interview for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been scheduled.`
    )}

${infoCard({
        title: 'Interview Details',
        items: [
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Date & Time', value: data.dateTime, highlight: true },
            ...(data.interviewerName ? [{ label: 'Interviewer', value: data.interviewerName }] : []),
            { label: 'Platform', value: data.meetingPlatform },
        ],
    })}

${data.joinUrl
        ? button({
            href: data.joinUrl,
            text: 'Join Interview →',
            variant: 'primary',
        })
        : ''
    }

${data.prepUrl
        ? `
${divider()}

${paragraph('<strong>Prepare for your interview:</strong>')}
${paragraph(
            `Review the job details and prepare your responses. <a href="${data.prepUrl}" style="color: #233876; text-decoration: underline;">Open preparation page</a>.`
        )}
`
        : ''
    }

${divider()}

${data.rescheduleUrl
        ? paragraph(
            `Need to reschedule? <a href="${data.rescheduleUrl}" style="color: #233876; text-decoration: underline;">Request a new time</a>.`
        )
        : paragraph('If you need to reschedule, please contact your recruiter as soon as possible.')
    }
    `.trim();

    return baseEmailTemplate({
        preheader: `Interview confirmed: ${data.jobTitle} at ${data.companyName} on ${data.dateTime}`,
        content,
        source: data.source || 'candidate',
    });
}

// ============================================================================
// Interview Cancelled — Candidate
// ============================================================================

export interface CandidateInterviewCancelledData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    originalDateTime: string;
    reason?: string;
    source?: EmailSource;
}

export function candidateInterviewCancelledEmail(data: CandidateInterviewCancelledData): string {
    const content = `
${heading({ level: 1, text: 'Interview cancelled' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${alert({
        type: 'warning',
        title: 'Interview Cancelled',
        message: `Your interview for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been cancelled.`,
    })}

${infoCard({
        title: 'Cancelled Interview',
        items: [
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Original Date & Time', value: data.originalDateTime },
            ...(data.reason ? [{ label: 'Reason', value: data.reason }] : []),
        ],
    })}

${paragraph('If you have any questions, please reach out to your recruiter.')}

${divider()}

${paragraph('You will be notified if a new interview is scheduled.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Interview cancelled: ${data.jobTitle} at ${data.companyName}`,
        content,
        source: data.source || 'candidate',
    });
}

// ============================================================================
// Interview Rescheduled — Candidate
// ============================================================================

export interface CandidateInterviewRescheduledData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    oldDateTime: string;
    newDateTime: string;
    meetingPlatform: string;
    joinUrl?: string;
    prepUrl?: string;
    source?: EmailSource;
}

export function candidateInterviewRescheduledEmail(data: CandidateInterviewRescheduledData): string {
    const content = `
${heading({ level: 1, text: 'Interview rescheduled' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${paragraph(
        `Your interview for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been rescheduled.`
    )}

${infoCard({
        title: 'Updated Schedule',
        items: [
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Previous Time', value: `<s>${data.oldDateTime}</s>` },
            { label: 'New Time', value: data.newDateTime, highlight: true },
            { label: 'Platform', value: data.meetingPlatform },
        ],
    })}

${data.joinUrl
        ? button({
            href: data.joinUrl,
            text: 'Join Interview →',
            variant: 'primary',
        })
        : ''
    }

${data.prepUrl
        ? `
${divider()}

${paragraph(
            `Continue preparing for your interview. <a href="${data.prepUrl}" style="color: #233876; text-decoration: underline;">Open preparation page</a>.`
        )}
`
        : ''
    }
    `.trim();

    return baseEmailTemplate({
        preheader: `Interview rescheduled: ${data.jobTitle} at ${data.companyName} — new time ${data.newDateTime}`,
        content,
        source: data.source || 'candidate',
    });
}

// ============================================================================
// Reschedule Accepted — Candidate
// ============================================================================

export interface CandidateRescheduleAcceptedData {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    confirmedDateTime: string;
    meetingPlatform: string;
    joinUrl?: string;
    prepUrl?: string;
    source?: EmailSource;
}

export function candidateRescheduleAcceptedEmail(data: CandidateRescheduleAcceptedData): string {
    const content = `
${heading({ level: 1, text: 'Reschedule confirmed' })}

${paragraph(`Hi <strong>${data.candidateName}</strong>,`)}

${alert({
        type: 'success',
        title: 'Reschedule Confirmed',
        message: `Your reschedule request for the <strong>${data.jobTitle}</strong> interview at <strong>${data.companyName}</strong> has been confirmed.`,
    })}

${infoCard({
        title: 'Confirmed Interview',
        items: [
            { label: 'Position', value: data.jobTitle },
            { label: 'Company', value: data.companyName },
            { label: 'Date & Time', value: data.confirmedDateTime, highlight: true },
            { label: 'Platform', value: data.meetingPlatform },
        ],
    })}

${data.joinUrl
        ? button({
            href: data.joinUrl,
            text: 'Join Interview →',
            variant: 'primary',
        })
        : ''
    }

${data.prepUrl
        ? `
${divider()}

${paragraph(
            `Prepare for your interview. <a href="${data.prepUrl}" style="color: #233876; text-decoration: underline;">Open preparation page</a>.`
        )}
`
        : ''
    }
    `.trim();

    return baseEmailTemplate({
        preheader: `Reschedule confirmed: ${data.jobTitle} at ${data.companyName} on ${data.confirmedDateTime}`,
        content,
        source: data.source || 'candidate',
    });
}
