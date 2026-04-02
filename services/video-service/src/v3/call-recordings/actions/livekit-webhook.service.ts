/**
 * LiveKit Webhook Action Service
 *
 * Processes LiveKit egress completion/failure webhooks.
 * On success: updates recording status + publishes call.recording_ready event.
 * On failure: marks recording as failed.
 *
 * No auth — signature verified via LiveKit WebhookReceiver.
 * Never throws to the route — returns { received: true } to prevent retry storms.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { WebhookReceiver, EgressStatus } from 'livekit-server-sdk';
import { IEventPublisher } from '../../../v2/shared/events.js';

export interface WebhookResult {
  received: boolean;
  error?: string;
}

export class LivekitWebhookService {
  private webhookReceiver: WebhookReceiver;

  constructor(
    private supabase: SupabaseClient,
    livekitApiKey: string,
    livekitApiSecret: string,
    private eventPublisher?: IEventPublisher,
  ) {
    this.webhookReceiver = new WebhookReceiver(livekitApiKey, livekitApiSecret);
  }

  async handleWebhook(rawBody: string, authHeader: string | undefined): Promise<WebhookResult> {
    try {
      const event = await this.webhookReceiver.receive(rawBody, authHeader);

      if (!event.egressInfo) {
        return { received: true };
      }

      const { egressInfo } = event;

      if (egressInfo.status === EgressStatus.EGRESS_COMPLETE) {
        await this.handleEgressComplete(egressInfo);
      } else if (egressInfo.status === EgressStatus.EGRESS_FAILED) {
        await this.handleEgressFailed(egressInfo.egressId, egressInfo.error || 'Unknown egress failure');
      }

      return { received: true };
    } catch (error: any) {
      // Always return success to prevent LiveKit retry storms
      return { received: true, error: 'Processing failed' };
    }
  }

  private async handleEgressComplete(egressInfo: any): Promise<void> {
    const fileResult = egressInfo.fileResults?.[0];
    const blobUrl = fileResult?.filename || '';
    const durationNs = Number(fileResult?.duration || 0);
    const durationSeconds = Math.round(durationNs / 1_000_000_000);
    const fileSize = Number(fileResult?.size || 0);

    // Find the recording by egress ID
    const { data: recording, error: findError } = await this.supabase
      .from('call_recordings')
      .select('id, call_id')
      .eq('egress_id', egressInfo.egressId)
      .maybeSingle();

    if (findError || !recording) return;

    // Update recording status
    await this.supabase
      .from('call_recordings')
      .update({
        recording_status: 'ready',
        blob_url: blobUrl,
        duration_seconds: durationSeconds,
        file_size_bytes: fileSize,
      })
      .eq('id', recording.id);

    // Get participants for the event
    const { data: participants } = await this.supabase
      .from('call_participants')
      .select('user_id, role')
      .eq('call_id', recording.call_id);

    await this.eventPublisher?.publish('call.recording_ready', {
      call_id: recording.call_id,
      recording_id: recording.id,
      recording_url: blobUrl,
      duration_seconds: durationSeconds,
      file_size_bytes: fileSize,
      participants: (participants || []).map((p: any) => ({
        user_id: p.user_id,
        role: p.role,
      })),
    }, 'video-service');
  }

  private async handleEgressFailed(egressId: string, _errorMsg: string): Promise<void> {
    const { data: recording } = await this.supabase
      .from('call_recordings')
      .select('id, call_id')
      .eq('egress_id', egressId)
      .maybeSingle();

    if (!recording) return;

    await this.supabase
      .from('call_recordings')
      .update({ recording_status: 'failed' })
      .eq('id', recording.id);

    await this.eventPublisher?.publish('call_recording.failed', {
      recording_id: recording.id,
      call_id: recording.call_id,
    }, 'video-service');
  }
}
