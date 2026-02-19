"use client";

import type { Candidate } from "../../types";
import { TableRow } from "./table-row";

const COLUMNS = [
    "",              // chevron
    "Name",
    "Title",
    "Location",
    "Status",
    "Job Type",
    "Salary",
    "Added",
    "",              // actions
] as const;

export function TableView({
    candidates,
    onSelect,
    selectedId,
    onRefresh,
}: {
    candidates: Candidate[];
    onSelect: (c: Candidate) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    return (
        <div className="overflow-x-auto border-2 border-base-300">
            <table className="w-full" style={{ minWidth: 900 }}>
                <thead>
                    <tr className="bg-base-200 border-b-2 border-base-300">
                        {COLUMNS.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 ${i === 0 ? "w-8" : ""} ${i === COLUMNS.length - 1 ? "w-24" : ""}`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {candidates.map((candidate, idx) => (
                        <TableRow
                            key={candidate.id}
                            candidate={candidate}
                            idx={idx}
                            isSelected={selectedId === candidate.id}
                            colSpan={COLUMNS.length}
                            onSelect={() => onSelect(candidate)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
