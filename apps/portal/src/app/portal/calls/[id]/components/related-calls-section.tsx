"use client";

import type { CallListItem, CallEntityLink } from "../../types";

interface RelatedCallsSectionProps {
    calls: CallListItem[];
    currentCallId: string;
    entityLink: CallEntityLink | null;
}

export function RelatedCallsSection({
    calls,
    currentCallId,
    entityLink,
}: RelatedCallsSectionProps) {
    // Placeholder — full implementation in Task 2
    return (
        <div className="text-base-content/50 text-sm py-8 text-center">
            Related calls loading...
        </div>
    );
}
