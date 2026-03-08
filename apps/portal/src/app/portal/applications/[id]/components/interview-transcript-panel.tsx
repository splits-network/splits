'use client';

import type { TranscriptSegment } from '@splits-network/shared-types';

interface InterviewTranscriptPanelProps {
    interviewId: string;
    segments: TranscriptSegment[];
    onTimestampClick?: (seconds: number) => void;
}

function formatTimestamp(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function InterviewTranscriptPanel({
    segments,
    onTimestampClick,
}: InterviewTranscriptPanelProps) {
    if (segments.length === 0) {
        return (
            <div className="px-4 py-3 text-sm text-base-content/50">
                No transcript available.
            </div>
        );
    }

    return (
        <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-sm font-medium flex items-center gap-2">
                <i className="fa-duotone fa-regular fa-closed-captioning" />
                Transcript
                <span className="badge badge-ghost badge-sm">{segments.length} segments</span>
            </div>
            <div className="collapse-content">
                <div className="space-y-3 max-h-96 overflow-y-auto pt-2">
                    {segments.map((seg, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                            <button
                                type="button"
                                className="btn btn-ghost btn-xs font-mono shrink-0"
                                onClick={() => onTimestampClick?.(seg.start)}
                                title={`Jump to ${formatTimestamp(seg.start)}`}
                            >
                                {formatTimestamp(seg.start)}
                            </button>
                            <div className="min-w-0">
                                <span className="font-bold text-secondary">
                                    {seg.speaker}
                                </span>
                                <p className="text-base-content/80 mt-0.5">{seg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
