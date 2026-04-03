import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository.js';
import type { EmailSource } from '../../templates/base.js';
import {
    welcomeEmail,
    WelcomeEmailData,
    recruiterOnboardingEmail,
    RecruiterOnboardingData,
    companyWelcomeEmail,
    CompanyWelcomeData,
} from '../../templates/onboarding/index.js';

export class OnboardingEmailService {
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
            channel?: 'email' | 'in_app' | 'both';
            priority?: 'low' | 'normal' | 'high' | 'urgent';
            category?: string;
            actionUrl?: string;
            actionLabel?: string;
            source?: EmailSource;
        }
    ): Promise<void> {
        const requestedChannel = options.channel || 'email';
        const effectiveChannel = await this.repository.resolveChannelWithPreferences(options.userId, requestedChannel, options.category || null);
        if (!effectiveChannel) return;

        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId,
            recipient_email: to,
            subject,
            template: 'custom',
            payload: options.payload,
            status: effectiveChannel === 'in_app' ? 'sent' : 'pending',
            channel: effectiveChannel,
            read: false,
            dismissed: false,
            priority: options.priority || 'normal',
            category: options.category,
            action_url: options.actionUrl,
            action_label: options.actionLabel,
        });

        // Skip actual email send if downgraded to in-app only
        if (effectiveChannel === 'in_app') return;

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
                'Onboarding email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send onboarding email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendWelcome(
        email: string,
        data: WelcomeEmailData & { userId?: string }
    ): Promise<void> {
        const html = welcomeEmail(data);

        await this.sendEmail(email, 'Welcome to Splits Network', html, {
            eventType: 'user.registered',
            userId: data.userId,
            category: 'onboarding',
            actionUrl: data.dashboardUrl,
            actionLabel: 'Get Started',
        });
    }

    async sendRecruiterOnboarding(
        email: string,
        data: RecruiterOnboardingData & { userId?: string; recruiterId?: string }
    ): Promise<void> {
        const html = recruiterOnboardingEmail(data);

        await this.sendEmail(
            email,
            'Welcome, recruiter \u2014 here\u2019s how to get started',
            html,
            {
                eventType: 'recruiter.created',
                userId: data.userId,
                payload: { recruiter_id: data.recruiterId },
                category: 'onboarding',
                actionUrl: data.dashboardUrl,
                actionLabel: 'Start Recruiting',
            }
        );
    }

    async sendCompanyWelcome(
        email: string,
        data: CompanyWelcomeData & { userId?: string; companyId?: string }
    ): Promise<void> {
        const html = companyWelcomeEmail(data);

        await this.sendEmail(
            email,
            'Your company is set up on Splits Network',
            html,
            {
                eventType: 'company.created',
                userId: data.userId,
                payload: { company_id: data.companyId },
                category: 'onboarding',
                actionUrl: data.dashboardUrl,
                actionLabel: 'Post Your First Job',
            }
        );
    }
}
