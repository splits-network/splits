#!/usr/bin/env node
/**
 * Interview Reminder Job
 *
 * Sends escalating reminders (24h, 1h, 10min) to all interview participants
 * via email and in-app notifications. Uses notification_log for deduplication.
 *
 * Runs every 5 minutes via cron schedule in index.ts.
 *
 * Reminder windows (centered on target time, 10-minute detection window):
 *   24h:  23h55m to 24h5m before interview
 *   1h:   55min to 65min before interview
 *   10min: 5min to 15min before interview
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { interviewReminderEmail, ReminderType } from '../templates/interviews';

const FROM_EMAIL = process.env.FROM_EMAIL || 'Splits Network <notifications@splits.network>';

interface ReminderWindow {
    type: ReminderType;
    minMinutes: number;
    maxMinutes: number;
    priority: 'normal' | 'high' | 'urgent';
}

const REMINDER_WINDOWS: ReminderWindow[] = [
    { type: '24h', minMinutes: 23 * 60 + 55, maxMinutes: 24 * 60 + 5, priority: 'normal' },
    { type: '1h', minMinutes: 55, maxMinutes: 65, priority: 'high' },
    { type: '10min', minMinutes: 5, maxMinutes: 15, priority: 'urgent' },
];

interface InterviewRow {
    id: string;
    application_id: string;
    scheduled_at: string;
    scheduled_duration_minutes: number;
    meeting_platform: string;
    meeting_link: string | null;
    room_name: string | null;
    title: string | null;
}

interface UserInfo {
    id: string;
    email: string;
    name: string | null;
}

interface ParticipantRow {
    id: string;
    user_id: string;
    role: 'interviewer' | 'candidate' | 'observer';
    users: UserInfo | UserInfo[];
}

function getCountdownText(minutesUntil: number, reminderType: ReminderType): string {
    if (reminderType === '10min') {
        return 'Interview starting now';
    }
    if (reminderType === '1h') {
        return `Interview in ${minutesUntil} minutes`;
    }
    const hours = Math.round(minutesUntil / 60);
    return `Interview in ${hours} hour${hours !== 1 ? 's' : ''}`;
}

export async function sendInterviewReminders(
    supabaseClient: SupabaseClient,
    resendClient: Resend,
    logger: Logger,
    portalUrl: string,
    candidateWebsiteUrl: string,
): Promise<{ sent: number; skipped: number; failed: number }> {
    const now = new Date();
    const maxLookahead = new Date(now.getTime() + (24 * 60 + 5) * 60 * 1000);

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    // Query all scheduled interviews within the next 24h + 5min
    const { data: interviews, error: interviewsError } = await supabaseClient
        .from('interviews')
        .select('id, application_id, scheduled_at, scheduled_duration_minutes, meeting_platform, meeting_link, room_name, title')
        .eq('status', 'scheduled')
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', maxLookahead.toISOString());

    if (interviewsError) {
        logger.error({ error: interviewsError.message }, 'Failed to query interviews for reminders');
        throw interviewsError;
    }

    if (!interviews?.length) {
        logger.debug({}, 'No upcoming interviews found for reminders');
        return { sent, skipped, failed };
    }

    logger.info({ count: interviews.length }, 'Found upcoming interviews to check for reminders');

    for (const interview of interviews as InterviewRow[]) {
        const scheduledAt = new Date(interview.scheduled_at);
        const minutesUntil = (scheduledAt.getTime() - now.getTime()) / (60 * 1000);

        // Determine which reminder windows this interview falls into
        const matchingWindows = REMINDER_WINDOWS.filter(
            (w) => minutesUntil >= w.minMinutes && minutesUntil <= w.maxMinutes
        );

        if (matchingWindows.length === 0) {
            continue;
        }

        for (const window of matchingWindows) {
            try {
                await processReminderForInterview(
                    supabaseClient,
                    resendClient,
                    logger,
                    portalUrl,
                    candidateWebsiteUrl,
                    interview,
                    window,
                    minutesUntil,
                );
                sent++;
            } catch (error) {
                failed++;
                logger.error(
                    { interviewId: interview.id, reminderType: window.type, error: error instanceof Error ? error.message : String(error) },
                    'Failed to process interview reminder'
                );
            }
        }
    }

    logger.info({ sent, skipped, failed }, 'Interview reminders job complete');
    return { sent, skipped, failed };
}

async function processReminderForInterview(
    supabaseClient: SupabaseClient,
    resendClient: Resend,
    logger: Logger,
    portalUrl: string,
    candidateWebsiteUrl: string,
    interview: InterviewRow,
    window: ReminderWindow,
    minutesUntil: number,
): Promise<void> {
    const eventType = `interview.reminder.${window.type}`;

    // Deduplication: check if this reminder was already sent
    const { count: existingCount } = await supabaseClient
        .from('notification_log')
        .select('id', { count: 'exact', head: true })
        .eq('event_type', eventType)
        .eq('payload->>interview_id', interview.id);

    if ((existingCount ?? 0) > 0) {
        logger.debug({ interviewId: interview.id, reminderType: window.type }, 'Reminder already sent, skipping');
        return;
    }

    // Fetch participants with user details
    const { data: participants, error: participantsError } = await supabaseClient
        .from('interview_participants')
        .select('id, user_id, role, users(id, email, name)')
        .eq('interview_id', interview.id);

    if (participantsError) {
        throw new Error(`Failed to fetch participants: ${participantsError.message}`);
    }

    if (!participants?.length) {
        logger.warn({ interviewId: interview.id }, 'No participants found for interview');
        return;
    }

    // Fetch application -> job -> company context
    const { data: application, error: appError } = await supabaseClient
        .from('applications')
        .select('id, jobs(id, title, companies(id, name))')
        .eq('id', interview.application_id)
        .single();

    if (appError) {
        throw new Error(`Failed to fetch application context: ${appError.message}`);
    }

    const job = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs;
    const company = job?.companies
        ? (Array.isArray(job.companies) ? job.companies[0] : job.companies)
        : null;

    const jobTitle = interview.title || job?.title || 'Interview';
    const companyName = company?.name || 'Company';

    // Build join link
    const joinLink = interview.meeting_link
        || (interview.room_name ? `${portalUrl}/portal/interviews/${interview.id}` : undefined);

    // Find candidate name from participants
    const candidateParticipant = (participants as ParticipantRow[]).find((p) => p.role === 'candidate');
    const candidateUser = candidateParticipant?.users;
    const candidateName = (Array.isArray(candidateUser) ? candidateUser[0]?.name : candidateUser?.name) || 'Candidate';

    for (const participant of participants as ParticipantRow[]) {
        const user = Array.isArray(participant.users) ? participant.users[0] : participant.users;
        if (!user?.email) continue;

        const isCandidate = participant.role === 'candidate';
        const recipientName = user.name || (isCandidate ? 'Candidate' : 'Interviewer');

        try {
            // Build URLs based on role
            const applicationUrl = !isCandidate
                ? `${portalUrl}/portal/applications/${interview.application_id}`
                : undefined;
            const prepPageUrl = isCandidate
                ? `${candidateWebsiteUrl}/interviews/${interview.id}/prep`
                : undefined;

            // Render email
            const { subject, html } = interviewReminderEmail({
                recipientName,
                candidateName,
                jobTitle,
                companyName,
                scheduledAt: new Date(interview.scheduled_at),
                duration: interview.scheduled_duration_minutes,
                meetingPlatform: interview.meeting_platform,
                joinLink,
                applicationUrl,
                prepPageUrl,
                reminderType: window.type,
                isCandidate,
            });

            // Create notification log entry (email)
            const emailLog = await createNotificationEntry(supabaseClient, {
                eventType,
                userId: user.id,
                email: user.email,
                subject,
                channel: 'email',
                priority: window.priority,
                payload: {
                    interview_id: interview.id,
                    scheduled_at: interview.scheduled_at,
                    reminder_type: window.type,
                },
                actionUrl: joinLink || applicationUrl,
            });

            // Send email via Resend
            const { data: emailData, error: emailError } = await resendClient.emails.send({
                from: FROM_EMAIL,
                to: user.email,
                subject,
                html,
            });

            if (emailError) {
                await supabaseClient
                    .from('notification_log')
                    .update({ status: 'failed', error_message: emailError.message })
                    .eq('id', emailLog.id);
                logger.error({ email: user.email, error: emailError.message }, 'Failed to send reminder email');
            } else {
                await supabaseClient
                    .from('notification_log')
                    .update({ status: 'sent', resend_message_id: emailData?.id })
                    .eq('id', emailLog.id);
            }

            // Create in-app notification
            const countdownText = getCountdownText(Math.round(minutesUntil), window.type);
            await createNotificationEntry(supabaseClient, {
                eventType,
                userId: user.id,
                email: user.email,
                subject: countdownText,
                channel: 'in_app',
                priority: window.priority,
                payload: {
                    interview_id: interview.id,
                    scheduled_at: interview.scheduled_at,
                    reminder_type: window.type,
                },
                actionUrl: isCandidate
                    ? `${candidateWebsiteUrl}/interviews/${interview.id}`
                    : `${portalUrl}/portal/interviews/${interview.id}`,
            });

            logger.info(
                { interviewId: interview.id, userId: user.id, reminderType: window.type },
                'Interview reminder sent'
            );
        } catch (error) {
            logger.error(
                { interviewId: interview.id, userId: user.id, error: error instanceof Error ? error.message : String(error) },
                'Failed to send reminder to participant'
            );
        }
    }
}

async function createNotificationEntry(
    supabaseClient: SupabaseClient,
    options: {
        eventType: string;
        userId: string;
        email: string;
        subject: string;
        channel: 'email' | 'in_app';
        priority: 'normal' | 'high' | 'urgent';
        payload: Record<string, any>;
        actionUrl?: string;
    },
): Promise<{ id: string }> {
    const { data, error } = await supabaseClient
        .from('notification_log')
        .insert({
            event_type: options.eventType,
            recipient_user_id: options.userId,
            recipient_email: options.email,
            subject: options.subject,
            template: options.channel === 'email' ? 'custom' : 'in_app',
            payload: options.payload,
            channel: options.channel,
            status: options.channel === 'in_app' ? 'sent' : 'pending',
            read: false,
            dismissed: false,
            priority: options.priority,
            category: 'interview',
            action_url: options.actionUrl ?? null,
            action_label: options.channel === 'in_app' ? 'View Interview' : null,
            error_message: null,
            sent_at: null,
        })
        .select('id')
        .single();

    if (error) throw new Error(`Failed to create notification log: ${error.message}`);
    return data;
}
