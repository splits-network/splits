/**
 * Integration & OAuth Connection Types
 * Shared types for the integration-service and frontend
 */

/* ─── Provider Catalog ───────────────────────────────────────────────────── */

export type IntegrationCategory = 'calendar' | 'email' | 'ats' | 'linkedin';

export interface IntegrationProvider {
    id: string;
    slug: string;
    name: string;
    category: IntegrationCategory;
    icon: string | null;
    description: string | null;
    oauth_auth_url: string | null;
    oauth_token_url: string | null;
    oauth_scopes: string[];
    is_active: boolean;
    sort_order: number;
}

/* ─── OAuth Connections ──────────────────────────────────────────────────── */

export type OAuthConnectionStatus = 'pending' | 'active' | 'expired' | 'revoked' | 'error';

export interface OAuthConnection {
    id: string;
    clerk_user_id: string;
    organization_id: string | null;
    provider_id: string;
    provider_slug: string;
    status: OAuthConnectionStatus;
    access_token_enc: string | null;
    refresh_token_enc: string | null;
    token_expires_at: string | null;
    scopes_granted: string[] | null;
    provider_account_id: string | null;
    provider_account_name: string | null;
    metadata: Record<string, any>;
    last_synced_at: string | null;
    last_error: string | null;
    error_at: string | null;
    created_at: string;
    updated_at: string;
}

/** What the frontend receives — no tokens exposed */
export type OAuthConnectionPublic = Omit<
    OAuthConnection,
    'clerk_user_id' | 'access_token_enc' | 'refresh_token_enc' | 'token_expires_at'
>;

/* ─── API Request / Response ─────────────────────────────────────────────── */

export interface InitiateOAuthRequest {
    provider_slug: string;
    redirect_uri: string;
    organization_id?: string;
}

export interface InitiateOAuthResponse {
    authorization_url: string;
    state: string;
}

export interface OAuthCallbackRequest {
    code: string;
    state: string;
}

export interface OAuthCallbackResponse {
    connection: OAuthConnectionPublic;
}

export interface DisconnectRequest {
    connection_id: string;
}

/* ─── Calendar Types ────────────────────────────────────────────────────── */

export interface CalendarInfo {
    id: string;
    summary: string;
    description?: string;
    timeZone?: string;
    primary?: boolean;
    accessRole: string;
}

export interface CalendarEvent {
    id: string;
    summary?: string;
    description?: string;
    location?: string;
    start: { dateTime?: string; date?: string; timeZone?: string };
    end: { dateTime?: string; date?: string; timeZone?: string };
    status: string;
    htmlLink?: string;
    attendees?: Array<{
        email: string;
        displayName?: string;
        responseStatus: string;
    }>;
    conferenceData?: {
        entryPoints?: Array<{ entryPointType: string; uri: string; label?: string }>;
    };
}

export interface CalendarBusySlot {
    start: string;
    end: string;
}

export interface CreateCalendarEventRequest {
    calendar_id: string;
    summary: string;
    description?: string;
    location?: string;
    start_date_time: string;
    end_date_time: string;
    time_zone: string;
    attendee_emails?: string[];
    add_video_conference?: boolean;
    /** @deprecated Use add_video_conference instead */
    add_google_meet?: boolean;
}

/* ─── Email Types ──────────────────────────────────────────────────────── */

export interface EmailMessage {
    id: string;
    threadId: string;
    subject?: string;
    snippet: string;
    from?: { name?: string; email: string };
    to: Array<{ name?: string; email: string }>;
    cc?: Array<{ name?: string; email: string }>;
    date: string;
    isRead: boolean;
    hasAttachments: boolean;
    bodyText?: string;
    bodyHtml?: string;
    webLink?: string;
}

export interface EmailThread {
    id: string;
    messages: EmailMessage[];
}

export interface SendEmailRequest {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    body_type?: 'text' | 'html';
    in_reply_to?: string;
    thread_id?: string;
}

export interface EmailListResponse {
    messages: Array<{ id: string; threadId: string }>;
    next_page_token?: string;
}

/* ─── LinkedIn Types ───────────────────────────────────────────────────── */

export interface LinkedInProfilePublic {
    sub: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
    email_verified?: boolean;
    picture?: string;
}

export interface LinkedInVerificationStatus {
    verified: boolean;
    profile: LinkedInProfilePublic | null;
    connected_at: string;
    last_synced_at: string | null;
}

/* ─── Events ─────────────────────────────────────────────────────────────── */

export type IntegrationEventType =
    | 'integration.connected'
    | 'integration.disconnected'
    | 'integration.token_refreshed'
    | 'integration.token_expired'
    | 'integration.sync_completed'
    | 'integration.sync_failed'
    | 'integration.calendar_event_created'
    | 'integration.interview_scheduled'
    | 'integration.email_sent'
    | 'integration.email_synced'
    | 'integration.linkedin_connected'
    | 'integration.linkedin_profile_verified';

export interface IntegrationEvent {
    type: IntegrationEventType;
    connection_id: string;
    provider_slug: string;
    clerk_user_id: string;
    organization_id?: string;
    timestamp: string;
    metadata?: Record<string, any>;
}
