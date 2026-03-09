"use client";

import type { CallNote } from "../../hooks/use-call-detail";

interface CallNotesSectionProps {
    callId: string;
    notes: CallNote[];
    onRefetch: () => void;
}

export function CallNotesSection({
    callId,
    notes,
    onRefetch,
}: CallNotesSectionProps) {
    // Placeholder — full implementation in Task 2
    return (
        <div className="text-base-content/50 text-sm py-8 text-center">
            Notes section loading...
        </div>
    );
}
