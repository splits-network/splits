"use client";

export type ParticipantDetails = {
    id: string;
    name: string | null;
    email: string;
    profile_image_url?: string | null;
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

export type UserSummary = ParticipantDetails;
