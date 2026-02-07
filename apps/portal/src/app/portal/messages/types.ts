"use client";

export type ParticipantDetails = {
    id: string;
    name: string | null;
    email: string;
    profile_image_url?: string | null;
};

export type UserSummary = ParticipantDetails;

export type Message = {
    id: string;
    sender_id: string;
    body: string | null;
    created_at: string;
};

export type ConversationRow = {
    conversation: {
        id: string;
        participant_a_id: string;
        participant_b_id: string;
        application_id: string | null;
        job_id: string | null;
        company_id: string | null;
        last_message_at: string | null;
        last_message_id: string | null;
        created_at: string;
        updated_at: string;
        participant_a: ParticipantDetails;
        participant_b: ParticipantDetails;
    };
    participant: {
        conversation_id: string;
        user_id: string;
        muted_at: string | null;
        archived_at: string | null;
        request_state: "none" | "pending" | "accepted" | "declined";
        last_read_at: string | null;
        last_read_message_id: string | null;
        unread_count: number;
    };
};

export type ResyncData = {
    conversation: {
        id: string;
        participant_a_id: string;
        participant_b_id: string;
        application_id: string | null;
        job_id: string | null;
        company_id: string | null;
        last_message_at: string | null;
        participant_a: ParticipantDetails;
        participant_b: ParticipantDetails;
    };
    participant: {
        user_id: string;
        muted_at: string | null;
        archived_at: string | null;
        request_state: "none" | "pending" | "accepted" | "declined";
        unread_count: number;
    };
    messages: Message[];
};

export type ConversationContext = {
    jobTitle: string | null;
    companyName: string | null;
};

export type Mailbox = "inbox" | "requests" | "archived";

export interface ConversationFilters {
    mailbox: Mailbox;
}

export interface ConversationStatusDisplay {
    label: string;
    badgeClass: string;
    icon: string;
}

export function getRequestStateDisplay(
    row: ConversationRow,
): ConversationStatusDisplay {
    const { request_state } = row.participant;
    const isArchived = !!row.participant.archived_at;
    const isMuted = !!row.participant.muted_at;

    if (isArchived) {
        return {
            label: "Archived",
            badgeClass: "badge-ghost",
            icon: "fa-box-archive",
        };
    }

    switch (request_state) {
        case "pending":
            return {
                label: "Request",
                badgeClass: "badge-warning",
                icon: "fa-hourglass-half",
            };
        case "declined":
            return {
                label: "Declined",
                badgeClass: "badge-error",
                icon: "fa-xmark",
            };
        case "accepted":
            return {
                label: isMuted ? "Muted" : "Active",
                badgeClass: isMuted ? "badge-ghost" : "badge-success",
                icon: isMuted ? "fa-volume-slash" : "fa-check",
            };
        default:
            return {
                label: "Active",
                badgeClass: "badge-success",
                icon: "fa-check",
            };
    }
}

export function getOtherParticipant(
    conversation: ConversationRow["conversation"],
    currentUserId: string | null,
): ParticipantDetails | null {
    if (!currentUserId) return null;
    const otherId =
        conversation.participant_a_id === currentUserId
            ? conversation.participant_b_id
            : conversation.participant_a_id;
    return otherId === conversation.participant_a_id
        ? conversation.participant_a
        : conversation.participant_b;
}

export function getOtherUserId(
    conversation: ConversationRow["conversation"],
    currentUserId: string | null,
): string | null {
    if (!currentUserId) return null;
    return conversation.participant_a_id === currentUserId
        ? conversation.participant_b_id
        : conversation.participant_a_id;
}

export function formatMessageDate(
    dateString: string | Date | null | undefined,
): string {
    if (!dateString) return "No messages yet";
    const date =
        dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleString();
}

export function getInitials(value?: string | null): string {
    if (!value) return "??";
    const parts = value.trim().split(/\s+/);
    if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() ?? "??";
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}
