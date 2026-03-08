/**
 * Interview Reminder Email Templates
 *
 * Escalating reminder emails sent at 24h, 1h, and 10min before interviews.
 * 10-minute reminder has a prominent full-width "Join Now" CTA.
 * Supports all meeting platforms (Splits Video, Google Meet, Microsoft Teams, Zoom, etc.)
 */

import { baseEmailTemplate, EmailSource } from '../base';
import { heading, paragraph, button, infoCard, alert } from '../components';

export type ReminderType = '24h' | '1h' | '10min';

export interface InterviewReminderEmailParams {
    recipientName: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    scheduledAt: Date;
    duration: number;
    meetingPlatform: string;
    joinLink?: string;
    applicationUrl?: string;
    prepPageUrl?: string;
    reminderType: ReminderType;
    isCandidate: boolean;
}

function formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    });
}

function formatPlatformName(platform: string): string {
    const names: Record<string, string> = {
        splits_video: 'Splits Video',
        google_meet: 'Google Meet',
        microsoft_teams: 'Microsoft Teams',
        zoom: 'Zoom',
    };
    return names[platform] || platform;
}

function getSubject(reminderType: ReminderType, jobTitle: string): string {
    switch (reminderType) {
        case '24h':
            return `Reminder: Interview tomorrow \u2014 ${jobTitle}`;
        case '1h':
            return `Interview in 1 hour \u2014 ${jobTitle}`;
        case '10min':
            return `Interview starting soon \u2014 ${jobTitle}`;
    }
}

function getPreheader(reminderType: ReminderType, jobTitle: string, companyName: string): string {
    switch (reminderType) {
        case '24h':
            return `Your interview for ${jobTitle} at ${companyName} is tomorrow.`;
        case '1h':
            return `Your interview for ${jobTitle} starts in 1 hour.`;
        case '10min':
            return `Your interview for ${jobTitle} is about to start. Join now.`;
    }
}

function getHeadingText(reminderType: ReminderType): string {
    switch (reminderType) {
        case '24h':
            return 'Interview Tomorrow';
        case '1h':
            return 'Interview in 1 Hour';
        case '10min':
            return 'Interview Starting Now';
    }
}

function getOpeningText(params: InterviewReminderEmailParams): string {
    const { recipientName, reminderType, jobTitle, companyName, isCandidate } = params;

    switch (reminderType) {
        case '24h':
            if (isCandidate) {
                return `Hi ${recipientName}, this is a reminder that your interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> is scheduled for tomorrow.`;
            }
            return `Hi ${recipientName}, this is a reminder that you have an interview scheduled for tomorrow for the <strong>${jobTitle}</strong> position.`;
        case '1h':
            if (isCandidate) {
                return `Hi ${recipientName}, your interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> starts in about 1 hour.`;
            }
            return `Hi ${recipientName}, your interview for <strong>${jobTitle}</strong> with a candidate starts in about 1 hour.`;
        case '10min':
            if (isCandidate) {
                return `Hi ${recipientName}, your interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> is about to begin.`;
            }
            return `Hi ${recipientName}, your interview for the <strong>${jobTitle}</strong> position is about to begin.`;
    }
}

function buildJoinButton(joinLink: string, reminderType: ReminderType): string {
    if (reminderType === '10min') {
        // Full-width, prominent CTA for 10-minute reminder
        return `
<table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; margin: 28px 0;">
  <tr>
    <td align="center" style="background-color: #233876; padding: 0;">
      <a href="${joinLink}" style="display: block; width: 100%; padding: 20px 32px; font-size: 18px; font-weight: 800; line-height: 1; color: #ffffff; text-decoration: none; text-align: center; letter-spacing: 0.02em;">
        Join Now &rarr;
      </a>
    </td>
  </tr>
</table>
        `.trim();
    }

    return button({
        href: joinLink,
        text: 'Join Interview \u2192',
        variant: 'primary',
    });
}

export function interviewReminderEmail(params: InterviewReminderEmailParams): {
    subject: string;
    html: string;
} {
    const {
        candidateName,
        jobTitle,
        companyName,
        scheduledAt,
        duration,
        meetingPlatform,
        joinLink,
        applicationUrl,
        prepPageUrl,
        reminderType,
        isCandidate,
    } = params;

    const subject = getSubject(reminderType, jobTitle);
    const source: EmailSource = isCandidate ? 'candidate' : 'portal';

    const infoItems: Array<{ label: string; value: string; highlight?: boolean }> = [
        { label: 'Position', value: jobTitle, highlight: true },
        { label: 'Company', value: companyName },
        { label: 'Date & Time', value: formatDateTime(scheduledAt) },
        { label: 'Duration', value: `${duration} minutes` },
        { label: 'Platform', value: formatPlatformName(meetingPlatform) },
    ];

    if (!isCandidate) {
        infoItems.splice(1, 0, { label: 'Candidate', value: candidateName });
    }

    // Build urgency alert for 10-minute reminder
    const urgencyAlert = reminderType === '10min'
        ? alert({
            type: 'warning',
            title: 'Starting Now',
            message: 'Your interview is about to begin. Please join the call immediately.',
        })
        : '';

    // Build join section
    const joinSection = joinLink ? buildJoinButton(joinLink, reminderType) : '';

    // Build candidate-specific prep section
    const prepSection = isCandidate && prepPageUrl && reminderType === '24h'
        ? `${paragraph('Take a few minutes to review your preparation page before the interview.')}${button({ href: prepPageUrl, text: 'Review Preparation Page \u2192', variant: 'secondary' })}`
        : '';

    // Build interviewer-specific application link
    const applicationSection = !isCandidate && applicationUrl && reminderType !== '10min'
        ? `${paragraph('Review the candidate\'s application before the interview.')}${button({ href: applicationUrl, text: 'View Application \u2192', variant: 'secondary' })}`
        : '';

    const content = `
${heading({ level: 1, text: getHeadingText(reminderType) })}

${urgencyAlert}

${paragraph(getOpeningText(params))}

${infoCard({
        title: 'Interview Details',
        items: infoItems,
    })}

${joinSection}

${prepSection}

${applicationSection}

${reminderType === '24h' ? paragraph('Make sure to test your audio and video before the interview. We recommend joining a few minutes early.') : ''}
    `.trim();

    const html = baseEmailTemplate({
        preheader: getPreheader(reminderType, jobTitle, companyName),
        source,
        content,
    });

    return { subject, html };
}
