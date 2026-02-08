import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ProposalsEmailService } from '../../services/proposals/service';
import { ServiceRegistry } from '../../clients';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

export class ProposalsEventConsumer {
    constructor(
        private emailService: ProposalsEmailService,
        private services: ServiceRegistry,
        private logger: Logger,
        private dataLookup: DataLookupHelper,
        private contactLookup: ContactLookupHelper
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
            
            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }
            
            // Fetch proposing recruiter contact
            const recruiterContact = await this.contactLookup.getRecruiterContact(proposing_recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${proposing_recruiter_id}`);
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
            
            // Fetch recruiter contact
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }
            
            // Fetch job details
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }
            
            // Send notification
            await this.emailService.sendProposalAccepted(recruiterContact.email, {
                candidateName: candidateContact.name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                roleId: job_id,
                userId: recruiterContact.user_id || undefined,
            });
            
            this.logger.info({ proposal_id, recipient: recruiterContact.email }, 'Proposal accepted notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send proposal accepted notification');
            throw error;
        }
    }

    async handleProposalDeclined(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, recruiter_id, decline_reason } = event.payload;
            
            this.logger.info({ proposal_id, recruiter_id }, 'Handling proposal declined notification');
            
            // Fetch recruiter contact
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }
            
            // Fetch job details
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }
            
            // Send notification
            await this.emailService.sendProposalDeclined(recruiterContact.email, {
                candidateName: candidateContact.name,
                jobTitle: job.title,
                declineReason: decline_reason || 'No reason provided',
                roleId: job_id,
                userId: recruiterContact.user_id || undefined,
            });
            
            this.logger.info({ proposal_id, recipient: recruiterContact.email }, 'Proposal declined notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send proposal declined notification');
            throw error;
        }
    }

    async handleProposalTimeout(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, recruiter_id } = event.payload;
            
            this.logger.info({ proposal_id, recruiter_id }, 'Handling proposal timeout notification');
            
            // Fetch recruiter contact
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }
            
            // Fetch job details
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }
            
            // Send notification
            await this.emailService.sendProposalTimeout(recruiterContact.email, {
                candidateName: candidateContact.name,
                jobTitle: job.title,
                roleId: job_id,
                userId: recruiterContact.user_id || undefined,
            });
            
            this.logger.info({ proposal_id, recipient: recruiterContact.email }, 'Proposal timeout notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send proposal timeout notification');
            throw error;
        }
    }
}
