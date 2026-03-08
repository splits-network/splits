/**
 * Interviewer Email Templates — Interview Lifecycle
 * Professional branded templates for interviewer-facing notifications.
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, infoCard, alert, divider } from '../components';

// ============================================================================
// Interview Scheduled — Interviewer
// ============================================================================

export interface InterviewerScheduledData {
    candidateName: string;
    jobTitle: string;
    dateTime: string;
    meetingPlatform: string;
    applicationUrl: string;
    resumeUrl?: string;
    source?: EmailSource;
}

export function interviewScheduledEmail(data: InterviewerScheduledData): string {
    const content = `
${heading({ level: 1, text: 'Interview scheduled' })}

${paragraph(
        `An interview has been scheduled with <strong>${data.candidateName}</strong> for the <strong>${data.jobTitle}</strong> position.`
    )}

${infoCard({
        title: 'Interview Details',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Date & Time', value: data.dateTime, highlight: true },
            { label: 'Platform', value: data.meetingPlatform },
        ],
    })}

${data.resumeUrl
        ? paragraph(
            `<a href="${data.resumeUrl}" style="color: #233876; text-decoration: underline;">View candidate resume</a>`
        )
        : ''
    }

${button({
        href: data.applicationUrl,
        text: 'View Application →',
        variant: 'primary',
    })}

${divider()}

${paragraph(
        'Review the candidate\'s application and prepare your questions before the interview.'
    )}
    `.trim();

    return baseEmailTemplate({
        preheader: `Interview scheduled: ${data.candidateName} for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}

// ============================================================================
// Interview Cancelled — Interviewer
// ============================================================================

export interface InterviewerCancelledData {
    candidateName: string;
    jobTitle: string;
    originalDateTime: string;
    reason?: string;
    applicationUrl: string;
    source?: EmailSource;
}

export function interviewCancelledEmail(data: InterviewerCancelledData): string {
    const content = `
${heading({ level: 1, text: 'Interview cancelled' })}

${alert({
        type: 'warning',
        title: 'Interview Cancelled',
        message: `The interview with <strong>${data.candidateName}</strong> for <strong>${data.jobTitle}</strong> has been cancelled.`,
    })}

${infoCard({
        title: 'Cancelled Interview',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Original Date & Time', value: data.originalDateTime },
            ...(data.reason ? [{ label: 'Reason', value: data.reason }] : []),
        ],
    })}

${paragraph('No further action is required. The interview time has been freed on your calendar.')}

${button({
        href: data.applicationUrl,
        text: 'View Application →',
        variant: 'secondary',
    })}
    `.trim();

    return baseEmailTemplate({
        preheader: `Interview cancelled: ${data.candidateName} for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}

// ============================================================================
// Interview Rescheduled — Interviewer
// ============================================================================

export interface InterviewerRescheduledData {
    candidateName: string;
    jobTitle: string;
    oldDateTime: string;
    newDateTime: string;
    reason?: string;
    meetingPlatform: string;
    joinUrl?: string;
    applicationUrl: string;
    source?: EmailSource;
}

export function interviewRescheduledEmail(data: InterviewerRescheduledData): string {
    const content = `
${heading({ level: 1, text: 'Interview rescheduled' })}

${paragraph(
        `The interview with <strong>${data.candidateName}</strong> for <strong>${data.jobTitle}</strong> has been rescheduled.`
    )}

${infoCard({
        title: 'Updated Schedule',
        items: [
            { label: 'Candidate', value: data.candidateName },
            { label: 'Position', value: data.jobTitle },
            { label: 'Previous Time', value: `<s>${data.oldDateTime}</s>` },
            { label: 'New Time', value: data.newDateTime, highlight: true },
            { label: 'Platform', value: data.meetingPlatform },
            ...(data.reason ? [{ label: 'Reason', value: data.reason }] : []),
        ],
    })}

${button({
        href: data.applicationUrl,
        text: 'View Application →',
        variant: 'primary',
    })}

${divider()}

${paragraph('Your calendar has been updated with the new time.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `Interview rescheduled: ${data.candidateName} — new time ${data.newDateTime}`,
        content,
        source: data.source || 'portal',
    });
}

// ============================================================================
// Reschedule Requested — Interviewer
// ============================================================================

export interface RescheduleRequestedData {
    candidateName: string;
    jobTitle: string;
    proposedTimes: string[];
    notes?: string;
    reviewUrl: string;
    source?: EmailSource;
}

export function rescheduleRequestedEmail(data: RescheduleRequestedData): string {
    const proposedList = data.proposedTimes
        .map(t => `<li style="margin-bottom: 6px;">${t}</li>`)
        .join('\n');

    const content = `
${heading({ level: 1, text: 'Reschedule requested' })}

${alert({
        type: 'info',
        title: 'Reschedule Request',
        message: `<strong>${data.candidateName}</strong> has requested to reschedule their interview for <strong>${data.jobTitle}</strong>.`,
    })}

${data.proposedTimes.length > 0 ? `
${heading({ level: 3, text: 'Proposed Times' })}
<ul style="margin: 8px 0 20px; padding-left: 24px; color: #18181b; line-height: 1.6;">
${proposedList}
</ul>
` : ''}

${data.notes
        ? `${heading({ level: 3, text: 'Candidate Notes' })}
${paragraph(`<em>"${data.notes}"</em>`)}`
        : ''
    }

${button({
        href: data.reviewUrl,
        text: 'Review Request →',
        variant: 'primary',
    })}

${divider()}

${paragraph('Please respond promptly so the candidate can plan accordingly.')}
    `.trim();

    return baseEmailTemplate({
        preheader: `${data.candidateName} requested to reschedule interview for ${data.jobTitle}`,
        content,
        source: data.source || 'portal',
    });
}
