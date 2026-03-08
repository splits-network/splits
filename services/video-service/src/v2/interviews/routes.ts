import { FastifyInstance } from 'fastify';
import { InterviewRepository } from './repository';
import { InterviewService } from './service';
import { SchedulingService } from './scheduling-service';
import { TokenService } from './token-service';
import { requireUserContext } from '../shared/helpers';
import { IEventPublisher } from '../shared/events';

interface RegisterInterviewRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: IEventPublisher;
    livekitApiKey: string;
    livekitApiSecret: string;
}

export async function registerInterviewRoutes(
    app: FastifyInstance,
    config: RegisterInterviewRoutesConfig,
) {
    const repository = new InterviewRepository(
        config.supabaseUrl,
        config.supabaseKey,
    );
    const service = new InterviewService(repository, config.eventPublisher);
    const schedulingService = new SchedulingService(repository, config.eventPublisher);
    const tokenService = new TokenService(
        repository,
        config.livekitApiKey,
        config.livekitApiSecret,
    );

    // POST /api/v2/interviews - Create interview
    app.post('/api/v2/interviews', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;

            const interview = await service.createInterview(
                {
                    application_id: body.application_id,
                    interview_type: body.interview_type,
                    title: body.title,
                    round_name: body.round_name,
                    scheduled_at: body.scheduled_at,
                    scheduled_duration_minutes: body.scheduled_duration_minutes,
                    calendar_event_id: body.calendar_event_id,
                    calendar_connection_id: body.calendar_connection_id,
                    meeting_platform: body.meeting_platform,
                    meeting_link: body.meeting_link,
                    recording_enabled: body.recording_enabled,
                    participants: body.participants || [],
                },
                clerkUserId,
            );

            return reply.code(201).send({ data: interview });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // GET /api/v2/interviews/:id - Get interview with participants
    app.get('/api/v2/interviews/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };

            const interview = await service.getInterview(id);
            return reply.send({ data: interview });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // GET /api/v2/interviews - List by application_id
    // When include_context=true, returns enriched data with participants, recording/transcript status
    app.get('/api/v2/interviews', async (request, reply) => {
        try {
            requireUserContext(request);
            const query = request.query as any;
            const applicationId = query.application_id as string;

            if (!applicationId) {
                return reply.code(400).send({ error: 'application_id query parameter is required' });
            }

            const limit = Math.min(parseInt(query.limit || '25', 10), 100);
            const page = Math.max(parseInt(query.page || '1', 10), 1);
            const offset = (page - 1) * limit;
            const includeContext = query.include_context === 'true';

            if (includeContext) {
                const result = await repository.findByApplicationIdWithContext(
                    applicationId,
                    { limit, offset },
                );

                return reply.send({
                    data: result.data,
                    pagination: {
                        total: result.total,
                        page,
                        limit,
                        total_pages: Math.ceil(result.total / limit),
                    },
                });
            }

            const status = query.status as string | undefined;
            const result = await service.listByApplication(applicationId, {
                status,
                limit,
                offset,
            });

            return reply.send({
                data: result.data,
                pagination: {
                    total: result.total,
                    page,
                    limit,
                    total_pages: Math.ceil(result.total / limit),
                },
            });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // PATCH /api/v2/interviews/:id/cancel - Cancel interview
    app.patch('/api/v2/interviews/:id/cancel', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = (request.body as any) || {};

            const interview = await service.cancelInterview(
                id,
                body.reason,
                clerkUserId,
            );

            return reply.send({ data: interview });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // POST /api/v2/interviews/join - Magic link token exchange (NO AUTH REQUIRED)
    // Candidates use magic links to join interviews without Clerk authentication
    app.post('/api/v2/interviews/join', async (request, reply) => {
        try {
            const body = request.body as { token?: string };

            if (!body?.token) {
                return reply.code(400).send({ error: 'token is required' });
            }

            const result = await tokenService.exchangeMagicLink(body.token);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // POST /api/v2/interviews/:id/token - Authenticated token generation
    // Requires x-clerk-user-id header (authenticated users)
    app.post('/api/v2/interviews/:id/token', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            const result = await tokenService.generateAuthenticatedToken(
                id,
                clerkUserId,
            );

            return reply.send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // PATCH /api/v2/interviews/:id/reschedule - Reschedule interview (authenticated)
    app.patch('/api/v2/interviews/:id/reschedule', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            if (!body?.scheduled_at) {
                return reply.code(400).send({ error: 'scheduled_at is required' });
            }

            const interview = await schedulingService.rescheduleInterview(
                id,
                body.scheduled_at,
                body.scheduled_duration_minutes,
                body.reason,
                clerkUserId,
            );

            return reply.send({ data: interview });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // POST /api/v2/interviews/:id/reschedule-request - Create reschedule request (NO AUTH - magic link)
    // Candidates use magic link token to request a reschedule
    app.post('/api/v2/interviews/:id/reschedule-request', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as any;

            if (!body?.token) {
                return reply.code(400).send({ error: 'token is required' });
            }

            if (!body?.proposed_times || body.proposed_times.length === 0) {
                return reply.code(400).send({ error: 'proposed_times is required' });
            }

            // Validate the magic link token to identify the candidate
            const tokenResult = await tokenService.validateMagicLinkToken(body.token);
            if (!tokenResult) {
                return reply.code(401).send({ error: 'Invalid or expired token' });
            }

            // Verify the token belongs to this interview
            if (tokenResult.interview.id !== id) {
                return reply.code(403).send({ error: 'Token does not match this interview' });
            }

            const request_ = await schedulingService.createRescheduleRequest(
                id,
                'candidate',
                tokenResult.participant.user_id,
                body.proposed_times,
                body.notes,
            );

            return reply.code(201).send({ data: request_ });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // PATCH /api/v2/interviews/reschedule-requests/:requestId/accept - Accept reschedule request (authenticated)
    app.patch('/api/v2/interviews/reschedule-requests/:requestId/accept', async (request, reply) => {
        try {
            requireUserContext(request);
            const { requestId } = request.params as { requestId: string };
            const body = request.body as any;

            if (!body?.accepted_time) {
                return reply.code(400).send({ error: 'accepted_time is required' });
            }

            const interview = await schedulingService.acceptRescheduleRequest(
                requestId,
                body.accepted_time,
            );

            return reply.send({ data: interview });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // POST /api/v2/interviews/available-slots - Compute available time slots (authenticated)
    app.post('/api/v2/interviews/available-slots', async (request, reply) => {
        try {
            requireUserContext(request);
            const body = request.body as any;

            if (!body?.start_date || !body?.end_date) {
                return reply.code(400).send({ error: 'start_date and end_date are required' });
            }

            const slots = schedulingService.getAvailableSlots({
                busySlots: body.busy_slots || [],
                startDate: body.start_date,
                endDate: body.end_date,
                workingHoursStart: body.working_hours_start || '09:00',
                workingHoursEnd: body.working_hours_end || '17:00',
                workingDays: body.working_days || [1, 2, 3, 4, 5],
                timezone: body.timezone || 'UTC',
                durationMinutes: body.duration_minutes || 60,
            });

            return reply.send({ data: slots });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // GET /api/v2/interviews/calendar-preferences - Get user's calendar preferences
    app.get('/api/v2/interviews/calendar-preferences', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const userId = await repository.resolveUserId(clerkUserId);
            const prefs = await repository.getCalendarPreferences(userId);

            // Return defaults if no preferences exist yet
            const defaults = {
                connection_id: null,
                primary_calendar_id: null,
                additional_calendar_ids: [],
                working_hours_start: '09:00',
                working_hours_end: '17:00',
                working_days: [1, 2, 3, 4, 5],
                timezone: 'America/New_York',
            };

            return reply.send({ data: prefs || defaults });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // PUT /api/v2/interviews/calendar-preferences - Upsert user's calendar preferences
    app.put('/api/v2/interviews/calendar-preferences', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const userId = await repository.resolveUserId(clerkUserId);
            const body = request.body as any;

            const result = await repository.upsertCalendarPreferences(userId, {
                connection_id: body.connection_id,
                primary_calendar_id: body.primary_calendar_id,
                additional_calendar_ids: body.additional_calendar_ids,
                working_hours_start: body.working_hours_start,
                working_hours_end: body.working_hours_end,
                working_days: body.working_days,
                timezone: body.timezone,
            });

            return reply.send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // GET /api/v2/interviews/:id/available-slots - Get available slots for candidate reschedule (NO AUTH - token-based)
    app.get('/api/v2/interviews/:id/available-slots', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const query = request.query as { token?: string };

            if (!query?.token) {
                return reply.code(400).send({ error: 'token query parameter is required' });
            }

            // Validate magic link token
            const tokenResult = await tokenService.validateMagicLinkToken(query.token);
            if (!tokenResult) {
                return reply.code(401).send({ error: 'Invalid or expired token' });
            }

            if (tokenResult.interview.id !== id) {
                return reply.code(403).send({ error: 'Token does not match this interview' });
            }

            // Get interview to find interviewer
            const interview = await repository.findByIdWithParticipants(id);
            if (!interview) {
                return reply.code(404).send({ error: 'Interview not found' });
            }

            const interviewer = interview.participants.find(p => p.role === 'interviewer');
            if (!interviewer) {
                return reply.code(400).send({ error: 'No interviewer found for this interview' });
            }

            // Get interviewer's calendar preferences for working hours
            let prefs;
            try {
                prefs = await repository.getCalendarPreferences(interviewer.user_id);
            } catch {
                // No preferences — use defaults
            }

            const workingHoursStart = prefs?.working_hours_start || '09:00';
            const workingHoursEnd = prefs?.working_hours_end || '17:00';
            const workingDays = prefs?.working_days || [1, 2, 3, 4, 5];
            const timezone = prefs?.timezone || 'America/New_York';

            // Compute available slots for next 2 weeks using working hours
            const now = new Date();
            const startDate = now.toISOString().split('T')[0];
            const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];

            const slots = schedulingService.getAvailableSlots({
                busySlots: [],
                startDate,
                endDate,
                workingHoursStart: workingHoursStart,
                workingHoursEnd: workingHoursEnd,
                workingDays: workingDays,
                timezone,
                durationMinutes: interview.scheduled_duration_minutes || 60,
            });

            // Check for pending reschedule requests
            const rescheduleRequests = await repository.findRescheduleRequests(id);
            const pendingRequest = rescheduleRequests.find(r => r.status === 'pending');

            return reply.send({
                data: {
                    slots,
                    timezone,
                    reschedule_count: interview.reschedule_count,
                    has_pending_request: !!pendingRequest,
                },
            });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // GET /api/v2/interviews/:id/transcript - Get interview transcript
    app.get('/api/v2/interviews/:id/transcript', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };

            const transcript = await repository.getTranscriptByInterviewId(id);
            if (!transcript) {
                return reply.code(404).send({ error: 'Transcript not found' });
            }

            return reply.send({ data: transcript });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // ── Interview Notes ─────────────────────────────────────────────────

    // PUT /api/v2/interviews/:id/notes - Upsert in-call note (dual-auth: magic link OR Clerk)
    app.put('/api/v2/interviews/:id/notes', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as { content?: string; token?: string };

            if (body?.content === undefined) {
                return reply.code(400).send({ error: 'content is required' });
            }

            let userId: string;
            let participantId: string;

            if (body?.token) {
                // Magic link auth path (candidates)
                const tokenResult = await tokenService.validateMagicLinkToken(body.token);
                if (!tokenResult) {
                    return reply.code(401).send({ error: 'Invalid or expired token' });
                }
                if (tokenResult.interview.id !== id) {
                    return reply.code(403).send({ error: 'Token does not match this interview' });
                }
                userId = tokenResult.participant.user_id;
                participantId = tokenResult.participant.id;
            } else {
                // Clerk auth path (authenticated users)
                const { clerkUserId } = requireUserContext(request);
                userId = await repository.resolveUserId(clerkUserId);

                const { data: participant, error: pError } = await repository
                    .getSupabase()
                    .from('interview_participants')
                    .select('id')
                    .eq('interview_id', id)
                    .eq('user_id', userId)
                    .maybeSingle();

                if (pError) throw pError;
                if (!participant) {
                    return reply.code(403).send({ error: 'You are not a participant in this interview' });
                }
                participantId = participant.id;
            }

            const note = await repository.saveInterviewNote(
                id,
                participantId,
                userId,
                body.content,
            );

            return reply.send({ data: note });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // GET /api/v2/interviews/:id/notes - Get notes for an interview (dual-auth: magic link OR Clerk)
    // When mine=true, returns only the current user's note as a single object (or null)
    app.get('/api/v2/interviews/:id/notes', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const query = request.query as { token?: string; mine?: string };

            let filterUserId: string | undefined;
            let filterParticipantId: string | undefined;

            if (query?.token) {
                // Magic link auth path (candidates)
                const tokenResult = await tokenService.validateMagicLinkToken(query.token);
                if (!tokenResult) {
                    return reply.code(401).send({ error: 'Invalid or expired token' });
                }
                if (tokenResult.interview.id !== id) {
                    return reply.code(403).send({ error: 'Token does not match this interview' });
                }
                if (query.mine === 'true') {
                    filterParticipantId = tokenResult.participant.id;
                }
            } else {
                // Clerk auth path (authenticated users)
                const { clerkUserId } = requireUserContext(request);
                if (query.mine === 'true') {
                    filterUserId = await repository.resolveUserId(clerkUserId);
                }
            }

            const notes = await repository.getInterviewNotes(id);

            // When mine=true, return a single note object (or null) instead of an array
            if (query.mine === 'true') {
                const myNote = notes.find(n =>
                    filterParticipantId
                        ? n.participant_id === filterParticipantId
                        : n.user_id === filterUserId,
                );
                return reply.send({ data: myNote || null });
            }

            return reply.send({ data: notes });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // POST /api/v2/interviews/:id/notes/post-to-application - Convert interview notes to application notes
    app.post('/api/v2/interviews/:id/notes/post-to-application', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            // Verify interview exists and get application_id
            const interview = await repository.findById(id);
            if (!interview) {
                return reply.code(404).send({ error: 'Interview not found' });
            }

            // Verify caller is an interviewer/observer (not candidate)
            const userId = await repository.resolveUserId(clerkUserId);
            const { data: participant, error: pError } = await repository
                .getSupabase()
                .from('interview_participants')
                .select('id, role')
                .eq('interview_id', id)
                .eq('user_id', userId)
                .maybeSingle();

            if (pError) throw pError;
            if (!participant) {
                return reply.code(403).send({ error: 'You are not a participant in this interview' });
            }

            if (participant.role === 'candidate') {
                return reply.code(403).send({ error: 'Only interviewers can post notes to applications' });
            }

            const result = await repository.postNotesToApplication(
                id,
                interview.application_id,
            );

            return reply.send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // PATCH /api/v2/interviews/:id - Update interview fields (authenticated)
    // Used for linking calendar events or updating meeting info after creation
    app.patch('/api/v2/interviews/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            // Only allow updating specific fields
            const allowedFields = [
                'calendar_event_id',
                'calendar_connection_id',
                'meeting_platform',
                'meeting_link',
                'title',
                'round_name',
                'metadata',
                'recording_enabled',
            ];

            const updates: Record<string, any> = {};
            for (const field of allowedFields) {
                if (body[field] !== undefined) {
                    updates[field] = body[field];
                }
            }

            if (Object.keys(updates).length === 0) {
                return reply.code(400).send({ error: 'No valid fields to update' });
            }

            const interview = await repository.updateInterview(id, updates);
            return reply.send({ data: interview });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });
}
