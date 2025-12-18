import { AtsRepository } from '../../repository';
import { EventPublisher } from '../../events';
import { Application, Candidate, MaskedCandidate, ApplicationStage } from '@splits-network/shared-types';
import { CandidateService } from '../candidates/service';

export class ApplicationService {
    constructor(
        private repository: AtsRepository,
        private eventPublisher: EventPublisher,
        private candidateService: CandidateService
    ) {}

    async getApplications(filters?: {
        recruiter_id?: string;
        job_id?: string;
        stage?: string
    }): Promise<Application[]> {
        return await this.repository.findApplications(filters);
    }

    async getApplicationById(id: string): Promise<Application> {
        const application = await this.repository.findApplicationById(id);
        if (!application) {
            throw new Error(`Application ${id} not found`);
        }
        return application;
    }

    async getApplicationsByJobId(jobId: string): Promise<Application[]> {
        return await this.repository.findApplicationsByJobId(jobId);
    }

    async getApplicationsByRecruiterId(recruiterId: string): Promise<Application[]> {
        return await this.repository.findApplicationsByRecruiterId(recruiterId);
    }

    async getApplicationsByCandidateId(candidateId: string): Promise<Application[]> {
        return await this.repository.findApplicationsByCandidateId(candidateId);
    }

    async submitCandidate(
        jobId: string,
        candidateEmail: string,
        candidateName: string,
        recruiterId?: string,
        options: {
            linkedin_url?: string;
            phone?: string;
            location?: string;
            current_title?: string;
            current_company?: string;
            notes?: string;
        } = {}
    ): Promise<Application> {
        // Verify job exists
        const job = await this.repository.findJobById(jobId);
        if (!job) {
            throw new Error(`Job ${jobId} not found`);
        }

        // Find or create candidate (this sets recruiter_id as the sourcer)
        let candidate = await this.candidateService.findOrCreateCandidate(
            candidateEmail,
            candidateName,
            options.linkedin_url,
            recruiterId
        );

        // Update additional fields if provided
        if (options.phone || options.location || options.current_title || options.current_company) {
            candidate = await this.candidateService.updateCandidate(candidate.id, {
                phone: options.phone,
                location: options.location,
                current_title: options.current_title,
                current_company: options.current_company,
            });
        }

        // Create application
        const application = await this.repository.createApplication({
            job_id: jobId,
            candidate_id: candidate.id,
            recruiter_id: recruiterId,
            stage: 'submitted',
            notes: options.notes,
            accepted_by_company: false,
        });

        // Log the submission
        await this.repository.createAuditLog({
            application_id: application.id,
            action: 'created',
            performed_by_user_id: recruiterId,
            performed_by_role: 'recruiter',
            company_id: job.company_id,
            new_value: {
                stage: 'submitted',
                candidate_id: candidate.id,
                job_id: jobId,
            },
            metadata: {
                candidate_email: candidateEmail,
                candidate_name: candidateName,
                linkedin_url: options.linkedin_url,
                notes: options.notes,
            },
        });

        // Publish event - network service will create recruiter_candidates relationship
        await this.eventPublisher.publish(
            'application.created',
            {
                application_id: application.id,
                job_id: jobId,
                candidate_id: candidate.id,
                recruiter_id: recruiterId,
                company_id: job.company_id,
                candidate_was_created: !candidate.created_at || (new Date().getTime() - new Date(candidate.created_at).getTime() < 1000), // New if created within last second
            },
            'ats-service'
        );

        return application;
    }

    async updateApplicationStage(
        id: string,
        newStage: ApplicationStage,
        notes?: string,
        auditContext?: {
            userId?: string;
            userRole?: string;
            companyId?: string;
        }
    ): Promise<Application> {
        const application = await this.getApplicationById(id);
        const oldStage = application.stage;

        const updated = await this.repository.updateApplication(id, {
            stage: newStage,
            notes: notes || application.notes,
        });

        // Get job to extract company_id for audit log
        const job = await this.repository.findJobById(application.job_id);

        // Log the stage change
        await this.repository.createAuditLog({
            application_id: id,
            action: 'stage_changed',
            performed_by_user_id: auditContext?.userId,
            performed_by_role: auditContext?.userRole,
            company_id: auditContext?.companyId || job?.company_id,
            old_value: { stage: oldStage },
            new_value: { stage: newStage },
            metadata: {
                job_id: application.job_id,
                candidate_id: application.candidate_id,
                recruiter_id: application.recruiter_id,
                notes: notes,
            },
        });

        // Publish event
        await this.eventPublisher.publish(
            'application.stage_changed',
            {
                application_id: id,
                job_id: application.job_id,
                candidate_id: application.candidate_id,
                recruiter_id: application.recruiter_id,
                old_stage: oldStage,
                new_stage: newStage,
            },
            'ats-service'
        );

        return updated;
    }

    /**
     * Accept a candidate submission - allows company to see full candidate details
     * Logs the acceptance action for audit trail
     */
    async acceptApplication(
        applicationId: string,
        auditContext?: {
            userId?: string;
            userRole?: string;
            companyId?: string;
            ipAddress?: string;
            userAgent?: string;
        }
    ): Promise<Application> {
        const application = await this.getApplicationById(applicationId);

        if (application.accepted_by_company) {
            return application; // Already accepted
        }

        // Get job to extract company_id
        const job = await this.repository.findJobById(application.job_id);
        if (!job) {
            throw new Error(`Job ${application.job_id} not found`);
        }

        const updated = await this.repository.updateApplication(applicationId, {
            accepted_by_company: true,
            accepted_at: new Date(),
        });

        // Log the acceptance action
        await this.repository.createAuditLog({
            application_id: applicationId,
            action: 'accepted',
            performed_by_user_id: auditContext?.userId,
            performed_by_role: auditContext?.userRole,
            company_id: auditContext?.companyId || job.company_id,
            old_value: {
                accepted_by_company: false,
                accepted_at: null,
            },
            new_value: {
                accepted_by_company: true,
                accepted_at: updated.accepted_at,
            },
            metadata: {
                job_id: application.job_id,
                candidate_id: application.candidate_id,
                recruiter_id: application.recruiter_id,
                stage: application.stage,
            },
            ip_address: auditContext?.ipAddress,
            user_agent: auditContext?.userAgent,
        });

        // Publish event
        await this.eventPublisher.publish(
            'application.accepted',
            {
                application_id: applicationId,
                job_id: application.job_id,
                candidate_id: application.candidate_id,
                recruiter_id: application.recruiter_id,
                company_id: job.company_id,
                accepted_by_user_id: auditContext?.userId,
                accepted_at: updated.accepted_at,
            },
            'ats-service'
        );

        return updated;
    }

    /**
     * Get applications for a company with proper candidate masking
     * Only shows candidates that have been submitted to company's jobs
     */
    async getApplicationsForCompany(
        companyId: string,
        filters?: { job_id?: string; stage?: string }
    ): Promise<Array<Application & { candidate: Candidate | MaskedCandidate; recruiter?: { id: string; name: string; email: string } }>> {
        // Get all jobs for this company
        const jobs = await this.repository.findJobsByCompanyId(companyId);
        const jobIds = jobs.map(j => j.id);

        if (jobIds.length === 0) {
            return [];
        }

        // Get applications for these jobs
        const applications = await this.repository.findApplications({
            job_ids: jobIds,
            job_id: filters?.job_id,
            stage: filters?.stage,
        });

        // Enrich with candidate and recruiter data, applying masking as needed
        const enriched = await Promise.all(
            applications.map(async (app) => {
                const candidate = await this.repository.findCandidateById(app.candidate_id);
                if (!candidate) {
                    throw new Error(`Candidate ${app.candidate_id} not found`);
                }

                // Mask candidate data if not accepted by company
                const candidateData = app.accepted_by_company 
                    ? candidate 
                    : this.candidateService.maskCandidate(candidate);

                // Get recruiter info if present
                let recruiterInfo = undefined;
                if (app.recruiter_id) {
                    // TODO: Fetch from identity service
                    recruiterInfo = {
                        id: app.recruiter_id,
                        name: 'Recruiter', // Placeholder
                        email: 'recruiter@example.com', // Placeholder
                    };
                }

                return {
                    ...app,
                    candidate: candidateData,
                    recruiter: recruiterInfo,
                };
            })
        );

        return enriched;
    }

    /**
     * Get audit log for an application
     */
    async getApplicationAuditLog(applicationId: string) {
        return await this.repository.getAuditLogsForApplication(applicationId);
    }

    /**
     * Get audit logs for a company
     */
    async getCompanyAuditLogs(companyId: string, limit?: number) {
        return await this.repository.getAuditLogsForCompany(companyId, limit);
    }
}
