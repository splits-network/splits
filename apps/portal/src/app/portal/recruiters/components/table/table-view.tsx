"use client";

import type { RecruiterWithUser } from "../../types";
import { TableRow } from "./table-row";

export function TableView({
    recruiters,
    onSelect,
    selectedId,
    onRefresh,
}: {
    recruiters: RecruiterWithUser[];
    onSelect: (r: RecruiterWithUser) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const columns = [
        "",
        "Name",
        "Location",
        "Specialties",
        "Placements",
        "Reputation",
        "Experience",
        "Status",
        "Joined",
        "",
    ];

    return (
        <div className="border-2 border-base-300">
            <table className="w-full">
                <thead>
                    <tr className="bg-base-300 text-base-content">
                        {columns.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-sm uppercase tracking-[0.2em] font-bold ${i === 0 ? "w-8" : ""} ${i === columns.length - 1 ? "w-20" : ""}`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {recruiters.map((recruiter, idx) => (
                        <TableRow
                            key={recruiter.id}
                            recruiter={recruiter}
                            idx={idx}
                            isSelected={selectedId === recruiter.id}
                            colSpan={columns.length}
                            onSelect={() => onSelect(recruiter)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
