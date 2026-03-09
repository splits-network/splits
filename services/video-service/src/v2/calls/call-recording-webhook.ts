import { FastifyInstance } from 'fastify';
import { WebhookReceiver, EgressStatus } from 'livekit-server-sdk';
import { CallRecordingService } from './call-recording-service';
import { IEventPublisher } from '../shared/events';

interface CallRecordingWebhookConfig {
    callRecordingService: CallRecordingService;
    eventPublisher: IEventPublisher;
    livekitApiKey: string;
    livekitApiSecret: string;
}

export async function registerCallRecordingWebhook(
    app: FastifyInstance,
    config: CallRecordingWebhookConfig,
) {
    const { callRecordingService, eventPublisher, livekitApiKey, livekitApiSecret } = config;
    const webhookReceiver = new WebhookReceiver(livekitApiKey, livekitApiSecret);

    // POST /api/v2/calls/recording/webhook - LiveKit Egress webhook (NO AUTH -- signature verified)
    app.post('/api/v2/calls/recording/webhook', async (request, reply) => {
        try {
            const body = typeof request.body === 'string'
                ? request.body
                : JSON.stringify(request.body);
            const authHeader = request.headers['authorization'] as string | undefined;

            const event = await webhookReceiver.receive(body, authHeader);

            if (!event.egressInfo) {
                return reply.send({ received: true });
            }

            const { egressInfo } = event;
            const egressId = egressInfo.egressId;

            if (egressInfo.status === EgressStatus.EGRESS_COMPLETE) {
                const fileResult = egressInfo.fileResults?.[0];
                const blobUrl = fileResult?.filename || '';
                const durationNs = Number(fileResult?.duration || 0);
                const durationSeconds = Math.round(durationNs / 1_000_000_000);
                const fileSize = Number(fileResult?.size || 0);

                const { callId } = await callRecordingService.handleEgressComplete(
                    egressId,
                    blobUrl,
                    durationSeconds,
                    fileSize,
                );

                await eventPublisher.publish('call.recording_ready', {
                    call_id: callId,
                    recording_url: blobUrl,
                    duration_seconds: durationSeconds,
                    file_size_bytes: fileSize,
                });
            } else if (egressInfo.status === EgressStatus.EGRESS_FAILED) {
                const errorMsg = egressInfo.error || 'Unknown egress failure';
                await callRecordingService.handleEgressFailed(egressId, errorMsg);
            }

            return reply.send({ received: true });
        } catch (error: any) {
            // Always return 200 to prevent retry storms (per Phase 35 decision)
            request.log.error({ error: error.message }, 'Call recording webhook processing error');
            return reply.send({ received: true, error: 'Processing failed' });
        }
    });
}
