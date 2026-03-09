"use client";

import type { CallParticipantItem } from "../../types";

interface CallParticipantsSectionProps {
    participants: CallParticipantItem[];
}

export function CallParticipantsSection({
    participants,
}: CallParticipantsSectionProps) {
    // Placeholder — full implementation in Task 2
    return (
        <div className="text-base-content/50 text-sm py-8 text-center">
            Participants section loading...
        </div>
    );
}
