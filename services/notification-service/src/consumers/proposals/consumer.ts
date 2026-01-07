import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ProposalsEmailService } from '../../services/proposals/service';
import { ServiceRegistry } from '../../clients';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { EmailLookupHelper } from '../../helpers/email-lookup';

export class ProposalsEventConsumer {
    constructor(
        private emailService: ProposalsEmailService,
        private services: ServiceRegistry,
        private logger: Logger,
        private dataLookup: DataLookupHelper,
        private emailLookup: EmailLookupHelper
    ) {}

    async handleProposalCreated(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, proposing_recruiter_id } = event.payload;
            
            this.logger.info({ proposal_id, job_id, candidate_id }, 'Handling proposal created');
            
            // Fetch job details
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Fetch candidate details
            const candidate = await this.dataLookup.getCandidate(candidate_id);
            if (!candidate) {
                throw new Error(`Candidate not found: ${candidate_id}`);
            }
            
            // Fetch proposing recruiter
            const recruiter = await this.dataLookup.getRecruiter(proposing_recruiter_id);
            if (!recruiter) {
                throw new Error(`Recruiter not found: ${proposing_recruiter_id}`);
            }
            
            // TODO: Notify hiring manager (when we have that feature)
            // For now, just log
            this.logger.info({ proposal_id, job_id, candidate_id }, 'Proposal created - hiring manager notification pending');
            
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to handle proposal created');
            throw error;
        }
    }

    async handleProposalAccepted(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, recruiter_id } = event.payload;
            
            this.logger.info({ proposal_id, recruiter_id }, 'Handling proposal accepted notification');
            
            // Fetch recruiter
            const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
            if (!recruiter) {
                throw new Error(`Recruiter not found: ${recruiter_id}`);
            }
            
            const user = await this.dataLookup.getUser(recruiter.user_id);
            if (!user) {
                throw new Error(`User not found for recruiter: ${recruiter.user_id}`);
            }
            
            // Fetch job details
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Fetch candidate details
            const candidate = await this.dataLookup.getCandidate(candidate_id);
            if (!candidate) {
                throw new Error(`Candidate not found: ${candidate_id}`);
            }
            
            // Send notification
            await this.emailService.sendProposalAccepted(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                userId: recruiter.user_id,
            });
            
            this.logger.info({ proposal_id, recipient: user.email }, 'Proposal accepted notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send proposal accepted notification');
            throw error;
        }
    }

    async handleProposalDeclined(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, recruiter_id, decline_reason } = event.payload;
            
            this.logger.info({ proposal_id, recruiter_id }, 'Handling proposal declined notification');
            
            // Fetch recruiter
            const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
            if (!recruiter) {
                throw new Error(`Recruiter not found: ${recruiter_id}`);
            }
            
            const user = await this.dataLookup.getUser(recruiter.user_id);
            if (!user) {
                throw new Error(`User not found for recruiter: ${recruiter.user_id}`);
            }
            
            // Fetch job details
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Fetch candidate details
            const candidate = await this.dataLookup.getCandidate(candidate_id);
            if (!candidate) {
                throw new Error(`Candidate not found: ${candidate_id}`);
            }
            
            // Send notification
            await this.emailService.sendProposalDeclined(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                declineReason: decline_reason || 'No reason provided',
                userId: recruiter.user_id,
            });
            
            this.logger.info({ proposal_id, recipient: user.email }, 'Proposal declined notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send proposal declined notification');
            throw error;
        }
    }

    async handleProposalTimeout(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, recruiter_id } = event.payload;
            
            this.logger.info({ proposal_id, recruiter_id }, 'Handling proposal timeout notification');
            
            // Fetch recruiter
            const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
            if (!recruiter) {
                throw new Error(`Recruiter not found: ${recruiter_id}`);
            }
            
            const user = await this.dataLookup.getUser(recruiter.user_id);
            if (!user) {
                throw new Error(`User not found for recruiter: ${recruiter.user_id}`);
            }
            
            // Fetch job details
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Fetch candidate details
            const candidate = await this.dataLookup.getCandidate(candidate_id);
            if (!candidate) {
                throw new Error(`Candidate not found: ${candidate_id}`);
            }
            
            // Send notification
            await this.emailService.sendProposalTimeout(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                userId: recruiter.user_id,
            });
            
            this.logger.info({ proposal_id, recipient: user.email }, 'Proposal timeout notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send proposal timeout notification');
            throw error;
        }
    }
}
