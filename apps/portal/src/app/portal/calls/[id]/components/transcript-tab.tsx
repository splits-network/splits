"use client";

import type { CallTranscript } from "../../hooks/use-call-detail";

interface TranscriptTabProps {
    transcript?: CallTranscript | null;
    currentTimestamp: number;
    onTimestampSeek: (ts: number) => void;
}

export function TranscriptTab({
    transcript,
    currentTimestamp,
    onTimestampSeek,
}: TranscriptTabProps) {
    // Placeholder — full implementation in Task 2
    return (
        <div className="text-base-content/50 text-sm py-8 text-center">
            Transcript tab loading...
        </div>
    );
}
