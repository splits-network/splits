// =============================================================================
// Video App Types — client-side types for the join flow
// =============================================================================

export type CallStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';
export type CallParticipantRole = 'host' | 'participant' | 'observer';
export type CallEntityType = 'application' | 'job' | 'company' | 'firm' | 'candidate';

export interface ParticipantUser {
    first_name: string;
    last_name: string;
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
    participants: CallParticipant[];
    entity_links: CallEntityLink[];
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
