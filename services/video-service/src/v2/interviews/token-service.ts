import { AccessToken } from 'livekit-server-sdk';
import { InterviewRepository } from './repository';
import { InterviewStatus, InterviewContext } from './types';

interface TokenResponse {
    jwt: string;
    room_name: string;
    interview: InterviewContext;
    participant: {
        id: string;
        role: string;
    };
}

const TERMINAL_STATUSES: InterviewStatus[] = ['cancelled', 'expired', 'completed', 'no_show'];

export class TokenService {
    constructor(
        private repository: InterviewRepository,
        private livekitApiKey: string,
        private livekitApiSecret: string,
    ) {}

    async exchangeMagicLink(token: string): Promise<TokenResponse> {
        const result = await this.repository.findAccessTokenByToken(token);
        if (!result) {
            throw Object.assign(
                new Error('Invalid or expired link'),
                { statusCode: 404 },
            );
        }

        const { interview, participant } = result;

        if (TERMINAL_STATUSES.includes(interview.status)) {
            throw Object.assign(
                new Error('This interview has ended or was cancelled'),
                { statusCode: 410 },
            );
        }

        // Lazy room name assignment
        let roomName = interview.room_name;
        if (!roomName) {
            roomName = `interview-${interview.id}`;
            await this.repository.updateRoomName(interview.id, roomName);
        }

        const jwt = await this.generateLivekitJwt(
            participant.user_id,
            participant.role,
            roomName,
        );

        // Fetch enriched context for the response
        const context = await this.repository.findByIdWithContext(interview.id);

        return {
            jwt,
            room_name: roomName,
            interview: context
                ? {
                      id: context.id,
                      status: context.status,
                      interview_type: context.interview_type,
                      title: context.title,
                      scheduled_at: context.scheduled_at,
                      scheduled_duration_minutes: context.scheduled_duration_minutes,
                      reschedule_count: context.reschedule_count,
                      recording_enabled: context.recording_enabled,
                      job: context.job,
                      participants: context.participants,
                  }
                : {
                      id: interview.id,
                      status: interview.status,
                      interview_type: interview.interview_type,
                      title: interview.title,
                      scheduled_at: interview.scheduled_at,
                      scheduled_duration_minutes: interview.scheduled_duration_minutes,
                      reschedule_count: interview.reschedule_count ?? 0,
                      recording_enabled: interview.recording_enabled ?? false,
                      job: { id: '', title: 'Interview', company_name: '' },
                      participants: [],
                  },
            participant: {
                id: participant.id,
                role: participant.role,
            },
        };
    }

    /**
     * Validate a magic link token without generating a LiveKit JWT.
     * Used for non-video operations like reschedule requests.
     */
    async validateMagicLinkToken(token: string): Promise<{
        interview: { id: string; status: InterviewStatus };
        participant: { id: string; user_id: string; role: string };
    } | null> {
        const result = await this.repository.findAccessTokenByToken(token);
        if (!result) {
            return null;
        }

        return {
            interview: {
                id: result.interview.id,
                status: result.interview.status,
            },
            participant: {
                id: result.participant.id,
                user_id: result.participant.user_id,
                role: result.participant.role,
            },
        };
    }

    async generateAuthenticatedToken(
        interviewId: string,
        userId: string,
    ): Promise<TokenResponse> {
        const interview = await this.repository.findByIdWithContext(interviewId);
        if (!interview) {
            throw Object.assign(
                new Error('Interview not found'),
                { statusCode: 404 },
            );
        }

        if (TERMINAL_STATUSES.includes(interview.status)) {
            throw Object.assign(
                new Error('This interview has ended or was cancelled'),
                { statusCode: 410 },
            );
        }

        const participant = interview.participants.find(
            (p) => p.user_id === userId,
        );
        if (!participant) {
            throw Object.assign(
                new Error('You are not a participant in this interview'),
                { statusCode: 403 },
            );
        }

        // Lazy room name assignment
        let roomName = interview.room_name;
        if (!roomName) {
            roomName = `interview-${interview.id}`;
            await this.repository.updateRoomName(interview.id, roomName);
        }

        const jwt = await this.generateLivekitJwt(
            participant.user_id,
            participant.role,
            roomName,
        );

        return {
            jwt,
            room_name: roomName,
            interview: {
                id: interview.id,
                status: interview.status,
                interview_type: interview.interview_type,
                title: interview.title,
                scheduled_at: interview.scheduled_at,
                scheduled_duration_minutes: interview.scheduled_duration_minutes,
                reschedule_count: interview.reschedule_count,
                recording_enabled: interview.recording_enabled,
                job: interview.job,
                participants: interview.participants,
            },
            participant: {
                id: participant.id,
                role: participant.role,
            },
        };
    }

    private async generateLivekitJwt(
        identity: string,
        participantName: string,
        roomName: string,
    ): Promise<string> {
        const at = new AccessToken(this.livekitApiKey, this.livekitApiSecret, {
            identity,
            name: participantName,
        });
        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });
        at.ttl = '4h';
        return at.toJwt();
    }
}
