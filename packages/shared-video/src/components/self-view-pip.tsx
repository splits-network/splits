'use client';

import { useLocalParticipant, useTracks, VideoTrack, isTrackReference } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { CameraOffFallback } from './camera-off-fallback';
import { ConnectionQualityBars } from './connection-quality';

interface SelfViewPipProps {
    name: string;
    avatarUrl?: string;
}

export function SelfViewPip({ name, avatarUrl }: SelfViewPipProps) {
    const { localParticipant } = useLocalParticipant();
    const tracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true }],
        { onlySubscribed: false },
    );

    const localCameraTrack = tracks.find(
        (t) => t.participant.identity === localParticipant.identity
            && t.source === Track.Source.Camera
            && isTrackReference(t),
    );

    return (
        <div className="absolute bottom-20 right-4 w-24 lg:w-48 overflow-hidden shadow-lg z-10 bg-base-300">
            {localCameraTrack && isTrackReference(localCameraTrack) ? (
                <VideoTrack
                    trackRef={localCameraTrack}
                    className="w-full aspect-video object-cover"
                />
            ) : (
                <div className="w-full aspect-video">
                    <CameraOffFallback name={name} avatarUrl={avatarUrl} />
                </div>
            )}

            {/* Connection quality in corner */}
            <div className="absolute top-1 right-1 bg-black/40 px-1 py-0.5">
                <ConnectionQualityBars participant={localParticipant} />
            </div>
        </div>
    );
}
