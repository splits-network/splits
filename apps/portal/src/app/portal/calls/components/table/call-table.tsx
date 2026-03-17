"use client";

import type { CallListItem } from "../../types";
import { CallRow } from "./call-row";

const COLUMNS = [
    "Title / Participants",
    "Type",
    "Status",
    "Date / Time",
    "Duration",
    "Entity",
    "Tags",
] as const;

export function CallTable({ calls }: { calls: CallListItem[] }) {
    return (
        <div className="overflow-x-auto border-2 border-base-300">
            <table className="w-full" style={{ minWidth: 800 }}>
                <thead>
                    <tr className="bg-base-200 border-b-2 border-base-300">
                        {COLUMNS.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-sm uppercase tracking-[0.2em] font-bold text-base-content/40 ${
                                    i >= 4 ? "hidden md:table-cell" : ""
                                }`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {calls.map((call) => (
                        <CallRow key={call.id} call={call} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
