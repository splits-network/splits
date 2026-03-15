/**
 * V3 LiveKit Egress Webhook Handler
 *
 * Processes LiveKit egress completion/failure webhooks.
 * On success: updates recording status and publishes call.recording_ready event.
 * On failure: marks recording as failed.
 *
 * Uses the V2 CallRecordingService for DB operations (shared logic)
 * and V3 repository for participant lookups.
 */

import { WebhookReceiver, EgressStatus } from 'livekit-server-sdk';
import { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from '../../v2/shared/events';
import { CallRecordingService } from '../../v2/calls/call-recording-service';
import { CallRecordingRepository } from '../call-recordings/repository';

export interface WebhookHandlerConfig {
  callRecordingService: CallRecordingService;
  callRecordingRepository: CallRecordingRepository;
  eventPublisher: IEventPublisher;
  livekitApiKey: string;
  livekitApiSecret: string;
}

export interface WebhookResult {
  received: boolean;
  error?: string;
}

export class LiveKitWebhookHandler {
  private webhookReceiver: WebhookReceiver;
  private logger: Logger;

  constructor(
    private config: WebhookHandlerConfig,
    logger: Logger,
  ) {
    this.logger = logger;
    this.webhookReceiver = new WebhookReceiver(
      config.livekitApiKey,
      config.livekitApiSecret,
    );
  }

  /**
   * Process a raw webhook request body + auth header.
   * Returns { received: true } on success or graceful failure.
   * Never throws — returns 200 to prevent LiveKit retry storms.
   */
  async handleWebhook(
    rawBody: string,
    authHeader: string | undefined,
  ): Promise<WebhookResult> {
    try {
      const event = await this.webhookReceiver.receive(rawBody, authHeader);

      if (!event.egressInfo) {
        return { received: true };
      }

      const { egressInfo } = event;
      const egressId = egressInfo.egressId;

      if (egressInfo.status === EgressStatus.EGRESS_COMPLETE) {
        await this.handleEgressComplete(egressInfo);
      } else if (egressInfo.status === EgressStatus.EGRESS_FAILED) {
        const errorMsg = egressInfo.error || 'Unknown egress failure';
        await this.config.callRecordingService.handleEgressFailed(egressId, errorMsg);

        this.logger.warn(
          { egress_id: egressId, error: errorMsg },
          'Egress failed',
        );
      }

      return { received: true };
    } catch (error: any) {
      this.logger.error(
        { error: error.message },
        'Call recording webhook processing error',
      );
      return { received: true, error: 'Processing failed' };
    }
  }

  /**
   * Handle a completed egress: update DB, publish call.recording_ready.
   */
  private async handleEgressComplete(egressInfo: any): Promise<void> {
    const fileResult = egressInfo.fileResults?.[0];
    const blobUrl = fileResult?.filename || '';
    const durationNs = Number(fileResult?.duration || 0);
    const durationSeconds = Math.round(durationNs / 1_000_000_000);
    const fileSize = Number(fileResult?.size || 0);

    const { callId } = await this.config.callRecordingService.handleEgressComplete(
      egressInfo.egressId,
      blobUrl,
      durationSeconds,
      fileSize,
    );

    const participants = await this.config.callRecordingRepository.getCallParticipants(callId);

    await this.config.eventPublisher.publish('call.recording_ready', {
      call_id: callId,
      recording_url: blobUrl,
      duration_seconds: durationSeconds,
      file_size_bytes: fileSize,
      participants: participants.map((p: any) => ({
        user_id: p.user_id,
        role: p.role,
      })),
    });

    this.logger.info(
      { call_id: callId, duration_seconds: durationSeconds, file_size: fileSize },
      'Egress complete, call.recording_ready published',
    );
  }
}
