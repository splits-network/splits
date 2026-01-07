import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { PlacementsEmailService } from '../../services/placements/service';
import { ServiceRegistry } from '../../clients';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

export class PlacementsEventConsumer {
    constructor(
        private emailService: PlacementsEmailService,
        private services: ServiceRegistry,
        private logger: Logger,
        private dataLookup: DataLookupHelper,
        private contactLookup: ContactLookupHelper
    ) {}

    async handlePlacementCreated(event: DomainEvent): Promise<void> {
        try {
            const placementData = event.payload;
            const { placement_id, job_id, candidate_id, recruiter_id, salary, recruiter_share } = placementData;

            this.logger.info({ placement_id, recruiter_id }, 'Handling placement created notification');

            // Fetch job details
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }

            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(placementData.candidate_id || candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${placementData.candidate_id || candidate_id}`);
            }

            // Fetch recruiter contact
            const recruiterContact = await this.contactLookup.getRecruiterContact(placementData.recruiter_id || recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${placementData.recruiter_id || recruiter_id}`);
            }

            // Send email notification
            await this.emailService.sendPlacementCreated(recruiterContact.email, {
                candidateName: candidateContact.name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                salary: placementData.salary || salary,
                recruiterShare: placementData.recruiter_share_amount || recruiter_share,
                placementId: placement_id,
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info(
                { placement_id, recipient: recruiterContact.email, recruiter_share: placementData.recruiter_share_amount },
                'Placement created notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send placement created notification'
            );
            throw error;
        }
    }

    async handlePlacementActivated(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, candidate_id, job_id, guarantee_days } = event.payload;
            
            this.logger.info({ placement_id, guarantee_days }, 'Handling placement activated notification');
            
            // Fetch placement to get all recruiters involved
            const placement = await this.dataLookup.getPlacement(placement_id);
            if (!placement) {
                throw new Error(`Placement not found: ${placement_id}`);
            }
            
            // Fetch collaborators
            const collaborators = await this.dataLookup.getPlacementCollaborators(placement_id);
            
            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }
            
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Notify all collaborators
            for (const collaborator of collaborators) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(collaborator.recruiter_id);
                if (!recruiterContact) {
                    this.logger.warn({ recruiter_id: collaborator.recruiter_id }, 'Recruiter contact not found for collaborator');
                    continue;
                }
                
                await this.emailService.sendPlacementActivated(recruiterContact.email, {
                    candidateName: candidateContact.name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    guaranteeDays: guarantee_days || 90,
                    startDate: placement.start_date || new Date().toISOString().split('T')[0],
                    placementId: placement_id,
                    role: collaborator.role,
                    splitPercentage: collaborator.split_percentage || 0,
                    userId: recruiterContact.user_id || undefined,
                });
            }
            
            this.logger.info({ placement_id, collaborator_count: collaborators.length }, 'Placement activated notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send placement activated notifications');
            throw error;
        }
    }

    async handlePlacementCompleted(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, candidate_id, job_id } = event.payload;
            
            this.logger.info({ placement_id }, 'Handling placement completed notification');
            
            // Fetch collaborators
            const collaborators = await this.dataLookup.getPlacementCollaborators(placement_id);
            
            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }
            
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Notify all collaborators
            for (const collaborator of collaborators) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(collaborator.recruiter_id);
                if (!recruiterContact) {
                    this.logger.warn({ recruiter_id: collaborator.recruiter_id }, 'Recruiter contact not found for collaborator');
                    continue;
                }
                
                await this.emailService.sendPlacementCompleted(recruiterContact.email, {
                    candidateName: candidateContact.name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    finalPayout: (collaborator as any).amount_earned,
                    placementId: placement_id,
                    userId: recruiterContact.user_id || undefined,
                });
            }
            
            this.logger.info({ placement_id, collaborator_count: collaborators.length }, 'Placement completed notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send placement completed notifications');
            throw error;
        }
    }

    async handlePlacementFailed(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, candidate_id, job_id, failure_reason } = event.payload;
            
            this.logger.info({ placement_id, failure_reason }, 'Handling placement failed notification');
            
            // Fetch collaborators
            const collaborators = await this.dataLookup.getPlacementCollaborators(placement_id);
            
            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }
            
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Notify all collaborators
            for (const collaborator of collaborators) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(collaborator.recruiter_id);
                if (!recruiterContact) {
                    this.logger.warn({ recruiter_id: collaborator.recruiter_id }, 'Recruiter contact not found for collaborator');
                    continue;
                }
                
                await this.emailService.sendPlacementFailed(recruiterContact.email, {
                    candidateName: candidateContact.name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    failureReason: failure_reason || 'Not specified',
                    placementId: placement_id,
                    userId: recruiterContact.user_id || undefined,
                });
            }
            
            this.logger.info({ placement_id, collaborator_count: collaborators.length }, 'Placement failed notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send placement failed notifications');
            throw error;
        }
    }

    async handleGuaranteeExpiring(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, candidate_id, job_id, days_until_expiry } = event.payload;
            
            this.logger.info({ placement_id, days_until_expiry }, 'Handling guarantee expiring notification');
            
            // Fetch collaborators
            const collaborators = await this.dataLookup.getPlacementCollaborators(placement_id);
            
            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }
            
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Notify all collaborators
            for (const collaborator of collaborators) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(collaborator.recruiter_id);
                if (!recruiterContact) {
                    this.logger.warn({ recruiter_id: collaborator.recruiter_id }, 'Recruiter contact not found for collaborator');
                    continue;
                }
                
                await this.emailService.sendGuaranteeExpiring(recruiterContact.email, {
                    candidateName: candidateContact.name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    daysRemaining: days_until_expiry,
                    guaranteeEndDate: event.payload.guarantee_end_date || new Date(Date.now() + days_until_expiry * 86400000).toISOString().split('T')[0],
                    placementId: placement_id,
                    userId: recruiterContact.user_id || undefined,
                });
            }
            
            this.logger.info({ placement_id, collaborator_count: collaborators.length }, 'Guarantee expiring notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send guarantee expiring notifications');
            throw error;
        }
    }
}
