/**
 * V3 Background Job Scheduler
 *
 * Orchestrates recurring notification jobs that run on a schedule:
 *   - Weekly activity digest (Mondays 8 AM UTC)
 *   - Monthly hiring report (1st of month 9 AM UTC)
 *   - Recruiter inactivity reminders (Thursdays 9 AM UTC)
 *   - Candidate profile reminders (Wednesdays 10 AM UTC)
 *   - Candidate match digest (Mondays 8 AM UTC)
 *   - Aftercare follow-ups (Daily 8 AM UTC)
 *   - Recording expiry cleanup (Daily 3 AM UTC)
 *
 * Each job is an independent K8s CronJob entrypoint (see /jobs/*.ts).
 * This scheduler provides a unified API for managing job execution
 * from within the service process when K8s CronJobs are not available
 * (e.g., local development).
 *
 * In production, prefer the K8s CronJob manifests. This in-process
 * scheduler is a convenience for dev/staging environments.
 */

import { Logger } from '@splits-network/shared-logging';
import { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NotificationRepository } from '../../repository';
import { EngagementEmailService } from '../../services/engagement/service';
import { PORTAL_URL, CANDIDATE_URL } from '../../helpers/urls';

export interface SchedulerConfig {
    supabaseUrl: string;
    supabaseKey: string;
    resendApiKey: string;
    fromEmail: string;
    candidateFromEmail: string;
    logger: Logger;
    /** Enable in-process scheduling (default: false, use K8s CronJobs instead) */
    enabled?: boolean;
}

interface ScheduledJob {
    name: string;
    /** cron-like label for logging; actual scheduling uses setInterval */
    schedule: string;
    intervalMs: number;
    handler: () => Promise<JobResult>;
}

export interface JobResult {
    sent: number;
    skipped: number;
    failed: number;
}

export class NotificationScheduler {
    private timers: NodeJS.Timeout[] = [];
    private isRunning = false;
    private supabase: SupabaseClient;
    private repository: NotificationRepository;
    private emailService: EngagementEmailService;

    constructor(private config: SchedulerConfig) {
        const { createClient } = require('@supabase/supabase-js');
        this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
        this.repository = new NotificationRepository(config.supabaseUrl, config.supabaseKey);

        const resend = new Resend(config.resendApiKey);
        this.emailService = new EngagementEmailService(
            resend, this.repository, config.fromEmail, config.candidateFromEmail, config.logger,
        );
    }

    /**
     * Start all scheduled jobs. Each job runs at its configured interval.
     * In production, this is a no-op — use K8s CronJobs instead.
     */
    start(): void {
        if (!this.config.enabled) {
            this.config.logger.info('In-process scheduler disabled (use K8s CronJobs)');
            return;
        }

        if (this.isRunning) return;
        this.isRunning = true;

        const jobs = this.getJobDefinitions();

        for (const job of jobs) {
            this.config.logger.info(
                { job: job.name, schedule: job.schedule, intervalMs: job.intervalMs },
                'Scheduling background job',
            );

            const timer = setInterval(async () => {
                await this.executeJob(job);
            }, job.intervalMs);

            this.timers.push(timer);
        }

        this.config.logger.info(
            { jobCount: jobs.length },
            'Notification scheduler started',
        );
    }

    /**
     * Stop all scheduled jobs and clear timers.
     */
    stop(): void {
        for (const timer of this.timers) {
            clearInterval(timer);
        }
        this.timers = [];
        this.isRunning = false;
        this.config.logger.info('Notification scheduler stopped');
    }

    /**
     * Execute a single job manually (useful for testing or one-off runs).
     */
    async executeJob(job: ScheduledJob): Promise<JobResult> {
        const startTime = Date.now();
        this.config.logger.info({ job: job.name }, 'Starting scheduled job');

        try {
            const result = await job.handler();

            this.config.logger.info(
                { job: job.name, ...result, durationMs: Date.now() - startTime },
                'Scheduled job completed',
            );

            return result;
        } catch (error) {
            this.config.logger.error(
                { err: error, job: job.name, durationMs: Date.now() - startTime },
                'Scheduled job failed',
            );

            return { sent: 0, skipped: 0, failed: 1 };
        }
    }

    /**
     * Run a specific job by name (for manual triggers via API).
     */
    async runJobByName(name: string): Promise<JobResult | null> {
        const job = this.getJobDefinitions().find(j => j.name === name);
        if (!job) return null;
        return this.executeJob(job);
    }

    /** List available job names */
    getJobNames(): string[] {
        return this.getJobDefinitions().map(j => j.name);
    }

    private getJobDefinitions(): ScheduledJob[] {
        return [
            {
                name: 'weekly-digest',
                schedule: 'Mondays 8 AM UTC',
                intervalMs: 7 * 24 * 60 * 60 * 1000, // 7 days
                handler: () => this.runWeeklyDigest(),
            },
            {
                name: 'monthly-report',
                schedule: '1st of month 9 AM UTC',
                intervalMs: 30 * 24 * 60 * 60 * 1000, // ~30 days
                handler: () => this.runMonthlyReport(),
            },
            {
                name: 'recruiter-reminders',
                schedule: 'Thursdays 9 AM UTC',
                intervalMs: 7 * 24 * 60 * 60 * 1000, // 7 days
                handler: () => this.runRecruiterReminders(),
            },
            {
                name: 'candidate-reminders',
                schedule: 'Wednesdays 10 AM UTC',
                intervalMs: 7 * 24 * 60 * 60 * 1000, // 7 days
                handler: () => this.runCandidateReminders(),
            },
            {
                name: 'candidate-match-digest',
                schedule: 'Mondays 8 AM UTC',
                intervalMs: 7 * 24 * 60 * 60 * 1000, // 7 days
                handler: () => this.runCandidateMatchDigest(),
            },
            {
                name: 'aftercare-reminders',
                schedule: 'Daily 8 AM UTC',
                intervalMs: 24 * 60 * 60 * 1000, // 1 day
                handler: () => this.runAftercareReminders(),
            },
        ];
    }

    // ── Job implementations delegate to dedicated runner modules ──

    private async runWeeklyDigest(): Promise<JobResult> {
        const { executeWeeklyDigest } = await import('./jobs/weekly-digest');
        return executeWeeklyDigest(this.supabase, this.emailService, this.config.logger);
    }

    private async runMonthlyReport(): Promise<JobResult> {
        const { executeMonthlyReport } = await import('./jobs/monthly-report');
        return executeMonthlyReport(this.supabase, this.emailService, this.config.logger);
    }

    private async runRecruiterReminders(): Promise<JobResult> {
        const { executeRecruiterReminders } = await import('./jobs/recruiter-reminders');
        return executeRecruiterReminders(this.supabase, this.emailService, this.config.logger);
    }

    private async runCandidateReminders(): Promise<JobResult> {
        const { executeCandidateReminders } = await import('./jobs/candidate-reminders');
        return executeCandidateReminders(this.supabase, this.emailService, this.config.logger);
    }

    private async runCandidateMatchDigest(): Promise<JobResult> {
        const { executeCandidateMatchDigest } = await import('./jobs/candidate-match-digest');
        return executeCandidateMatchDigest(this.supabase, this.emailService, this.config.logger);
    }

    private async runAftercareReminders(): Promise<JobResult> {
        const { executeAftercareReminders } = await import('./jobs/aftercare-reminders');
        return executeAftercareReminders(this.supabase, this.emailService, this.config.logger);
    }
}
