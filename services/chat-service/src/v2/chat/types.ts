export interface ChatContext {
    application_id?: string | null;
    job_id?: string | null;
    company_id?: string | null;
}

export interface ChatConversation {
    id: string;
    participant_a_id: string;
    participant_b_id: string;
    application_id?: string | null;
    job_id?: string | null;
    company_id?: string | null;
    created_at: string;
    updated_at: string;
    last_message_at?: string | null;
    last_message_id?: string | null;
}

export interface ChatParticipantState {
    conversation_id: string;
    user_id: string;
    muted_at?: string | null;
    archived_at?: string | null;
    request_state: 'none' | 'pending' | 'accepted' | 'declined';
    last_read_at?: string | null;
    last_read_message_id?: string | null;
    unread_count: number;
}

export interface ChatMessage {
    id: string;
    conversation_id: string;
    sender_id: string;
    kind: 'user' | 'system';
    body?: string | null;
    metadata?: Record<string, any> | null;
    client_message_id?: string | null;
    edited_at?: string | null;
    redacted_at?: string | null;
    redaction_reason?: string | null;
    created_at: string;
}

export interface ChatAttachment {
    id: string;
    conversation_id: string;
    message_id?: string | null;
    uploader_id: string;
    file_name: string;
    content_type: string;
    size_bytes: number;
    storage_key: string;
    status: 'pending_upload' | 'pending_scan' | 'available' | 'blocked' | 'deleted';
    scan_result?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ChatReport {
    id: string;
    reporter_user_id: string;
    reported_user_id: string;
    conversation_id: string;
    category: string;
    description?: string | null;
    evidence_pointer?: string | null;
    status: 'new' | 'in_review' | 'resolved' | 'dismissed';
    created_at: string;
    updated_at: string;
}

export interface ChatModerationAudit {
    id: string;
    actor_user_id: string;
    target_user_id: string;
    action: 'warn' | 'mute_user' | 'suspend_messaging' | 'ban_user';
    details?: Record<string, any> | null;
    created_at: string;
}

export interface ChatConversationListItem {
    conversation: ChatConversation;
    participant: ChatParticipantState;
}

export interface CreateConversationInput {
    participantUserId: string;
    context?: ChatContext;
}

export interface SendMessageInput {
    clientMessageId?: string | null;
    body?: string | null;
    attachments?: string[];
}

export interface MessageQueryParams {
    after?: string;
    limit?: number;
}

// NEW: Participant details from users table
export interface ParticipantDetails {
    id: string;
    name: string | null;
    email: string;
    profile_image_url?: string | null;
}

// NEW: Conversation with participant names included (prevents unauthorized user lookups)
export interface ChatConversationWithParticipants {
    id: string;
    participant_a_id: string;
    participant_b_id: string;
    application_id?: string | null;
    job_id?: string | null;
    company_id?: string | null;
    created_at: string;
    updated_at: string;
    last_message_at?: string | null;
    last_message_id?: string | null;
    participant_a: ParticipantDetails;
    participant_b: ParticipantDetails;
}

// NEW: List item with enriched participant data
export interface ChatConversationListItemWithParticipants {
    conversation: ChatConversationWithParticipants;
    participant: ChatParticipantState;
}

// NEW: Resync response with enriched participant data
export interface ResyncResponseWithParticipants {
    conversation: ChatConversationWithParticipants;
    participant: ChatParticipantState;
    messages: ChatMessage[];
}
