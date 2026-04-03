/**
 * Stop Recording Action Service
 *
 * Stops an active LiveKit egress for a recording.
 * Host-only — verifies the requesting user is the call host.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { EgressClient } from 'livekit-server-sdk';
import { BadRequestError, ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events.js';

export class StopRecordingService {
  private egressClient: EgressClient;

  constructor(
    private supabase: SupabaseClient,
    livekitApiKey: string,
    livekitApiSecret: string,
    livekitWsUrl: string,
    private eventPublisher?: IEventPublisher,
  ) {
    this.egressClient = new EgressClient(livekitWsUrl, livekitApiKey, livekitApiSecret);
  }

  async stop(recordingId: string, clerkUserId: string) {
    // Resolve user
    const userId = await this.resolveUserId(clerkUserId);

    // Find the recording
    const { data: recording, error } = await this.supabase
      .from('call_recordings')
      .select('id, call_id, recording_status, egress_id')
      .eq('id', recordingId)
      .maybeSingle();

    if (error) throw error;
    if (!recording) throw new NotFoundError('CallRecording', recordingId);

    // Verify host
    await this.verifyHost(recording.call_id, userId);

    if (recording.recording_status !== 'recording') {
      throw new BadRequestError('Recording is not currently active');
    }

    if (!recording.egress_id) {
      throw new BadRequestError('No active egress found for this recording');
    }

    // Stop the egress
    await this.egressClient.stopEgress(recording.egress_id);

    // Update status
    await this.supabase
      .from('call_recordings')
      .update({
        recording_status: 'processing',
        ended_at: new Date().toISOString(),
      })
      .eq('id', recordingId);

    await this.eventPublisher?.publish('call_recording.stopped', {
      recording_id: recordingId,
      call_id: recording.call_id,
      stopped_by: userId,
    }, 'video-service');

    return { recording_status: 'processing' };
  }

  private async resolveUserId(clerkUserId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundError('User');
    return data.id;
  }

  private async verifyHost(callId: string, userId: string): Promise<void> {
    const { data: participants, error } = await this.supabase
      .from('call_participants')
      .select('user_id, role')
      .eq('call_id', callId);

    if (error) throw error;
    const isHost = (participants || []).some(
      (p: any) => p.user_id === userId && p.role === 'host',
    );
    if (!isHost) {
      throw new ForbiddenError('Only the host can control recording');
    }
  }
}
