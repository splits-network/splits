// =============================================================================
// Video App Types — client-side types for the join flow
// =============================================================================

export type CallStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';
export type CallParticipantRole = 'host' | 'participant' | 'observer';
export type CallEntityType = 'application' | 'job' | 'company' | 'firm' | 'candidate';

export interface ParticipantUser {
    name: string;
    avatar_url: string | null;
    email: string;
}

export interface CallParticipant {
    id: string;
    user_id: string;
    role: CallParticipantRole;
    user: ParticipantUser;
}

export interface CallEntityLink {
    entity_type: CallEntityType;
    entity_id: string;
}

export interface CallDetail {
    id: string;
    title: string | null;
    call_type: string;
    status: CallStatus;
    scheduled_at: string | null;
    livekit_room_name: string | null;
    agenda: string | null;
    pre_call_notes: string | null;
    created_by: string;
    recording_consent_required?: boolean;
    participants: CallParticipant[];
    entity_links: CallEntityLink[];
}

/** Enriched entity data fetched separately for the context panel */
export interface EntityData {
    entity_type: CallEntityType;
    entity_id: string;
    name: string;
    subtitle: string | null;
    logo_url: string | null;
    details: Record<string, string | null>;
}

/** Compact call history entry */
export interface CallHistoryEntry {
    id: string;
    title: string | null;
    call_type: string;
    status: CallStatus;
    scheduled_at: string | null;
    started_at: string | null;
    duration_minutes: number | null;
}

/** Chat message for the in-call chat */
export interface ChatMessage {
    id: string;
    sender_name: string;
    sender_id: string;
    body: string;
    created_at: string;
}

/** Response from the token exchange endpoint */
export interface ExchangeResult {
    livekit_token: string;
    call: CallDetail;
}

/** Join flow states */
export type JoinState = 'loading' | 'confirming' | 'joining' | 'error';

/** Typed error for join flow failures */
export interface JoinError {
    type: 'invalid' | 'expired' | 'not-started' | 'unknown';
    message: string;
}
