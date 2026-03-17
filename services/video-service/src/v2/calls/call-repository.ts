import { SupabaseClient } from '@supabase/supabase-js';

export interface CallRow {
    id: string;
    call_type: string;
    status: string;
    title: string | null;
    livekit_room_name: string | null;
    created_by: string;
    created_at: string;
}

export interface CallRecordingRow {
    id: string;
    call_id: string;
    recording_status: string;
    egress_id: string | null;
    blob_url: string | null;
    duration_seconds: number | null;
    file_size_bytes: number | null;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
}

export interface CallParticipantRow {
    id: string;
    call_id: string;
    user_id: string;
    role: string;
    joined_at: string | null;
    left_at: string | null;
}

export class CallRecordingRepository {
    constructor(private supabase: SupabaseClient) {}

    async findCallById(callId: string): Promise<CallRow | null> {
        const { data, error } = await this.supabase
            .from('calls')
            .select('id, call_type, status, title, livekit_room_name, created_by, created_at')
            .eq('id', callId)
            .maybeSingle();

        if (error) throw error;
        return data as CallRow | null;
    }

    async findRecordingByEgressId(egressId: string): Promise<CallRecordingRow | null> {
        const { data, error } = await this.supabase
            .from('call_recordings')
            .select('*')
            .eq('egress_id', egressId)
            .maybeSingle();

        if (error) throw error;
        return data as CallRecordingRow | null;
    }

    async findActiveRecordingByCallId(callId: string): Promise<CallRecordingRow | null> {
        const { data, error } = await this.supabase
            .from('call_recordings')
            .select('*')
            .eq('call_id', callId)
            .eq('recording_status', 'recording')
            .maybeSingle();

        if (error) throw error;
        return data as CallRecordingRow | null;
    }

    async createRecording(
        callId: string,
        data: { recording_status: string; egress_id?: string; started_at?: string },
    ): Promise<CallRecordingRow> {
        const { data: row, error } = await this.supabase
            .from('call_recordings')
            .insert({ call_id: callId, ...data })
            .select()
            .single();

        if (error) throw error;
        return row as CallRecordingRow;
    }

    async updateRecordingStatus(
        recordingId: string,
        updates: {
            recording_status?: string;
            egress_id?: string;
            blob_url?: string;
            duration_seconds?: number;
            file_size_bytes?: number;
            started_at?: string;
            ended_at?: string;
        },
    ): Promise<CallRecordingRow> {
        const { data, error } = await this.supabase
            .from('call_recordings')
            .update(updates)
            .eq('id', recordingId)
            .select()
            .single();

        if (error) throw error;
        return data as CallRecordingRow;
    }

    async getCallParticipants(callId: string): Promise<CallParticipantRow[]> {
        const { data, error } = await this.supabase
            .from('call_participants')
            .select('id, call_id, user_id, role, joined_at, left_at')
            .eq('call_id', callId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data || []) as CallParticipantRow[];
    }

    async findReadyRecording(callId: string, recordingId?: string): Promise<string> {
        if (recordingId) {
            const { data, error } = await this.supabase
                .from('call_recordings')
                .select('blob_url, recording_status')
                .eq('id', recordingId)
                .eq('call_id', callId)
                .maybeSingle();

            if (error) throw error;
            if (!data || data.recording_status !== 'ready' || !data.blob_url) {
                throw Object.assign(new Error('Recording is not available'), { statusCode: 400 });
            }
            return data.blob_url;
        }

        const { data, error } = await this.supabase
            .from('call_recordings')
            .select('blob_url')
            .eq('call_id', callId)
            .eq('recording_status', 'ready')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        if (!data?.blob_url) {
            throw Object.assign(new Error('No ready recording available'), { statusCode: 400 });
        }
        return data.blob_url;
    }

    async resolveUserId(clerkUserId: string): Promise<string> {
        const { data, error } = await this.supabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        }
        return data.id;
    }
}
