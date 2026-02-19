"use client";

import type { Job } from "../../types";
import { TableRow } from "./table-row";

const COLUMNS = [
    "",
    "Title",
    "Company",
    "Location",
    "Salary",
    "Type",
    "Status",
    "Posted",
];

const RESPONSIVE_CLASSES = [
    "", // chevron
    "", // title
    "", // company
    "hidden md:table-cell", // location
    "hidden lg:table-cell", // salary
    "hidden xl:table-cell", // type
    "", // status
    "hidden md:table-cell", // posted
];

interface TableViewProps {
    jobs: Job[];
    selectedId: string | null;
    onSelect: (job: Job) => void;
}

export function TableView({ jobs, selectedId, onSelect }: TableViewProps) {
    return (
        <div className="overflow-x-auto border-2 border-base-300">
            <table className="w-full" style={{ minWidth: 700 }}>
                <thead>
                    <tr className="bg-base-200 border-b-2 border-base-300">
                        {COLUMNS.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 ${
                                    i === 0 ? "w-8" : ""
                                } ${RESPONSIVE_CLASSES[i]}`}
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
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
