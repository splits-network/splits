import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { JobsEmailService } from '../../services/jobs/service';
import { ContactLookupHelper } from '../../helpers/contact-lookup';
import { DataLookupHelper } from '../../helpers/data-lookup';

export class JobsEventConsumer {
    constructor(
        private emailService: JobsEmailService,
        private logger: Logger,
        private portalUrl: string,
        private contactLookup: ContactLookupHelper,
        private dataLookup: DataLookupHelper
    ) {}

    async handleJobCreated(event: DomainEvent): Promise<void> {
        try {
            const { jobId } = event.payload;

            this.logger.info({ jobId }, 'Handling job created notification');

            const job = await this.dataLookup.getJob(jobId);
            if (!job) {
                throw new Error(`Job not found: ${jobId}`);
            }

            const adminContacts = job.company?.identity_organization_id
                ? await this.contactLookup.getCompanyAdminContacts(job.company.identity_organization_id)
                : [];

            for (const admin of adminContacts) {
                await this.emailService.sendJobCreatedConfirmation(admin.email, {
                    jobTitle: job.title,
                    companyName: job.company?.name || 'your company',
                    jobUrl: `${this.portalUrl}/portal/jobs/${job.id}`,
                    userId: admin.user_id || undefined,
                });
            }

            this.logger.info(
                { jobId, recipientCount: adminContacts.length },
                'Job created notifications sent successfully'
            );

            // Milestone: Check if this is the company's first job
            await this.checkFirstJobMilestone(job, adminContacts);
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send job created notification'
            );
            throw error;
        }
    }

    private async checkFirstJobMilestone(
        job: { id: string; title: string; company_id: string; company?: { id: string; name: string; identity_organization_id: string | null } },
        adminContacts: Array<{ email: string; name: string; user_id: string | null }>
    ): Promise<void> {
        try {
            const isFirst = await this.dataLookup.isFirstJobForCompany(job.company_id, job.id);
            if (!isFirst) return;

            const alreadySent = await this.dataLookup.wasMilestoneSent(
                'milestone.first_job',
                adminContacts[0]?.email || ''
            );
            if (alreadySent) return;

            this.logger.info({ jobId: job.id, companyId: job.company_id }, 'First job milestone detected');

            for (const admin of adminContacts) {
                await this.emailService.sendFirstJobPosted(admin.email, {
                    jobTitle: job.title,
                    companyName: job.company?.name || 'your company',
                    jobUrl: `${this.portalUrl}/portal/jobs/${job.id}`,
                    userId: admin.user_id || undefined,
                });
            }
        } catch (error) {
            // Milestone failures are non-fatal — don't break the main notification flow
            this.logger.error({ error, jobId: job.id }, 'Failed to send first job milestone (non-fatal)');
        }
    }

    async handleJobStatusChanged(event: DomainEvent): Promise<void> {
        try {
            const { jobId, previousStatus, newStatus } = event.payload;

            this.logger.info({ jobId, previousStatus, newStatus }, 'Handling job status changed notification');

            // Skip internal status changes that don't need notifications
            if (newStatus === 'draft') return;

            const job = await this.dataLookup.getJob(jobId);
            if (!job) {
                throw new Error(`Job not found: ${jobId}`);
            }

            const adminContacts = job.company?.identity_organization_id
                ? await this.contactLookup.getCompanyAdminContacts(job.company.identity_organization_id)
                : [];

            // Route to expired template if expired
            if (newStatus === 'expired') {
                for (const admin of adminContacts) {
                    await this.emailService.sendJobExpired(admin.email, {
                        jobTitle: job.title,
                        companyName: job.company?.name || 'your company',
                        jobUrl: `${this.portalUrl}/portal/jobs/${job.id}`,
                        userId: admin.user_id || undefined,
                    });
                }

                this.logger.info(
                    { jobId, recipientCount: adminContacts.length },
                    'Job expired notifications sent successfully'
                );
                return;
            }

            // For closed/paused, send status changed notification
            if (newStatus === 'closed' || newStatus === 'paused') {
                for (const admin of adminContacts) {
                    await this.emailService.sendJobStatusChanged(admin.email, {
                        jobTitle: job.title,
                        companyName: job.company?.name || 'your company',
                        previousStatus,
                        newStatus,
                        jobUrl: `${this.portalUrl}/portal/jobs/${job.id}`,
                        recipientName: admin.name,
                        userId: admin.user_id || undefined,
                    });
                }

                this.logger.info(
                    { jobId, newStatus, recipientCount: adminContacts.length },
                    'Job status changed notifications sent successfully'
                );
            }
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send job status changed notification'
            );
            throw error;
        }
    }
}
