import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import type { EmailSource } from '../../templates/base';
import {
    weeklyActivityDigestEmail,
    WeeklyDigestData,
    monthlyHiringReportEmail,
    MonthlyReportData,
    candidateProfileReminderEmail,
    CandidateReminderData,
    recruiterInactivityReminderEmail,
    RecruiterReminderData,
    candidateMatchDigestEmail,
    CandidateMatchDigestData,
    recruiterAftercareEmail,
    getRecruiterAftercareSubject,
    RecruiterAftercareData,
    candidateAftercareEmail,
    getCandidateAftercareSubject,
    CandidateAftercareData,
    companyAftercareEmail,
    getCompanyAftercareSubject,
    CompanyAftercareData,
} from '../../templates/engagement';

export class EngagementEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private candidateFromEmail: string,
        private logger: Logger
    ) { }

    private async sendEmail(
        to: string,
        subject: string,
        html: string,
        options: {
            eventType: string;
            userId?: string;
            payload?: Record<string, any>;
            source?: EmailSource;
        }
    ): Promise<void> {
        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId,
            recipient_email: to,
            subject,
            template: 'custom',
            payload: options.payload,
            status: 'pending',
            channel: 'email',
            read: false,
            dismissed: false,
            priority: 'low',
            category: 'engagement',
        });

        try {
            const { data, error } = await this.resend.emails.send({
                from: options.source === 'candidate' ? this.candidateFromEmail : this.fromEmail,
                to,
                subject,
                html,
            });

            if (error) {
                throw error;
            }

            await this.repository.updateNotificationLog(log.id, {
                status: 'sent',
                resend_message_id: data?.id,
            });

            this.logger.info(
                { email: to, subject, message_id: data?.id },
                'Engagement email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send engagement email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendWeeklyDigest(
        email: string,
        data: WeeklyDigestData & { userId?: string }
    ): Promise<void> {
        const html = weeklyActivityDigestEmail(data);

        await this.sendEmail(email, `Your weekly activity summary — ${data.weekStartDate}`, html, {
            eventType: 'engagement.weekly_digest',
            userId: data.userId,
            payload: {
                recruiterName: data.recruiterName,
                weekStartDate: data.weekStartDate,
                applicationsSubmitted: data.applicationsSubmitted,
                placementsCreated: data.placementsCreated,
            },
        });
    }

    async sendMonthlyReport(
        email: string,
        data: MonthlyReportData & { userId?: string }
    ): Promise<void> {
        const html = monthlyHiringReportEmail(data);

        await this.sendEmail(email, `${data.monthName} ${data.year} hiring report — ${data.companyName}`, html, {
            eventType: 'engagement.monthly_report',
            userId: data.userId,
            payload: {
                companyName: data.companyName,
                monthName: data.monthName,
                totalApplications: data.totalApplications,
                placementsCompleted: data.placementsCompleted,
            },
        });
    }

    async sendCandidateReminder(
        email: string,
        data: CandidateReminderData & { userId?: string }
    ): Promise<void> {
        const html = candidateProfileReminderEmail(data);

        await this.sendEmail(email, 'Keep your profile up to date', html, {
            eventType: 'engagement.candidate_reminder',
            userId: data.userId,
            source: 'candidate',
            payload: {
                candidateName: data.candidateName,
                daysSinceActivity: data.daysSinceActivity,
            },
        });
    }

    async sendCandidateMatchDigest(
        email: string,
        data: CandidateMatchDigestData & { userId?: string }
    ): Promise<void> {
        const html = candidateMatchDigestEmail(data);
        const hasMatches = data.totalNewMatches > 0;
        const subject = hasMatches
            ? `Your weekly job matches — ${data.weekStartDate}`
            : `No new matches this week — ${data.weekStartDate}`;

        await this.sendEmail(email, subject, html, {
            eventType: 'engagement.candidate_match_digest',
            userId: data.userId,
            source: 'candidate',
            payload: {
                candidateName: data.candidateName,
                totalNewMatches: data.totalNewMatches,
                weekStartDate: data.weekStartDate,
            },
        });
    }

    async sendRecruiterReminder(
        email: string,
        data: RecruiterReminderData & { userId?: string }
    ): Promise<void> {
        const html = recruiterInactivityReminderEmail(data);

        await this.sendEmail(email, `You have ${data.pendingApplications} pending applications`, html, {
            eventType: 'engagement.recruiter_reminder',
            userId: data.userId,
            payload: {
                recruiterName: data.recruiterName,
                daysSinceActivity: data.daysSinceActivity,
                pendingApplications: data.pendingApplications,
            },
        });
    }

    async sendRecruiterAftercare(
        email: string,
        data: RecruiterAftercareData & { userId?: string; placementId: string }
    ): Promise<void> {
        const html = recruiterAftercareEmail(data);
        const subject = getRecruiterAftercareSubject(data);

        await this.sendEmail(email, subject, html, {
            eventType: `aftercare.recruiter_${data.milestone}`,
            userId: data.userId,
            payload: {
                placementId: data.placementId,
                milestone: data.milestone,
                candidateName: data.candidateName,
                companyName: data.companyName,
            },
        });
    }

    async sendCandidateAftercare(
        email: string,
        data: CandidateAftercareData & { userId?: string; placementId: string }
    ): Promise<void> {
        const html = candidateAftercareEmail(data);
        const subject = getCandidateAftercareSubject(data);
        if (!html || !subject) return;

        await this.sendEmail(email, subject, html, {
            eventType: `aftercare.candidate_${data.milestone}`,
            userId: data.userId,
            source: 'candidate',
            payload: {
                placementId: data.placementId,
                milestone: data.milestone,
                candidateName: data.candidateName,
                companyName: data.companyName,
            },
        });
    }

    async sendCompanyAftercare(
        email: string,
        data: CompanyAftercareData & { userId?: string; placementId: string }
    ): Promise<void> {
        const html = companyAftercareEmail(data);
        const subject = getCompanyAftercareSubject(data);
        if (!html || !subject) return;

        await this.sendEmail(email, subject, html, {
            eventType: `aftercare.company_${data.milestone}`,
            userId: data.userId,
            payload: {
                placementId: data.placementId,
                milestone: data.milestone,
                candidateName: data.candidateName,
                companyName: data.companyName,
            },
        });
    }
}
