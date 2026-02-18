"use client";

import type { RecruiterWithUser } from "../../types";
import { accentAt } from "../shared/accent";
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
    const columns = ["", "Name", "Location", "Specialties", "Placements", "Reputation", "Experience", "Status", "Joined", ""];

    return (
        <div className="overflow-x-auto border-4 border-dark">
            <table className="w-full" style={{ minWidth: 1000 }}>
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
                    {recruiters.map((recruiter, idx) => (
                        <TableRow
                            key={recruiter.id}
                            recruiter={recruiter}
                            accent={accentAt(idx)}
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
