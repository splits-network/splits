"use client";

import type { Job } from "../../types";
import { TableRow } from "./table-row";

const COLUMNS = [
    "", // chevron
    "Title",
    "Company",
    "Location",
    "Salary",
    "Fee %",
    "Status",
    "Apps",
    "Posted",
    "", // actions
] as const;

export function TableView({
    jobs,
    onSelect,
    selectedId,
    onRefresh,
    onUpdateItem,
}: {
    jobs: Job[];
    onSelect: (j: Job) => void;
    selectedId: string | null;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
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
                    {jobs.map((job, idx) => (
                        <TableRow
                            key={job.id}
                            job={job}
                            idx={idx}
                            isSelected={selectedId === job.id}
                            colSpan={COLUMNS.length}
                            onSelect={() => onSelect(job)}
                            onRefresh={onRefresh}
                            onUpdateItem={onUpdateItem}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
