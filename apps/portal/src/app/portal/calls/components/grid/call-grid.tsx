"use client";

import type { CallListItem } from "../../types";
import { CallCard } from "./call-card";

export function CallGrid({ calls }: { calls: CallListItem[] }) {
    return (
        <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {calls.map((call) => (
                <CallCard key={call.id} call={call} />
            ))}
        </div>
    );
}
