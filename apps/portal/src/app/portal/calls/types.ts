/**
 * Call list types — mirrors call-service v2 API response types.
 */

export type CallStatus = "scheduled" | "active" | "completed" | "cancelled" | "missed" | "no_show";
export type CallEntityType = "application" | "job" | "company" | "firm" | "candidate";
export type CallParticipantRole = "host" | "participant" | "observer";

export interface CallParticipantUser {
    name: string;
    avatar_url: string | null;
    email: string;
}

export interface CallParticipantItem {
    id: string;
    call_id: string;
    user_id: string;
    role: CallParticipantRole;
    joined_at: string | null;
    left_at: string | null;
    user: CallParticipantUser;
}

export interface CallEntityLink {
    id: string;
    call_id: string;
    entity_type: CallEntityType;
    entity_id: string;
}

export interface CallTagLink {
    id: string;
    call_id: string;
    tag_slug: string;
}

export interface CallListItem {
    id: string;
    call_type: string;
    status: CallStatus;
    title: string | null;
    scheduled_at: string | null;
    started_at: string | null;
    ended_at: string | null;
    duration_minutes: number | null;
    created_by: string;
    agenda: string | null;
    needs_follow_up: boolean;
    recording_enabled: boolean;
    transcription_enabled: boolean;
    ai_analysis_enabled: boolean;
    created_at: string;
    updated_at: string;
    participants: CallParticipantItem[];
    entity_links: CallEntityLink[];
    tags?: CallTagLink[];
}

export interface CallFilters {
    call_type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    entity_type?: string;
    entity_id?: string;
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

export interface CallTag {
    slug: string;
    label: string;
}

// ── Label Maps ──

export const CALL_TYPE_LABELS: Record<string, string> = {
    recruiter_company: "Recruiter-Company",
    interview: "Interview",
    screen: "Screen",
    debrief: "Debrief",
    check_in: "Check-in",
    general: "General",
};

export const CALL_STATUS_LABELS: Record<string, string> = {
    scheduled: "Scheduled",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    missed: "Missed",
    no_show: "No Show",
};

export function formatCallType(type: string): string {
    return CALL_TYPE_LABELS[type] || type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatCallStatus(status: string): string {
    return CALL_STATUS_LABELS[status] || status;
}

export function statusBadgeColor(status: string): "primary" | "success" | "warning" | "error" | "neutral" {
    switch (status) {
        case "scheduled":
            return "primary";
        case "active":
            return "success";
        case "completed":
            return "neutral";
        case "cancelled":
            return "warning";
        case "missed":
        case "no_show":
            return "error";
        default:
            return "neutral";
    }
}

export function formatDuration(minutes: number | null): string {
    if (minutes === null || minutes === undefined) return "--";
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatScheduledDate(dateStr: string | null): string {
    if (!dateStr) return "--";
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    if (isToday) return `Today, ${time}`;
    if (isTomorrow) return `Tomorrow, ${time}`;

    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function participantNames(participants: CallParticipantItem[]): string {
    return participants
        .map((p) => p.user.name)
        .join(", ");
}
