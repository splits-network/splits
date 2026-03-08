import { AccessToken } from 'livekit-server-sdk';
import { InterviewRepository } from './repository';
import { InterviewStatus } from './types';

interface TokenResponse {
    jwt: string;
    room_name: string;
    interview: {
        id: string;
        status: InterviewStatus;
        interview_type: string;
        scheduled_at: string;
    };
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

        return {
            jwt,
            room_name: roomName,
            interview: {
                id: interview.id,
                status: interview.status,
                interview_type: interview.interview_type,
                scheduled_at: interview.scheduled_at,
            },
            participant: {
                id: participant.id,
                role: participant.role,
            },
        };
    }

    async generateAuthenticatedToken(
        interviewId: string,
        userId: string,
    ): Promise<TokenResponse> {
        const interview = await this.repository.findByIdWithParticipants(interviewId);
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
                scheduled_at: interview.scheduled_at,
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
