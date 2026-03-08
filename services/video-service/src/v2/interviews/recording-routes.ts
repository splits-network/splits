import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { InterviewRepository } from './repository';
import { RecordingService } from './recording-service';
import { TokenService } from './token-service';
import { requireUserContext } from '../shared/helpers';
import { generateSignedUrl, extractStoragePath } from './signed-url-helper';

interface RecordingRoutesConfig {
    repository: InterviewRepository;
    recordingService: RecordingService;
    tokenService: TokenService;
    supabase: SupabaseClient;
}

export async function registerRecordingRoutes(
    app: FastifyInstance,
    config: RecordingRoutesConfig,
) {
    const { repository, recordingService, tokenService, supabase } = config;

    // POST /api/v2/interviews/:id/recording/start - Start recording (authenticated, interviewer only)
    app.post('/api/v2/interviews/:id/recording/start', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            await verifyInterviewer(repository, id, clerkUserId);
            await recordingService.startRecording(id);

            return reply.send({ data: { recording_status: 'recording' } });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // POST /api/v2/interviews/:id/recording/stop - Stop recording (authenticated, interviewer only)
    app.post('/api/v2/interviews/:id/recording/stop', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            await verifyInterviewer(repository, id, clerkUserId);
            await recordingService.stopRecording(id);

            return reply.send({ data: { recording_status: 'processing' } });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // POST /api/v2/interviews/:id/recording/consent - Record consent (NO AUTH -- supports magic link)
    app.post('/api/v2/interviews/:id/recording/consent', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as { token?: string };

            let participantId: string;

            if (body?.token) {
                const tokenResult = await tokenService.validateMagicLinkToken(body.token);
                if (!tokenResult) {
                    return reply.code(401).send({ error: 'Invalid or expired token' });
                }
                if (tokenResult.interview.id !== id) {
                    return reply.code(403).send({ error: 'Token does not match this interview' });
                }
                participantId = tokenResult.participant.id;
            } else {
                const { clerkUserId } = requireUserContext(request);
                const participant = await findParticipantByClerkId(repository, id, clerkUserId);
                participantId = participant.id;
            }

            await repository.addRecordingConsent(id, participantId);
            return reply.send({ data: { consented: true } });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // GET /api/v2/interviews/:id/recording - Get recording status and metadata (authenticated)
    app.get('/api/v2/interviews/:id/recording', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            const interview = await repository.findByIdWithParticipants(id);
            if (!interview) {
                return reply.code(404).send({ error: 'Interview not found' });
            }

            const isParticipant = await isUserParticipant(repository, id, clerkUserId);

            return reply.send({
                data: {
                    recording_enabled: interview.recording_enabled,
                    recording_status: interview.recording_status,
                    recording_duration_seconds: interview.recording_duration_seconds,
                    recording_blob_url: isParticipant ? interview.recording_blob_url : null,
                    recording_file_size_bytes: interview.recording_file_size_bytes,
                },
            });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // GET /api/v2/interviews/:id/recording/playback-url - Get time-limited signed URL for playback
    app.get('/api/v2/interviews/:id/recording/playback-url', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            const interview = await repository.findByIdWithParticipants(id);
            if (!interview) {
                return reply.code(404).send({ error: 'Interview not found' });
            }

            if (interview.recording_status !== 'ready' || !interview.recording_blob_url) {
                return reply.code(400).send({ error: 'Recording is not available' });
            }

            await verifyRecordingAccess(repository, interview, clerkUserId);

            const storagePath = extractStoragePath(interview.recording_blob_url);
            const result = await generateSignedUrl(supabase, { storagePath });

            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // GET /api/v2/interviews/:id/recording/download-url - Get time-limited signed URL for download
    app.get('/api/v2/interviews/:id/recording/download-url', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            const interview = await repository.findByIdWithParticipants(id);
            if (!interview) {
                return reply.code(404).send({ error: 'Interview not found' });
            }

            if (interview.recording_status !== 'ready' || !interview.recording_blob_url) {
                return reply.code(400).send({ error: 'Recording is not available' });
            }

            await verifyRecordingAccess(repository, interview, clerkUserId);

            const storagePath = extractStoragePath(interview.recording_blob_url);
            const result = await generateSignedUrl(supabase, {
                storagePath,
                download: `interview-recording-${id}.mp4`,
            });

            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });
}

async function verifyInterviewer(
    repository: InterviewRepository,
    interviewId: string,
    clerkUserId: string,
): Promise<void> {
    const userId = await repository.resolveUserId(clerkUserId);
    const interview = await repository.findByIdWithParticipants(interviewId);
    if (!interview) {
        throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
    }
    const participant = interview.participants.find(
        (p) => p.user_id === userId && p.role === 'interviewer',
    );
    if (!participant) {
        throw Object.assign(new Error('Only the interviewer can control recording'), { statusCode: 403 });
    }
}

async function findParticipantByClerkId(
    repository: InterviewRepository,
    interviewId: string,
    clerkUserId: string,
): Promise<{ id: string }> {
    const userId = await repository.resolveUserId(clerkUserId);
    const interview = await repository.findByIdWithParticipants(interviewId);
    if (!interview) {
        throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
    }
    const participant = interview.participants.find((p) => p.user_id === userId);
    if (!participant) {
        throw Object.assign(new Error('You are not a participant in this interview'), { statusCode: 403 });
    }
    return participant;
}

async function isUserParticipant(
    repository: InterviewRepository,
    interviewId: string,
    clerkUserId: string,
): Promise<boolean> {
    try {
        const userId = await repository.resolveUserId(clerkUserId);
        const interview = await repository.findByIdWithParticipants(interviewId);
        if (!interview) return false;
        return interview.participants.some((p) => p.user_id === userId);
    } catch {
        return false;
    }
}

async function verifyRecordingAccess(
    repository: InterviewRepository,
    interview: { id: string; application_id: string; participants: Array<{ user_id: string }> },
    clerkUserId: string,
): Promise<void> {
    const userId = await repository.resolveUserId(clerkUserId);

    // Check if user is an interview participant
    const isParticipant = interview.participants.some((p) => p.user_id === userId);
    if (isParticipant) return;

    // Check if user is a company admin for the job's company
    const isCompanyAdmin = await repository.isCompanyAdminForInterview(
        interview.application_id,
        userId,
    );
    if (isCompanyAdmin) return;

    throw Object.assign(
        new Error('You do not have access to this recording'),
        { statusCode: 403 },
    );
}
