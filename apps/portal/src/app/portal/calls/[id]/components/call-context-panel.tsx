"use client";

import type { CallDetail } from "../../hooks/use-call-detail";

interface CallContextPanelProps {
    call: CallDetail;
}

export function CallContextPanel({ call }: CallContextPanelProps) {
    // Placeholder — full implementation in Task 2
    return (
        <div className="text-base-content/50 text-sm py-8 text-center">
            Context panel loading...
        </div>
    );
}
