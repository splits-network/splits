import crypto from 'crypto';
import { AccessToken } from 'livekit-server-sdk';
import { CallRepository } from './repository';
import { Call } from './types';

export class TokenService {
    constructor(
        private repository: CallRepository,
        private livekitApiKey: string,
        private livekitApiSecret: string,
    ) {}

    async createToken(
        callId: string,
        userClerkId: string,
    ): Promise<{ token: string; livekit_token: string }> {
        // Resolve Clerk user ID to internal user ID
        const userId = await this.repository.resolveUserId(userClerkId);
        if (!userId) {
            throw Object.assign(
                new Error('Could not resolve user'),
                { statusCode: 400 },
            );
        }

        // Validate user is a participant
        const participants = await this.repository.participants.getCallParticipants(callId);
        const participant = participants.find((p) => p.user_id === userId);
        if (!participant) {
            throw Object.assign(
                new Error('You are not a participant in this call'),
                { statusCode: 403 },
            );
        }

        // Get call record
        const call = await this.repository.getCall(callId);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }

        if (!call.livekit_room_name) {
            throw Object.assign(
                new Error('Call has not started yet'),
                { statusCode: 400 },
            );
        }

        // Generate access token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        await this.repository.artifacts.createAccessToken({
            call_id: callId,
            user_id: userId,
            token,
            expires_at: expiresAt,
        });

        // Generate LiveKit JWT
        const livekitToken = await this.generateLivekitJwt(
            userId,
            participant.role,
            call.livekit_room_name,
        );

        return { token, livekit_token: livekitToken };
    }

    async exchangeToken(
        token: string,
    ): Promise<{ livekit_token: string; call: Call }> {
        // Look up access token
        const accessToken = await this.repository.artifacts.getAccessTokenByToken(token);
        if (!accessToken) {
            throw Object.assign(
                new Error('Invalid or expired token'),
                { statusCode: 404 },
            );
        }

        // Validate not expired
        if (new Date(accessToken.expires_at) <= new Date()) {
            throw Object.assign(
                new Error('Token has expired'),
                { statusCode: 410 },
            );
        }

        // Mark as used
        await this.repository.artifacts.markTokenUsed(accessToken.id);

        // Get call
        const call = await this.repository.getCall(accessToken.call_id);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }

        if (!call.livekit_room_name) {
            throw Object.assign(
                new Error('Call has not started yet'),
                { statusCode: 400 },
            );
        }

        // Generate LiveKit JWT
        const livekitToken = await this.generateLivekitJwt(
            accessToken.user_id,
            'participant',
            call.livekit_room_name,
        );

        return { livekit_token: livekitToken, call };
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
