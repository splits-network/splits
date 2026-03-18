/**
 * Call Calendar V3 Repository
 * Tracks calendar events created for video calls
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface CallCalendarEvent {
  id: string;
  call_id: string;
  user_id: string;
  connection_id: string;
  calendar_id: string;
  provider_event_id: string;
  created_at: string;
}

export class CallCalendarRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(params: {
    call_id: string;
    user_id: string;
    connection_id: string;
    calendar_id: string;
    provider_event_id: string;
  }): Promise<CallCalendarEvent> {
    const { data, error } = await this.supabase
      .from('call_calendar_events')
      .insert(params)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findByCallId(callId: string): Promise<CallCalendarEvent[]> {
    const { data, error } = await this.supabase
      .from('call_calendar_events')
      .select('*')
      .eq('call_id', callId);

    if (error) throw error;
    return data ?? [];
  }

  async deleteByCallId(callId: string): Promise<void> {
    const { error } = await this.supabase
      .from('call_calendar_events')
      .delete()
      .eq('call_id', callId);

    if (error) throw error;
  }
}
