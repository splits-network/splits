/**
 * V2 Domain Event Consumer for ATS Service
 * Listens to application.stage_changed events from other services
 * and syncs the changes to the ATS database
 */

import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { ApplicationRepository } from '../applications/repository';
import { CandidateRepository } from '../candidates/repository';
import { CandidateSourcerRepository } from '../candidate-sourcers/repository';
import { PlacementServiceV2 } from '../placements/service';
import { EventPublisher, IEventPublisher } from './events';

interface DomainEvent {
    event_id: string;
    event_type: string;
    payload: Record<string, any>;
    timestamp: string;
}

export class DomainEventConsumer {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'ats-service-v2-events';

    constructor(
        private rabbitMqUrl: string,
        private applicationRepository: ApplicationRepository,
        private candidateRepository: CandidateRepository,
        private candidateSourcerRepository: CandidateSourcerRepository,
        private placementService: PlacementServiceV2,
        private eventPublisher: IEventPublisher,
        private logger: Logger
    ) { }

    /**
     * Connect to RabbitMQ and start consuming events
     */
    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.rabbitMqUrl) as any;
            this.channel = await (this.connection as any).createChannel();

            if (!this.channel) {
                throw new Error('Failed to create RabbitMQ channel');
            }

            // Declare topic exchange
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

            // Declare queue
            await this.channel.assertQueue(this.queue, { durable: true });

            // Bind to application.stage_changed events from other services
            await this.channel.bindQueue(this.queue, this.exchange, 'application.stage_changed');

            // Bind to ai_review events to trigger stage transitions
            await this.channel.bindQueue(this.queue, this.exchange, 'ai_review.completed');
            await this.channel.bindQueue(this.queue, this.exchange, 'ai_review.failed');

            // Bind to candidate events from network service
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate.link_requested');
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate.sourcer_assignment_requested');

            // Bind to resume metadata extraction events from AI service
            await this.channel.bindQueue(this.queue, this.exchange, 'resume.metadata.extracted');

            // Bind to primary resume change events from document service
            await this.channel.bindQueue(this.queue, this.exchange, 'resume.primary.changed');

            this.logger.info('V2 ATS domain consumer connected to RabbitMQ');

            // Start consuming
            await this.channel.consume(
                this.queue,
                (msg) => this.handleMessage(msg),
                { noAck: false }
            );

            this.logger.info('V2 ATS domain consumer started consuming events');
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to connect V2 ATS domain consumer to RabbitMQ');
            throw error;
        }
    }

    /**
     * Handle incoming message
     */
    private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
        if (!msg || !this.channel) {
            return;
        }

        try {
            const event: DomainEvent = JSON.parse(msg.content.toString());

            this.logger.info(
                {
                    event_id: event.event_id,
                    event_type: event.event_type,
                    payload: event.payload,
                },
                'V2 ATS consumer received domain event'
            );

            // Route to appropriate handler
            switch (event.event_type) {
                case 'application.stage_changed':
                    await this.handleStageChanged(event);
                    break;

                case 'ai_review.completed':
                    await this.handleAIReviewCompleted(event);
                    break;

                case 'ai_review.failed':
                    await this.handleAIReviewFailed(event);
                    break;

                case 'candidate.link_requested':
                    await this.handleCandidateLinkRequested(event);
                    break;

                case 'candidate.sourcer_assignment_requested':
                    await this.handleSourcerAssignment(event);
                    break;

                case 'resume.metadata.extracted':
                    await this.handleResumeMetadataExtracted(event);
                    break;

                case 'resume.primary.changed':
                    await this.handleResumePrimaryChanged(event);
                    break;

                default:
                    this.logger.debug({ event_type: event.event_type }, 'Event type not handled');
            }

            // Acknowledge message
            this.channel.ack(msg);
        } catch (error) {
            this.logger.error({ err: error }, 'Error handling domain event');
            // Reject and requeue
            this.channel?.nack(msg, false, true);
        }
    }

    /**
     * Handle application.stage_changed event
     * Sync stage changes from other services (like AI service) to ATS database
     */
    private async handleStageChanged(event: DomainEvent): Promise<void> {
        const {
            application_id,
            old_stage,
            new_stage,
            changed_by,
            ai_review_id,
            fit_score,
        } = event.payload;

        this.logger.info(
            {
                application_id,
                old_stage,
                new_stage,
                changed_by,
                event_id: event.event_id,
            },
            'Syncing application stage change from domain event'
        );

        try {
            // Fetch current application to verify stage hasn't changed
            const currentApplication = await this.applicationRepository.findApplication(
                application_id,
                'internal-service'
            );
            if (!currentApplication) {
                this.logger.warn(
                    { application_id },
                    'Application not found for stage sync'
                );
                return;
            }

            // Only update if stage is different
            if (currentApplication.stage === new_stage) {
                this.logger.info(
                    { application_id, stage: new_stage },
                    'Application stage already at target, skipping update'
                );
                return;
            }

            // Update application stage using repository
            const updated = await this.applicationRepository.updateApplication(
                application_id,
                {
                    stage: new_stage,
                }
            );

            // Create audit log entry to maintain consistency
            await this.applicationRepository.createAuditLog({
                application_id,
                action: 'stage_changed',
                performed_by_user_id: changed_by || 'system',
                performed_by_role: 'system',
                old_value: { stage: old_stage },
                new_value: { stage: new_stage },
                metadata: {
                    source_event: event.event_type,
                    event_id: event.event_id,
                },
            });

            // Note: Placement creation for hired applications is handled by the
            // POST /applications/:id/hire route handler, not by the domain consumer.
            // This avoids duplicate placement records.

            this.logger.info(
                {
                    application_id,
                    old_stage,
                    new_stage,
                    changed_by,
                    event_id: event.event_id,
                },
                'Successfully synced application stage change to ATS database'
            );
        } catch (error: any) {
            this.logger.error(
                {
                    err: error,
                    application_id,
                    old_stage,
                    new_stage,
                    event_id: event.event_id,
                    error_message: error.message,
                },
                'Failed to sync application stage change to ATS database'
            );

            throw error; // Re-throw to trigger nack/requeue
        }
    }

    /**
     * Handle ai_review.completed events
     * Transitions application to 'ai_reviewed' state
     * Candidate must review feedback before submission
     */
    async handleAIReviewCompleted(event: any): Promise<void> {
        try {
            const payload = event.payload;

            this.logger.info(
                {
                    application_id: payload.application_id,
                    ai_review_id: payload.ai_review_id,
                    fit_score: payload.fit_score,
                    recommendation: payload.recommendation
                },
                'Processing ai_review.completed event'
            );

            // Fetch the application to get current state
            const application = await this.applicationRepository.findApplication(payload.application_id, 'internal-service');
            if (!application) {
                this.logger.warn(
                    { application_id: payload.application_id },
                    'Application not found for AI review completion'
                );
                return;
            }

            // CRITICAL FIX: Always move to ai_reviewed, not submitted or screen
            // Candidate must review AI feedback before submission
            const nextStage = 'ai_reviewed';

            this.logger.info(
                {
                    application_id: application.id,
                    next_stage: nextStage,
                    recommendation: payload.recommendation,
                    has_concerns: payload.concerns?.length > 0
                },
                'Moving application to ai_reviewed for candidate review'
            );

            // Only update stage if it's different from current stage
            if (application.stage !== nextStage) {
                // Update the application stage in the database
                const updatedApplication = await this.applicationRepository.updateApplication(application.id, {
                    stage: nextStage,
                    ai_reviewed: true // Mark that AI review has been completed
                });

                this.logger.info(
                    {
                        application_id: updatedApplication.id,
                        previous_stage: application.stage,
                        new_stage: nextStage,
                        ai_review_id: payload.ai_review_id
                    },
                    'Updated application stage after AI review - candidate can now review feedback'
                );

                // Create audit log entry to maintain audit trail
                await this.applicationRepository.createAuditLog({
                    application_id: updatedApplication.id,
                    action: 'ai_review_completed',
                    performed_by_user_id: 'system',
                    performed_by_role: 'system',
                    old_value: { stage: application.stage },
                    new_value: { stage: nextStage },
                    metadata: {
                        ai_review_id: payload.ai_review_id,
                        fit_score: payload.fit_score,
                        recommendation: payload.recommendation,
                        source_event: event.event_id,
                    },
                });

                // Publish application.stage_changed event using the outbox system for durable delivery
                // Use eventPublisher instead of direct channel.publish() to ensure reliability
                if (this.eventPublisher) {
                    await this.eventPublisher.publish('application.stage_changed', {
                        application_id: updatedApplication.id,
                        candidate_id: updatedApplication.candidate_id,
                        job_id: updatedApplication.job_id,
                        recruiter_id: updatedApplication.recruiter_id,
                        old_stage: application.stage,
                        new_stage: nextStage,
                        changed_by: 'system',
                    });
                }

                this.logger.info(
                    {
                        application_id: updatedApplication.id,
                        event: 'application.stage_changed',
                        stage_change: `${application.stage} -> ${nextStage}`
                    },
                    'Published application.stage_changed event via outbox'
                );
            } else {
                this.logger.info(
                    {
                        application_id: application.id,
                        current_stage: application.stage,
                        would_be_stage: nextStage
                    },
                    'Application stage unchanged after AI review'
                );
            }

        } catch (error) {
            this.logger.error(
                {
                    error: (error as Error).message,
                    event: event
                },
                'Failed to process ai_review.completed event'
            );
            throw error; // Rethrow to trigger message requeue
        }
    }

    /**
     * Handle ai_review.failed events
     * Transitions application to 'ai_failed' so candidate can resubmit
     */
    async handleAIReviewFailed(event: any): Promise<void> {
        try {
            const payload = event.payload;

            this.logger.info(
                {
                    application_id: payload.application_id,
                    error: payload.error,
                },
                'Processing ai_review.failed event'
            );

            const application = await this.applicationRepository.findApplication(payload.application_id, 'internal-service');
            if (!application) {
                this.logger.warn(
                    { application_id: payload.application_id },
                    'Application not found for AI review failure'
                );
                return;
            }

            // Only transition if still in a review stage (ai_review or gpt_review)
            if (application.stage !== 'ai_review' && application.stage !== 'gpt_review') {
                this.logger.info(
                    { application_id: application.id, current_stage: application.stage },
                    'Application not in review stage, skipping ai_failed transition'
                );
                return;
            }

            const nextStage = 'ai_failed';

            const updatedApplication = await this.applicationRepository.updateApplication(application.id, {
                stage: nextStage,
            });

            await this.applicationRepository.createAuditLog({
                application_id: updatedApplication.id,
                action: 'ai_review_failed',
                performed_by_user_id: 'system',
                performed_by_role: 'system',
                old_value: { stage: application.stage },
                new_value: { stage: nextStage },
                metadata: {
                    error: payload.error,
                    source_event: event.event_id,
                },
            });

            if (this.eventPublisher) {
                await this.eventPublisher.publish('application.stage_changed', {
                    application_id: updatedApplication.id,
                    candidate_id: updatedApplication.candidate_id,
                    job_id: updatedApplication.job_id,
                    recruiter_id: updatedApplication.recruiter_id,
                    old_stage: application.stage,
                    new_stage: nextStage,
                    changed_by: 'system',
                });
            }

            this.logger.info(
                {
                    application_id: updatedApplication.id,
                    stage_change: `${application.stage} -> ${nextStage}`,
                },
                'Application moved to ai_failed — candidate can resubmit for review'
            );
        } catch (error) {
            this.logger.error(
                {
                    error: (error as Error).message,
                    event: event,
                },
                'Failed to process ai_review.failed event'
            );
            throw error;
        }
    }

    /**
     * Handle candidate.link_requested event
     * Links a Clerk user ID to a candidate profile when they accept invitation
     */
    private async handleCandidateLinkRequested(event: DomainEvent): Promise<void> {
        const { candidate_id, user_id, recruiter_id } = event.payload;

        this.logger.info(
            {
                candidate_id,
                user_id,
                recruiter_id,
                event_id: event.event_id,
            },
            'Linking user to candidate profile'
        );

        try {
            const supabase = this.candidateRepository.getSupabase();

            const { data: user, error: identityError } = await supabase
                .from('users')
                .select('id')
                .eq('clerk_user_id', user_id)
                .single();

            if (identityError || !user) {
                throw identityError || new Error(`User not found for clerk_user_id: ${user_id}`);
            }

            // Update candidate with user_id
            const { error: linkError } = await supabase
                .from('candidates')
                .update({ user_id: user.id })
                .eq('id', candidate_id);

            if (linkError) {
                throw linkError;
            }

            // Ensure user_roles entry exists so resolveAccessContext can find
            // the candidateId. The webhook's ensureCandidateExists may not have
            // run (wrong sourceApp) or may have created a different candidate
            // (email mismatch). This guarantees the invited candidate is linked.
            const { error: roleError } = await supabase
                .from('user_roles')
                .upsert(
                    {
                        user_id: user.id,
                        role_name: 'candidate',
                        role_entity_id: candidate_id,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'user_id,role_name,role_entity_id' }
                );

            if (roleError) {
                // Log but don't fail — the link itself succeeded
                this.logger.warn(
                    {
                        candidate_id,
                        user_id: user.id,
                        error: roleError.message,
                    },
                    'Failed to upsert user_roles for candidate (non-fatal)'
                );
            }

            this.logger.info(
                {
                    candidate_id,
                    user_id,
                    event_id: event.event_id,
                },
                'Successfully linked user to candidate profile'
            );
        } catch (error: any) {
            this.logger.error(
                {
                    err: error,
                    candidate_id,
                    user_id,
                    event_id: event.event_id,
                    error_message: error.message,
                },
                'Failed to link user to candidate profile'
            );

            throw error; // Re-throw to trigger nack/requeue
        }
    }

    /**
     * Handle candidate.sourcer_assignment_requested event
     * Assigns sourcer credit to recruiter for first contact with candidate
     * Includes conflict detection and ownership.conflict_detected event publishing
     */
    private async handleSourcerAssignment(event: DomainEvent): Promise<void> {
        const { candidate_id, recruiter_id, source_method } = event.payload;

        this.logger.info(
            {
                candidate_id,
                recruiter_id,
                source_method,
                event_id: event.event_id,
            },
            'Assigning sourcer credit to recruiter'
        );

        try {
            // Check for existing sourcer
            const existing = await this.candidateSourcerRepository.findByCandidate(candidate_id);

            if (existing) {
                this.logger.warn(
                    {
                        candidate_id,
                        existing_sourcer_id: existing.sourcer_recruiter_id,
                        requested_sourcer_id: recruiter_id,
                        event_id: event.event_id,
                    },
                    'Sourcer already assigned to candidate - conflict detected'
                );

                // Publish ownership.conflict_detected event for admin review
                await this.eventPublisher.publish('ownership.conflict_detected', {
                    candidate_id,
                    existing_sourcer_recruiter_id: existing.sourcer_recruiter_id,
                    requested_sourcer_recruiter_id: recruiter_id,
                    source_method,
                    existing_sourced_at: existing.sourced_at,
                    existing_protection_expires_at: existing.protection_expires_at,
                    conflict_detected_at: new Date().toISOString(),
                });

                // Do not throw - gracefully handle conflict by ignoring request
                return;
            }

            // Calculate protection expiration
            const protectionDays = 365;
            const protectionExpiresAt = new Date(Date.now() + protectionDays * 24 * 60 * 60 * 1000);

            // Create sourcer record
            const sourcer = await this.candidateSourcerRepository.create({
                candidate_id,
                sourcer_recruiter_id: recruiter_id,
                sourcer_type: 'recruiter',
                sourced_at: new Date(),
                protection_window_days: protectionDays,
                protection_expires_at: protectionExpiresAt,
                notes: `Sourced via ${source_method}`,
            });

            // Update legacy candidate.recruiter_id field for backward compatibility
            const { error: legacyError } = await this.candidateRepository.getSupabase()
                .from('candidates')
                .update({ recruiter_id })
                .eq('id', candidate_id);

            if (legacyError) {
                this.logger.warn(
                    {
                        candidate_id,
                        recruiter_id,
                        error: legacyError,
                        event_id: event.event_id,
                    },
                    'Failed to update legacy recruiter_id field'
                );
            }

            this.logger.info(
                {
                    candidate_id,
                    sourcer_id: sourcer.id,
                    recruiter_id,
                    protection_expires_at: protectionExpiresAt,
                    event_id: event.event_id,
                },
                'Successfully assigned sourcer credit to recruiter'
            );

            // Publish candidate.sourced event for notifications
            await this.eventPublisher.publish('candidate.sourced', {
                candidate_id,
                sourcer_user_id: recruiter_id,
                sourcer_type: 'recruiter',
                source_method,
                sourced_at: sourcer.sourced_at,
                protection_expires_at: sourcer.protection_expires_at,
            });
        } catch (error: any) {
            this.logger.error(
                {
                    err: error,
                    candidate_id,
                    recruiter_id,
                    source_method,
                    event_id: event.event_id,
                    error_message: error.message,
                },
                'Failed to assign sourcer credit'
            );

            throw error; // Re-throw to trigger nack/requeue
        }
    }

    /**
     * Handle resume.metadata.extracted event from AI service
     * Routes by entity_type: syncs structured data to the candidate or application
     */
    private async handleResumeMetadataExtracted(event: DomainEvent): Promise<void> {
        const { document_id, entity_type, entity_id, structured_data_available } = event.payload;

        if (!structured_data_available) {
            this.logger.debug({ document_id }, 'Structured data not available, skipping sync');
            return;
        }

        try {
            if (entity_type === 'application') {
                await this.syncResumeDataToApplication(document_id, entity_id);
            } else if (entity_type === 'candidate') {
                await this.syncResumeDataToCandidate(document_id, entity_id);
            } else {
                this.logger.debug({ document_id, entity_type }, 'Unhandled entity type for resume metadata sync');
            }
        } catch (error: any) {
            this.logger.error(
                { err: error, document_id, entity_type, entity_id, error_message: error.message },
                'Failed to sync resume metadata'
            );
            // Don't rethrow - this is a non-critical sync operation
        }
    }

    /**
     * Handle resume.primary.changed event from document service
     * When an existing document is marked as primary, sync its structured_metadata to the candidate
     */
    private async handleResumePrimaryChanged(event: DomainEvent): Promise<void> {
        const { document_id, entity_type, entity_id } = event.payload;

        if (entity_type !== 'candidate') {
            this.logger.debug({ document_id, entity_type }, 'Primary resume change not for candidate, skipping');
            return;
        }

        try {
            await this.syncResumeDataToCandidate(document_id, entity_id);
        } catch (error: any) {
            this.logger.error(
                { err: error, document_id, entity_id, error_message: error.message },
                'Failed to sync resume metadata after primary change'
            );
        }
    }

    /**
     * Sync AI-extracted structured data from a primary resume to candidates.resume_metadata
     */
    private async syncResumeDataToCandidate(documentId: string, candidateId: string): Promise<void> {
        const supabase = this.candidateRepository.getSupabase();

        const { data: doc, error: docError } = await supabase
            .from('documents')
            .select('metadata, structured_metadata')
            .eq('id', documentId)
            .single();

        if (docError || !doc) {
            this.logger.warn({ document_id: documentId }, 'Could not read document for candidate resume sync');
            return;
        }

        if (!doc.metadata?.is_primary_for_candidate) {
            this.logger.debug({ document_id: documentId, candidate_id: candidateId }, 'Document is not primary resume, skipping candidate sync');
            return;
        }

        if (!doc.structured_metadata) {
            this.logger.warn({ document_id: documentId }, 'No structured data on primary resume document');
            return;
        }

        const { data: candidate, error: candidateError } = await supabase
            .from('candidates')
            .select('id')
            .eq('id', candidateId)
            .single();

        if (candidateError || !candidate) {
            this.logger.debug({ document_id: documentId, candidate_id: candidateId }, 'Candidate not found for resume metadata sync');
            return;
        }

        const { error: updateError } = await supabase
            .from('candidates')
            .update({ resume_metadata: doc.structured_metadata })
            .eq('id', candidate.id);

        if (updateError) {
            throw updateError;
        }

        this.logger.info({ candidate_id: candidate.id, document_id: documentId }, 'Synced resume structured data to candidate');
    }

    /**
     * Sync AI-extracted structured data from an application resume to applications.resume_data
     */
    private async syncResumeDataToApplication(documentId: string, applicationId: string): Promise<void> {
        const supabase = this.candidateRepository.getSupabase();

        const { data: doc, error: docError } = await supabase
            .from('documents')
            .select('structured_metadata')
            .eq('id', documentId)
            .single();

        if (docError || !doc?.structured_metadata) {
            this.logger.warn({ document_id: documentId }, 'No structured data on document for application sync');
            return;
        }

        const resumeData = {
            source: 'document_extraction',
            created_at: new Date().toISOString(),
            summary: doc.structured_metadata.professional_summary,
            experience: doc.structured_metadata.experience,
            education: doc.structured_metadata.education,
            skills: doc.structured_metadata.skills,
            certifications: doc.structured_metadata.certifications,
        };

        const { error: updateError } = await supabase
            .from('applications')
            .update({ resume_data: resumeData })
            .eq('id', applicationId);

        if (updateError) {
            throw updateError;
        }

        this.logger.info({ application_id: applicationId, document_id: documentId }, 'Synced resume structured data to application');
    }

    /**
     * Disconnect from RabbitMQ
     */
    async disconnect(): Promise<void> {
        try {
            await this.channel?.close();
            await (this.connection as any)?.close();
            this.logger.info('V2 ATS domain consumer disconnected from RabbitMQ');
        } catch (error) {
            this.logger.error({ err: error }, 'Error disconnecting V2 ATS domain consumer');
        }
    }
}
