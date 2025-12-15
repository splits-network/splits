import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { EmailService } from './email';
import { ServiceRegistry } from './clients';

export class EventConsumer {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'notification-service-queue';

    constructor(
        private rabbitMqUrl: string,
        private emailService: EmailService,
        private services: ServiceRegistry,
        private logger: Logger
    ) { }

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.rabbitMqUrl) as any;
            this.channel = await (this.connection as any).createChannel();

            if (!this.channel) throw new Error('Failed to create channel');

            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            await this.channel.assertQueue(this.queue, { durable: true });

            // Bind to events we care about
            // Phase 1 events
            await this.channel.bindQueue(this.queue, this.exchange, 'application_created');
            await this.channel.bindQueue(this.queue, this.exchange, 'application_stage_changed');
            await this.channel.bindQueue(this.queue, this.exchange, 'placement_created');
            
            // Phase 2 events - Ownership & Sourcing
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate_sourced');
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate_outreach_recorded');
            await this.channel.bindQueue(this.queue, this.exchange, 'ownership_conflict_detected');
            
            // Phase 2 events - Proposals
            await this.channel.bindQueue(this.queue, this.exchange, 'proposal_created');
            await this.channel.bindQueue(this.queue, this.exchange, 'proposal_accepted');
            await this.channel.bindQueue(this.queue, this.exchange, 'proposal_declined');
            await this.channel.bindQueue(this.queue, this.exchange, 'proposal_timeout');
            
            // Phase 2 events - Placements
            await this.channel.bindQueue(this.queue, this.exchange, 'placement_activated');
            await this.channel.bindQueue(this.queue, this.exchange, 'placement_completed');
            await this.channel.bindQueue(this.queue, this.exchange, 'placement_failed');
            await this.channel.bindQueue(this.queue, this.exchange, 'replacement_requested');
            await this.channel.bindQueue(this.queue, this.exchange, 'guarantee_expiring');
            
            // Phase 2 events - Collaboration
            await this.channel.bindQueue(this.queue, this.exchange, 'collaborator_added');
            await this.channel.bindQueue(this.queue, this.exchange, 'reputation_updated');

            this.logger.info('Connected to RabbitMQ and bound to events');

            await this.startConsuming();
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to connect to RabbitMQ');
            throw error;
        }
    }

    private async startConsuming(): Promise<void> {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }

        await this.channel.consume(
            this.queue,
            async (msg: ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const event: DomainEvent = JSON.parse(msg.content.toString());
                    this.logger.info({ event_type: event.event_type }, 'Processing event');

                    await this.handleEvent(event);

                    this.channel!.ack(msg);
                } catch (error) {
                    this.logger.error({ err: error }, 'Error processing message');
                    // Reject and requeue (consider dead letter queue in production)
                    this.channel!.nack(msg, false, false);
                }
            },
            { noAck: false }
        );

        this.logger.info('Started consuming events');
    }

    private async handleEvent(event: DomainEvent): Promise<void> {
        switch (event.event_type) {
            case 'application.created':
                await this.handleApplicationCreated(event);
                break;

            case 'application.stage_changed':
                await this.handleApplicationStageChanged(event);
                break;

            case 'placement.created':
                await this.handlePlacementCreated(event);
                break;
                
            // Phase 2 - Ownership & Sourcing
            case 'candidate.sourced':
                await this.handleCandidateSourced(event);
                break;
                
            case 'ownership.conflict_detected':
                await this.handleOwnershipConflict(event);
                break;
                
            // Phase 2 - Proposals
            case 'proposal.created':
                await this.handleProposalCreated(event);
                break;
                
            case 'proposal.accepted':
                await this.handleProposalAccepted(event);
                break;
                
            case 'proposal.declined':
                await this.handleProposalDeclined(event);
                break;
                
            case 'proposal.timeout':
                await this.handleProposalTimeout(event);
                break;
                
            // Phase 2 - Placements
            case 'placement.activated':
                await this.handlePlacementActivated(event);
                break;
                
            case 'placement.completed':
                await this.handlePlacementCompleted(event);
                break;
                
            case 'placement.failed':
                await this.handlePlacementFailed(event);
                break;
                
            case 'guarantee.expiring':
                await this.handleGuaranteeExpiring(event);
                break;
                
            // Phase 2 - Collaboration
            case 'collaborator.added':
                await this.handleCollaboratorAdded(event);
                break;

            default:
                this.logger.debug({ event_type: event.event_type }, 'Unhandled event type');
        }
    }

    private async handleApplicationCreated(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id } = event.payload;

            this.logger.info({ application_id, job_id, candidate_id }, 'Fetching data for application created notification');

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch recruiter details
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            // Fetch recruiter's user profile to get email
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;

            // Send email notification
            await this.emailService.sendApplicationCreated(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                userId: recruiter.user_id,
            });

            this.logger.info(
                { application_id, recipient: user.email },
                'Application created notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send application created notification'
            );
            // Re-throw to trigger message requeue
            throw error;
        }
    }

    private async handleApplicationStageChanged(event: DomainEvent): Promise<void> {
        try {
            const { application_id, old_stage, new_stage, job_id, candidate_id } = event.payload;

            this.logger.info(
                { application_id, old_stage, new_stage },
                'Fetching data for stage changed notification'
            );

            // Fetch application to get recruiter ID
            const applicationResponse = await this.services.getAtsService().get<any>(`/applications/${application_id}`);
            const application = applicationResponse.data || applicationResponse;

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id || application.job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id || application.candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch recruiter details
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${application.submitted_by_recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            // Fetch recruiter's user profile to get email
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;

            // Send email notification
            await this.emailService.sendApplicationStageChanged(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                oldStage: old_stage,
                newStage: new_stage,
                userId: recruiter.user_id,
            });

            this.logger.info(
                { application_id, recipient: user.email, new_stage },
                'Stage changed notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send stage changed notification'
            );
            throw error;
        }
    }

    private async handlePlacementCreated(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, recruiter_id, recruiter_share, job_id, candidate_id, salary } = event.payload;

            this.logger.info(
                { placement_id, recruiter_id, recruiter_share },
                'Fetching data for placement created notification'
            );

            // Fetch placement details if not in payload
            let placementData = event.payload;
            if (!salary || !job_id || !candidate_id) {
                const placementResponse = await this.services.getAtsService().get<any>(`/placements/${placement_id}`);
                placementData = placementResponse.data || placementResponse;
            }

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${placementData.job_id || job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${placementData.candidate_id || candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch recruiter details
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${placementData.recruiter_id || recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            // Fetch recruiter's user profile to get email
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;

            // Send email notification
            await this.emailService.sendPlacementCreated(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                salary: placementData.salary || salary,
                recruiterShare: placementData.recruiter_share_amount || recruiter_share,
                userId: recruiter.user_id,
            });

            this.logger.info(
                { placement_id, recipient: user.email, recruiter_share: placementData.recruiter_share_amount },
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
    
    // ======================
    // Phase 2 Event Handlers
    // ======================
    
    private async handleCandidateSourced(event: DomainEvent): Promise<void> {
        try {
            const { candidate_id, sourcer_recruiter_id, source_method } = event.payload;
            
            this.logger.info({ candidate_id, sourcer_recruiter_id }, 'Handling candidate sourced notification');
            
            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            // Fetch sourcer recruiter details
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${sourcer_recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            // Fetch user profile to get email
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;
            
            // Send confirmation email
            await this.emailService.sendCandidateSourced(user.email, {
                candidateName: candidate.full_name,
                sourceMethod: source_method,
                protectionPeriod: '365 days',
                userId: recruiter.user_id,
            });
            
            this.logger.info({ candidate_id, recipient: user.email }, 'Candidate sourced notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send candidate sourced notification');
            throw error;
        }
    }
    
    private async handleOwnershipConflict(event: DomainEvent): Promise<void> {
        try {
            const { candidate_id, original_sourcer_id, attempting_recruiter_id } = event.payload;
            
            this.logger.info({ candidate_id, original_sourcer_id }, 'Handling ownership conflict notification');
            
            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            // Fetch original sourcer
            const originalRecruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${original_sourcer_id}`);
            const originalRecruiter = originalRecruiterResponse.data || originalRecruiterResponse;
            
            const originalUserResponse = await this.services.getIdentityService().get<any>(`/users/${originalRecruiter.user_id}`);
            const originalUser = originalUserResponse.data || originalUserResponse;
            
            // Fetch attempting recruiter
            const attemptingRecruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${attempting_recruiter_id}`);
            const attemptingRecruiter = attemptingRecruiterResponse.data || attemptingRecruiterResponse;
            
            const attemptingUserResponse = await this.services.getIdentityService().get<any>(`/users/${attemptingRecruiter.user_id}`);
            const attemptingUser = attemptingUserResponse.data || attemptingUserResponse;
            
            // Notify original sourcer
            await this.emailService.sendOwnershipConflict(originalUser.email, {
                candidateName: candidate.full_name,
                attemptingRecruiterName: `${attemptingUser.first_name} ${attemptingUser.last_name}`,
                userId: originalRecruiter.user_id,
            });
            
            // Notify attempting recruiter
            await this.emailService.sendOwnershipConflictRejection(attemptingUser.email, {
                candidateName: candidate.full_name,
                originalSourcerName: `${originalUser.first_name} ${originalUser.last_name}`,
                userId: attemptingRecruiter.user_id,
            });
            
            this.logger.info({ candidate_id }, 'Ownership conflict notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send ownership conflict notification');
            throw error;
        }
    }
    
    private async handleProposalCreated(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, proposing_recruiter_id } = event.payload;
            
            this.logger.info({ proposal_id, job_id }, 'Handling proposal created notification');
            
            // Fetch job details to get hiring manager
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            // Fetch proposing recruiter
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${proposing_recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            // TODO: Notify hiring manager (when we have that feature)
            // For now, just log
            this.logger.info({ proposal_id, job_id, candidate_id }, 'Proposal created - hiring manager notification pending');
            
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to handle proposal created');
            throw error;
        }
    }
    
    private async handleProposalAccepted(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, recruiter_id } = event.payload;
            
            this.logger.info({ proposal_id, recruiter_id }, 'Handling proposal accepted notification');
            
            // Fetch recruiter
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;
            
            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
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
    
    private async handleProposalDeclined(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, recruiter_id, decline_reason } = event.payload;
            
            this.logger.info({ proposal_id, recruiter_id }, 'Handling proposal declined notification');
            
            // Fetch recruiter
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;
            
            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
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
    
    private async handleProposalTimeout(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, recruiter_id } = event.payload;
            
            this.logger.info({ proposal_id, recruiter_id }, 'Handling proposal timeout notification');
            
            // Fetch recruiter
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;
            
            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
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
    
    private async handlePlacementActivated(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, candidate_id, job_id, guarantee_days } = event.payload;
            
            this.logger.info({ placement_id }, 'Handling placement activated notification');
            
            // Fetch placement to get all recruiters involved
            const placementResponse = await this.services.getAtsService().get<any>(`/placements/${placement_id}`);
            const placement = placementResponse.data || placementResponse;
            
            // Fetch collaborators
            const collaboratorsResponse = await this.services.getAtsService().get<any>(`/placements/${placement_id}/collaborators`);
            const collaborators = collaboratorsResponse.data || collaboratorsResponse;
            
            // Fetch candidate and job details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Notify all collaborators
            for (const collaborator of collaborators) {
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${collaborator.recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;
                
                const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
                const user = userResponse.data || userResponse;
                
                await this.emailService.sendPlacementActivated(user.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    guaranteeDays: guarantee_days || 90,
                    role: collaborator.role,
                    splitPercentage: collaborator.split_percentage,
                    userId: recruiter.user_id,
                });
            }
            
            this.logger.info({ placement_id, collaborator_count: collaborators.length }, 'Placement activated notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send placement activated notifications');
            throw error;
        }
    }
    
    private async handlePlacementCompleted(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, candidate_id, job_id } = event.payload;
            
            this.logger.info({ placement_id }, 'Handling placement completed notification');
            
            // Fetch collaborators
            const collaboratorsResponse = await this.services.getAtsService().get<any>(`/placements/${placement_id}/collaborators`);
            const collaborators = collaboratorsResponse.data || collaboratorsResponse;
            
            // Fetch candidate and job details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Notify all collaborators
            for (const collaborator of collaborators) {
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${collaborator.recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;
                
                const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
                const user = userResponse.data || userResponse;
                
                await this.emailService.sendPlacementCompleted(user.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    finalPayout: collaborator.amount_earned,
                    userId: recruiter.user_id,
                });
            }
            
            this.logger.info({ placement_id, collaborator_count: collaborators.length }, 'Placement completed notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send placement completed notifications');
            throw error;
        }
    }
    
    private async handlePlacementFailed(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, candidate_id, job_id, failure_reason } = event.payload;
            
            this.logger.info({ placement_id, failure_reason }, 'Handling placement failed notification');
            
            // Fetch collaborators
            const collaboratorsResponse = await this.services.getAtsService().get<any>(`/placements/${placement_id}/collaborators`);
            const collaborators = collaboratorsResponse.data || collaboratorsResponse;
            
            // Fetch candidate and job details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Notify all collaborators
            for (const collaborator of collaborators) {
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${collaborator.recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;
                
                const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
                const user = userResponse.data || userResponse;
                
                await this.emailService.sendPlacementFailed(user.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    failureReason: failure_reason || 'Not specified',
                    userId: recruiter.user_id,
                });
            }
            
            this.logger.info({ placement_id, collaborator_count: collaborators.length }, 'Placement failed notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send placement failed notifications');
            throw error;
        }
    }
    
    private async handleGuaranteeExpiring(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, candidate_id, job_id, days_until_expiry } = event.payload;
            
            this.logger.info({ placement_id, days_until_expiry }, 'Handling guarantee expiring notification');
            
            // Fetch collaborators
            const collaboratorsResponse = await this.services.getAtsService().get<any>(`/placements/${placement_id}/collaborators`);
            const collaborators = collaboratorsResponse.data || collaboratorsResponse;
            
            // Fetch candidate and job details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Notify all collaborators
            for (const collaborator of collaborators) {
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${collaborator.recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;
                
                const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
                const user = userResponse.data || userResponse;
                
                await this.emailService.sendGuaranteeExpiring(user.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    daysUntilExpiry: days_until_expiry,
                    userId: recruiter.user_id,
                });
            }
            
            this.logger.info({ placement_id, days_until_expiry, collaborator_count: collaborators.length }, 'Guarantee expiring notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send guarantee expiring notifications');
            throw error;
        }
    }
    
    private async handleCollaboratorAdded(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, recruiter_id, role, split_percentage, candidate_id, job_id } = event.payload;
            
            this.logger.info({ placement_id, recruiter_id, role }, 'Handling collaborator added notification');
            
            // Fetch new collaborator
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;
            
            // Fetch candidate and job details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Send notification
            await this.emailService.sendCollaboratorAdded(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                role,
                splitPercentage: split_percentage,
                userId: recruiter.user_id,
            });
            
            this.logger.info({ placement_id, recruiter_id, recipient: user.email }, 'Collaborator added notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send collaborator added notification');
            throw error;
        }
    }

    isConnected(): boolean {
        return this.connection !== null && this.channel !== null;
    }

    async close(): Promise<void> {
        if (this.channel) await this.channel.close();
        if (this.connection) await (this.connection as any).close();
        this.logger.info('Disconnected from RabbitMQ');
    }
}
