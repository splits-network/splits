import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CallRecordingRepository } from './call-repository';
import { CallRecordingService } from './call-recording-service';
import { requireUserContext } from '../shared/helpers';
import { generateSignedUrl, extractStoragePath } from '../shared/signed-url-helper';

interface CallRecordingRoutesConfig {
    repository: CallRecordingRepository;
    recordingService: CallRecordingService;
    supabase: SupabaseClient;
}

export async function registerCallRecordingRoutes(
    app: FastifyInstance,
    config: CallRecordingRoutesConfig,
) {
    const { repository, recordingService, supabase } = config;

    // POST /api/v2/calls/:id/recording/start — host only
    app.post('/api/v2/calls/:id/recording/start', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            await verifyHost(repository, id, clerkUserId);
            await recordingService.startRecording(id);

            return reply.send({ data: { recording_status: 'recording' } });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // POST /api/v2/calls/:id/recording/stop — host only
    app.post('/api/v2/calls/:id/recording/stop', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            await verifyHost(repository, id, clerkUserId);
            await recordingService.stopRecording(id);

            return reply.send({ data: { recording_status: 'processing' } });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // GET /api/v2/calls/:id/recording/playback-url — any participant
    app.get('/api/v2/calls/:id/recording/playback-url', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const { recording_id } = request.query as { recording_id?: string };

            await verifyParticipant(repository, id, clerkUserId);

            const blobUrl = await repository.findReadyRecording(id, recording_id);
            const storagePath = extractStoragePath(blobUrl);
            const result = await generateSignedUrl(supabase, { storagePath });

            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });
}

async function verifyHost(
    repository: CallRecordingRepository,
    callId: string,
    clerkUserId: string,
): Promise<void> {
    const userId = await repository.resolveUserId(clerkUserId);
    const participants = await repository.getCallParticipants(callId);
    const host = participants.find((p) => p.user_id === userId && p.role === 'host');
    if (!host) {
        throw Object.assign(new Error('Only the host can control recording'), { statusCode: 403 });
    }
}

async function verifyParticipant(
    repository: CallRecordingRepository,
    callId: string,
    clerkUserId: string,
): Promise<void> {
    const userId = await repository.resolveUserId(clerkUserId);
    const participants = await repository.getCallParticipants(callId);
    const isParticipant = participants.some((p) => p.user_id === userId);
    if (!isParticipant) {
        throw Object.assign(
            new Error('You are not a participant in this call'),
            { statusCode: 403 },
        );
    }
}
