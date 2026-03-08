'use client';

import { useTracks, VideoTrack, isTrackReference } from '@livekit/components-react';
import type { RemoteParticipant } from 'livekit-client';
import { Track } from 'livekit-client';
import { CameraOffFallback } from './camera-off-fallback';
import { ConnectionQualityBars } from './connection-quality';

interface ParticipantTileProps {
    participant: RemoteParticipant;
    name: string;
    avatarUrl?: string;
    isCandidate?: boolean;
}

export function ParticipantTile({ participant, name, avatarUrl, isCandidate }: ParticipantTileProps) {
    const tracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true }],
        { onlySubscribed: true },
    );

    const cameraTrack = tracks.find(
        (t) => t.participant.identity === participant.identity
            && t.source === Track.Source.Camera
            && isTrackReference(t),
    );

    return (
        <div className={`relative w-full h-full bg-base-300 ${isCandidate ? 'border-2 border-accent' : ''}`}>
            {/* Candidate badge overlay */}
            {isCandidate && (
                <div className="absolute top-3 left-3 z-10">
                    <span className="badge badge-accent badge-sm">Candidate</span>
                </div>
            )}

            {cameraTrack && isTrackReference(cameraTrack) ? (
                <VideoTrack
                    trackRef={cameraTrack}
                    className="w-full h-full object-cover"
                />
            ) : (
                <CameraOffFallback name={name} avatarUrl={avatarUrl} />
            )}

            {/* Connection quality indicator */}
            <div className="absolute top-3 right-3 bg-black/40 px-2 py-1">
                <ConnectionQualityBars participant={participant} />
            </div>

            {/* Participant name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-4 py-2">
                <span className="text-sm font-medium">{name}</span>
            </div>
        </div>
    );
}
