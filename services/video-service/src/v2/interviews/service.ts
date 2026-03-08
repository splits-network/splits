import crypto from 'crypto';
import { InterviewRepository } from './repository';
import { IEventPublisher } from '../shared/events';
import {
    CreateInterviewInput,
    Interview,
    InterviewWithParticipants,
} from './types';

export class InterviewService {
    constructor(
        private repository: InterviewRepository,
        private eventPublisher: IEventPublisher,
    ) {}

    async createInterview(
        input: CreateInterviewInput,
        createdByUserId: string,
    ): Promise<InterviewWithParticipants> {
        // Validate application exists
        const { data: application, error: appError } = await this.repository
            .getSupabase()
            .from('applications')
            .select('id')
            .eq('id', input.application_id)
            .maybeSingle();

        if (appError) {
            throw appError;
        }
        if (!application) {
            throw Object.assign(new Error('Application not found'), { statusCode: 404 });
        }

        // Validate scheduled_at is in the future
        const scheduledAt = new Date(input.scheduled_at);
        if (scheduledAt <= new Date()) {
            throw Object.assign(
                new Error('Scheduled time must be in the future'),
                { statusCode: 400 },
            );
        }

        // Validate participants
        if (!input.participants || input.participants.length === 0) {
            throw Object.assign(
                new Error('At least one participant is required'),
                { statusCode: 400 },
            );
        }

        // Generate a unique room name only for splits_video platform
        const meetingPlatform = input.meeting_platform ?? 'splits_video';
        const roomName = meetingPlatform === 'splits_video'
            ? `interview-${crypto.randomUUID()}`
            : null;

        // Create interview record
        const interview = await this.repository.createInterview({
            application_id: input.application_id,
            room_name: roomName,
            status: 'scheduled',
            interview_type: input.interview_type ?? 'screening',
            title: input.title ?? null,
            round_name: input.round_name ?? null,
            scheduled_at: input.scheduled_at,
            scheduled_duration_minutes: input.scheduled_duration_minutes ?? 60,
            max_duration_seconds: 14400, // 4 hours
            grace_period_seconds: 300, // 5 minutes
            recording_enabled: input.recording_enabled ?? false,
            metadata: null,
            created_by: createdByUserId,
            calendar_event_id: input.calendar_event_id ?? null,
            calendar_connection_id: input.calendar_connection_id ?? null,
            meeting_platform: meetingPlatform,
            meeting_link: input.meeting_link ?? null,
        });

        // Add participants
        const participants = await this.repository.addParticipants(
            interview.id,
            input.participants,
        );

        // Generate access tokens for each participant
        for (const participant of participants) {
            const token = crypto.randomBytes(32).toString('base64url');
            await this.repository.createAccessToken(
                interview.id,
                participant.id,
                token,
            );
        }

        // Publish event
        await this.eventPublisher.publish('interview.created', {
            interview_id: interview.id,
            application_id: interview.application_id,
            room_name: interview.room_name,
            scheduled_at: interview.scheduled_at,
            created_by: createdByUserId,
            participant_count: participants.length,
        });

        return {
            ...interview,
            participants,
        };
    }

    async getInterview(id: string): Promise<InterviewWithParticipants> {
        const interview = await this.repository.findByIdWithParticipants(id);
        if (!interview) {
            throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
        }
        return interview;
    }

    async listByApplication(
        applicationId: string,
        options?: { status?: string; limit?: number; offset?: number },
    ): Promise<{ data: Interview[]; total: number }> {
        return this.repository.findByApplicationId(applicationId, {
            status: options?.status as any,
            limit: options?.limit,
            offset: options?.offset,
        });
    }

    async cancelInterview(
        id: string,
        reason?: string,
        cancelledByUserId?: string,
    ): Promise<Interview> {
        const interview = await this.repository.findById(id);
        if (!interview) {
            throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
        }

        // Only scheduled or in_progress interviews can be cancelled
        if (interview.status !== 'scheduled' && interview.status !== 'in_progress') {
            throw Object.assign(
                new Error(`Cannot cancel interview with status '${interview.status}'`),
                { statusCode: 400 },
            );
        }

        const updated = await this.repository.updateStatus(id, 'cancelled', {
            cancellation_reason: reason ?? null,
        });

        await this.eventPublisher.publish('interview.cancelled', {
            interview_id: id,
            application_id: interview.application_id,
            cancelled_by: cancelledByUserId ?? null,
            reason: reason ?? null,
            previous_status: interview.status,
        });

        return updated;
    }
}
