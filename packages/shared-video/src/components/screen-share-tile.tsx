'use client';

import { VideoTrack } from '@livekit/components-react';
import type { TrackReference } from '@livekit/components-react';

interface ScreenShareTileProps {
    trackRef: TrackReference;
}

export function ScreenShareTile({ trackRef }: ScreenShareTileProps) {
    const sharerName = trackRef.participant.name ?? trackRef.participant.identity;

    return (
        <div className="relative w-full h-full bg-base-300">
            <div className="w-full h-full flex items-center justify-center">
                <VideoTrack
                    trackRef={trackRef}
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Sharer name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-4 py-2">
                <span className="text-sm font-medium">
                    <i className="fa-duotone fa-regular fa-screen-share mr-2" />
                    {sharerName}&apos;s screen
                </span>
            </div>
        </div>
    );
}
