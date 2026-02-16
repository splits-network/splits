"use client";

import type { Job } from "../../types";
import { accentAt } from "../shared/accent";
import { TableRow } from "./table-row";

export function TableView({
    jobs,
    onSelect,
    selectedId,
    onRefresh,
}: {
    jobs: Job[];
    onSelect: (j: Job) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const columns = ["", "Title", "Company", "Location", "Salary", "Fee %", "Status", "Apps", "Posted", ""];

    return (
        <div className="overflow-x-auto border-4 border-dark">
            <table className="w-full" style={{ minWidth: 900 }}>
                <thead>
                    <tr className="bg-dark">
                        {columns.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-sm font-black uppercase tracking-wider ${i === 0 ? "w-8" : ""} ${i === columns.length - 1 ? "w-20" : ""} ${accentAt(i).text}`}
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
                            accent={accentAt(idx)}
                            idx={idx}
                            isSelected={selectedId === job.id}
                            colSpan={columns.length}
                            onSelect={() => onSelect(job)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
