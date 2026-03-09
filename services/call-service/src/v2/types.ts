// =============================================================================
// Call Domain Types — mirrors migration 20260312000001_create_call_tables.sql
// =============================================================================

// Enums
export type CallStatus = 'scheduled' | 'active' | 'completed' | 'cancelled' | 'missed' | 'no_show';
export type CallEntityType = 'application' | 'job' | 'company' | 'firm' | 'candidate';
export type CallParticipantRole = 'host' | 'participant' | 'observer';
export type RecordingStatus = 'pending' | 'recording' | 'processing' | 'ready' | 'failed';
export type TranscriptStatus = 'pending' | 'processing' | 'ready' | 'failed';
export type SummaryStatus = 'pending' | 'processing' | 'ready' | 'failed';

// =============================================================================
// Table Interfaces
// =============================================================================

/** Lookup table: call_types */
export interface CallType {
    slug: string;
    label: string;
    default_duration_minutes: number;
    requires_recording_consent: boolean;
    supports_ai_summary: boolean;
    created_at: string;
}

/** Core table: calls */
export interface Call {
    id: string;
    call_type: string;
    status: CallStatus;
    title: string | null;
    livekit_room_name: string | null;
    scheduled_at: string | null;
    started_at: string | null;
    ended_at: string | null;
    duration_minutes: number | null;
    created_by: string;
    agenda: string | null;
    duration_minutes_planned: number | null;
    pre_call_notes: string | null;
    needs_follow_up: boolean;
    cancelled_by: string | null;
    cancel_reason: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

/** Junction table: call_entity_links */
export interface CallEntityLink {
    id: string;
    call_id: string;
    entity_type: CallEntityType;
    entity_id: string;
    created_at: string;
}

/** Table: call_participants */
export interface CallParticipant {
    id: string;
    call_id: string;
    user_id: string;
    role: CallParticipantRole;
    joined_at: string | null;
    left_at: string | null;
    consent_given: boolean;
    consent_at: string | null;
    created_at: string;
}

/** Table: call_access_tokens */
export interface CallAccessToken {
    id: string;
    call_id: string;
    user_id: string;
    token: string;
    expires_at: string;
    used_at: string | null;
    created_at: string;
}

/** Table: call_recordings */
export interface CallRecording {
    id: string;
    call_id: string;
    recording_status: RecordingStatus;
    egress_id: string | null;
    blob_url: string | null;
    duration_seconds: number | null;
    file_size_bytes: number | null;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
}

/** Table: call_transcripts */
export interface CallTranscript {
    id: string;
    call_id: string;
    storage_url: string;
    transcript_status: TranscriptStatus;
    error: string | null;
    language: string;
    created_at: string;
    updated_at: string;
}

/** Table: call_summaries */
export interface CallSummary {
    id: string;
    call_id: string;
    summary: Record<string, unknown>;
    summary_status: SummaryStatus;
    error: string | null;
    model: string | null;
    created_at: string;
    updated_at: string;
}

/** Table: call_notes */
export interface CallNote {
    id: string;
    call_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
}

/** Lookup table: call_tags */
export interface CallTag {
    slug: string;
    label: string;
    created_at: string;
}

/** Junction table: call_tag_links */
export interface CallTagLink {
    id: string;
    call_id: string;
    tag_slug: string;
    created_at: string;
}

// =============================================================================
// Composite / API Response Types
// =============================================================================

export interface CallParticipantWithUser extends CallParticipant {
    user: {
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        email: string;
    };
}

export interface CallNoteWithUser extends CallNote {
    user: {
        first_name: string;
        last_name: string;
    };
}

export interface CallWithParticipants extends Call {
    participants: CallParticipantWithUser[];
    entity_links: CallEntityLink[];
    tags?: CallTagLink[];
}

export interface CallDetail extends CallWithParticipants {
    recordings?: CallRecording[];
    transcript?: CallTranscript | null;
    summary?: CallSummary | null;
    notes?: CallNoteWithUser[];
    tags?: CallTagLink[];
}

// =============================================================================
// Input Types
// =============================================================================

export interface CreateCallInput {
    call_type: string;
    title?: string;
    scheduled_at?: string;
    agenda?: string;
    duration_minutes_planned?: number;
    pre_call_notes?: string;
    tags?: string[];
    entity_links: { entity_type: CallEntityType; entity_id: string }[];
    participants: { user_id: string; role: CallParticipantRole }[];
}

export interface UpdateCallInput {
    title?: string;
    scheduled_at?: string;
    agenda?: string;
    needs_follow_up?: boolean;
}

export interface CallListFilters {
    call_type?: string;
    entity_type?: CallEntityType;
    entity_id?: string;
    status?: CallStatus;
    date_from?: string;
    date_to?: string;
    tag?: string;
    needs_follow_up?: boolean;
    search?: string;
}

export interface CallStats {
    upcoming_count: number;
    this_week_count: number;
    this_month_count: number;
    avg_duration_minutes: number;
    needs_follow_up_count: number;
}
