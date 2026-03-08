export type InterviewStatus =
    | 'scheduled'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'expired';

export type InterviewType =
    | 'screening'
    | 'technical'
    | 'cultural'
    | 'final'
    | 'panel'
    | 'debrief';

export type ParticipantRole =
    | 'interviewer'
    | 'candidate'
    | 'observer';

export interface Interview {
    id: string;
    application_id: string;
    room_name: string;
    status: InterviewStatus;
    interview_type: InterviewType;
    title: string | null;
    scheduled_at: string;
    scheduled_duration_minutes: number;
    actual_start_at: string | null;
    actual_end_at: string | null;
    cancellation_reason: string | null;
    max_duration_seconds: number;
    grace_period_seconds: number;
    metadata: Record<string, any> | null;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface InterviewParticipant {
    id: string;
    interview_id: string;
    user_id: string;
    role: ParticipantRole;
    joined_at: string | null;
    left_at: string | null;
    created_at: string;
}

export interface InterviewAccessToken {
    id: string;
    interview_id: string;
    participant_id: string;
    token: string;
    created_at: string;
}

export interface InterviewWithParticipants extends Interview {
    participants: InterviewParticipant[];
}

export interface InterviewParticipantWithUser extends InterviewParticipant {
    name: string;
    avatar_url: string | null;
}

export interface InterviewContext {
    id: string;
    status: InterviewStatus;
    interview_type: InterviewType;
    title: string | null;
    scheduled_at: string;
    scheduled_duration_minutes: number;
    job: {
        id: string;
        title: string;
        company_name: string;
    };
    participants: InterviewParticipantWithUser[];
}

export interface InterviewWithContext extends Interview {
    job: {
        id: string;
        title: string;
        company_name: string;
    };
    participants: InterviewParticipantWithUser[];
}

export interface CreateInterviewInput {
    application_id: string;
    interview_type?: InterviewType;
    title?: string;
    scheduled_at: string;
    scheduled_duration_minutes?: number;
    participants: Array<{
        user_id: string;
        role: ParticipantRole;
    }>;
}
