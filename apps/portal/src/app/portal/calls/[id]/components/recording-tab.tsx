"use client";

import type { CallRecording } from "../../hooks/use-call-detail";

interface RecordingTabProps {
    recordings?: CallRecording[];
    currentTimestamp: number;
    onTimestampChange: (ts: number) => void;
}

export function RecordingTab({
    recordings,
    currentTimestamp,
    onTimestampChange,
}: RecordingTabProps) {
    // Placeholder — full implementation in Task 2
    return (
        <div className="text-base-content/50 text-sm py-8 text-center">
            Recording tab loading...
        </div>
    );
}
