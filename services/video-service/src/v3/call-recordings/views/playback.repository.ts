/**
 * Playback View Repository
 *
 * Queries for recording blob_url and call participant verification.
 * Returns null on not-found — service layer decides.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class PlaybackRepository {
  constructor(private supabase: SupabaseClient) {}

  async findReadyRecording(id: string): Promise<{ blob_url: string; call_id: string } | null> {
    const { data, error } = await this.supabase
      .from('call_recordings')
      .select('id, call_id, blob_url, recording_status')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data || data.recording_status !== 'ready' || !data.blob_url) return null;
    return { blob_url: data.blob_url, call_id: data.call_id };
  }

  async getCallParticipantUserIds(callId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('call_participants')
      .select('user_id')
      .eq('call_id', callId);

    if (error) throw error;
    return (data || []).map((p: any) => p.user_id);
  }

  async resolveUserId(clerkUserId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (error) throw error;
    return data?.id || null;
  }
}
