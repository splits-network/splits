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

export type MeetingPlatform =
    | 'splits_video'
    | 'google_meet'
    | 'microsoft_teams';

export type RecordingStatus =
    | 'pending'
    | 'recording'
    | 'processing'
    | 'ready'
    | 'failed';

export type RescheduleRequestStatus =
    | 'pending'
    | 'accepted'
    | 'declined';

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
    calendar_event_id: string | null;
    calendar_connection_id: string | null;
    meeting_platform: MeetingPlatform;
    meeting_link: string | null;
    original_scheduled_at: string | null;
    reschedule_count: number;
    reschedule_requested_by: string | null;
    reschedule_requested_at: string | null;
    reschedule_notes: string | null;
    recording_enabled: boolean;
    recording_status: RecordingStatus | null;
    recording_egress_id: string | null;
    recording_blob_url: string | null;
    recording_duration_seconds: number | null;
    recording_file_size_bytes: number | null;
    recording_started_at: string | null;
    recording_ended_at: string | null;
    recording_consent_given_at: string | null;
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
    reschedule_count: number;
    recording_enabled: boolean;
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

export interface UserCalendarPreferences {
    id: string;
    user_id: string;
    connection_id: string | null;
    primary_calendar_id: string | null;
    additional_calendar_ids: string[];
    working_hours_start: string;
    working_hours_end: string;
    working_days: number[];
    timezone: string;
    created_at: string;
    updated_at: string;
}

export interface InterviewRescheduleRequest {
    id: string;
    interview_id: string;
    requested_by: string;
    requested_by_user_id: string | null;
    status: RescheduleRequestStatus;
    proposed_times: Array<{ start: string; end: string }>;
    accepted_time: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateInterviewInput {
    application_id: string;
    interview_type?: InterviewType;
    title?: string;
    scheduled_at: string;
    scheduled_duration_minutes?: number;
    calendar_event_id?: string;
    calendar_connection_id?: string;
    meeting_platform?: MeetingPlatform;
    meeting_link?: string;
    recording_enabled?: boolean;
    participants: Array<{
        user_id: string;
        role: ParticipantRole;
    }>;
}

export interface RecordingConsent {
    id: string;
    interview_id: string;
    participant_id: string;
    consented_at: string;
}
