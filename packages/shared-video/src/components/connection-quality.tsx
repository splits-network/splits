'use client';

import { useConnectionQualityIndicator } from '@livekit/components-react';
import type { Participant } from 'livekit-client';
import { ConnectionQuality } from 'livekit-client';

interface ConnectionQualityBarsProps {
    participant: Participant;
}

function getActiveBars(quality: ConnectionQuality): number {
    switch (quality) {
        case ConnectionQuality.Excellent:
            return 3;
        case ConnectionQuality.Good:
            return 2;
        case ConnectionQuality.Poor:
            return 1;
        default:
            return 0;
    }
}

function getBarColor(quality: ConnectionQuality): string {
    switch (quality) {
        case ConnectionQuality.Excellent:
            return 'bg-success';
        case ConnectionQuality.Good:
            return 'bg-warning';
        case ConnectionQuality.Poor:
            return 'bg-error';
        default:
            return '';
    }
}

const BAR_HEIGHTS = [4, 8, 12];

export function ConnectionQualityBars({ participant }: ConnectionQualityBarsProps) {
    const { quality } = useConnectionQualityIndicator({ participant });
    const activeBars = getActiveBars(quality);
    const color = getBarColor(quality);

    return (
        <div className="flex items-end gap-0.5" aria-label={`Connection quality: ${quality}`}>
            {BAR_HEIGHTS.map((height, i) => (
                <div
                    key={i}
                    className={`w-1 ${i < activeBars ? color : 'bg-base-content/20'}`}
                    style={{ height: `${height}px` }}
                />
            ))}
        </div>
    );
}
