export type ParticipantDetails = {
    id: string;
    name: string | null;
    email: string;
    profile_image_url?: string | null;
    user_role?: string | null;
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
        created_at: string;
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
    messages: MessageItem[];
};

export type MessageItem = {
    id: string;
    sender_id: string;
    body: string | null;
    created_at: string;
};

export type UserSummary = ParticipantDetails;
