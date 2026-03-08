import type { RoomOptions } from 'livekit-client';

export function getLiveKitUrl(): string {
    const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!url) {
        throw new Error('NEXT_PUBLIC_LIVEKIT_URL environment variable is not set');
    }
    return url;
}

export const defaultRoomOptions: RoomOptions = {
    adaptiveStream: true,
    dynacast: true,
};
