/**
 * Call Recordings V3 Repository
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CallRecordingListParams } from './types';

export class CallRecordingRepository {
  constructor(private supabase: SupabaseClient) {}

  async list(params: CallRecordingListParams) {
    const { page = 1, limit = 25, call_id, recording_status } = params;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('call_recordings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (call_id) query = query.eq('call_id', call_id);
    if (recording_status) query = query.eq('recording_status', recording_status);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('call_recordings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
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

  async getCallParticipants(callId: string) {
    const { data, error } = await this.supabase
      .from('call_participants')
      .select('id, call_id, user_id, role, joined_at, left_at')
      .eq('call_id', callId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async resolveUserId(clerkUserId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return data.id;
  }
}
