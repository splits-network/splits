"use client";

import type { CallSummary } from "../../hooks/use-call-detail";

interface SummaryTabProps {
    summary?: CallSummary | null;
}

export function SummaryTab({ summary }: SummaryTabProps) {
    // Placeholder — full implementation in Task 2
    return (
        <div className="text-base-content/50 text-sm py-8 text-center">
            Summary tab loading...
        </div>
    );
}
