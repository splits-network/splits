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

    async handleJobUpdated(event: DomainEvent): Promise<void> {
        try {
            const { jobId, updatedFields, updatedBy } = event.payload;

            // Only notify for significant field changes
            const significantFields = ['title', 'salary_min', 'salary_max', 'fee_percentage', 'location', 'status'];
            const hasSignificantChange = updatedFields?.some((f: string) => significantFields.includes(f));
            if (!hasSignificantChange) return;

            this.logger.info({ jobId, updatedFields }, 'Handling job updated notification');

            const job = await this.dataLookup.getJob(jobId);
            if (!job) return;

            const recipients = await this.resolveJobStakeholders(job);

            for (const recipient of recipients) {
                if (recipient.user_id === updatedBy) continue;
                await this.emailService.sendJobFieldsUpdated(recipient.email, {
                    jobTitle: job.title,
                    companyName: job.company?.name || 'your company',
                    updatedFields: updatedFields.filter((f: string) => significantFields.includes(f)),
                    jobUrl: `${this.portalUrl}/portal/jobs/${job.id}`,
                    userId: recipient.user_id || undefined,
                });
            }

            this.logger.info(
                { jobId, recipientCount: recipients.length },
                'Job updated notifications sent successfully'
            );
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send job updated notification');
            throw error;
        }
    }

    async handleJobDeleted(event: DomainEvent): Promise<void> {
        try {
            const { jobId, deletedBy } = event.payload;
            this.logger.info({ jobId }, 'Handling job deleted notification');

            const job = await this.dataLookup.getJob(jobId);
            if (!job) return;

            const recipients = await this.resolveJobStakeholders(job);

            for (const recipient of recipients) {
                if (recipient.user_id === deletedBy) continue;
                await this.emailService.sendJobDeleted(recipient.email, {
                    jobTitle: job.title,
                    companyName: job.company?.name || 'your company',
                    userId: recipient.user_id || undefined,
                });
            }

            this.logger.info(
                { jobId, recipientCount: recipients.length },
                'Job deleted notifications sent successfully'
            );
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send job deleted notification');
            throw error;
        }
    }

    private async resolveJobStakeholders(
        job: { id: string; company_id: string; company?: { identity_organization_id: string | null } }
    ): Promise<Array<{ email: string; name: string; user_id: string | null }>> {
        const recipients: Array<{ email: string; name: string; user_id: string | null }> = [];
        const seenUserIds = new Set<string>();

        // Company admin contacts
        if (job.company?.identity_organization_id) {
            const adminContacts = await this.contactLookup.getCompanyAdminContacts(job.company.identity_organization_id);
            for (const admin of adminContacts) {
                if (admin.user_id && !seenUserIds.has(admin.user_id)) {
                    seenUserIds.add(admin.user_id);
                    recipients.push(admin);
                }
            }
        }

        // Recruiters with active candidates on this job
        try {
            const activeRecruiters = await this.dataLookup.getActiveRecruitersForJob(job.id);
            for (const rec of activeRecruiters) {
                if (rec.user_id && !seenUserIds.has(rec.user_id)) {
                    seenUserIds.add(rec.user_id);
                    recipients.push(rec);
                }
            }
        } catch (error) {
            this.logger.error({ error, jobId: job.id }, 'Failed to resolve active recruiters for job (non-fatal)');
        }

        return recipients;
    }

    async handleJobRecommendationCreated(event: DomainEvent): Promise<void> {
        try {
            const { jobId, candidateId, message } = event.payload;

            this.logger.info({ jobId, candidateId }, 'Handling job recommendation notification');

            const job = await this.dataLookup.getJob(jobId);
            if (!job) {
                throw new Error(`Job not found: ${jobId}`);
            }

            const candidateContact = await this.contactLookup.getCandidateContact(candidateId);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidateId}`);
            }

            await this.emailService.sendJobRecommendation(candidateContact.email, {
                candidateName: candidateContact.name,
                jobTitle: job.title,
                companyName: job.company?.name || 'a company',
                message: message || undefined,
                jobUrl: `${this.portalUrl}/portal/jobs/${jobId}`,
                userId: candidateContact.user_id || undefined,
            });

            this.logger.info(
                { jobId, candidateId, recipient: candidateContact.email },
                'Job recommendation notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send job recommendation notification'
            );
            throw error;
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
