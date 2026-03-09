export type CallState = 'prep' | 'lobby' | 'connecting' | 'in-call' | 'post-call';

export interface CallContext {
    id: string;
    status: string;
    interview_type: string;
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
    participants: Array<{
        id: string;
        role: string;
        name: string;
        avatar_url: string | null;
    }>;
}

export interface TokenResult {
    jwt: string;
    room_name: string;
    call: CallContext;
    participant: {
        id: string;
        role: string;
    };
}

export interface LocalUserChoices {
    audioEnabled: boolean;
    videoEnabled: boolean;
    audioDeviceId?: string;
    videoDeviceId?: string;
}
