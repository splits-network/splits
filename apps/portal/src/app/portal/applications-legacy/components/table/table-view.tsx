"use client";

import type { Application } from "../../types";
import { accentAt } from "../shared/accent";
import { TableRow } from "./table-row";

export function TableView({
    applications,
    onSelect,
    selectedId,
    onRefresh,
}: {
    applications: Application[];
    onSelect: (a: Application) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const columns = ["", "Candidate", "Role", "Stage", "AI Score", "Added", ""];

    return (
        <div className="overflow-x-auto border-4 border-dark">
            <table className="w-full" style={{ minWidth: 900 }}>
                <thead>
                    <tr className="bg-dark">
                        {columns.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-sm font-black uppercase tracking-wider ${
                                    i === 0 ? "w-8" : ""
                                } ${i === columns.length - 1 ? "w-20" : ""} ${accentAt(i).text}`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {applications.map((application, idx) => (
                        <TableRow
                            key={application.id}
                            application={application}
                            accent={accentAt(idx)}
                            idx={idx}
                            isSelected={selectedId === application.id}
                            colSpan={columns.length}
                            onSelect={() => onSelect(application)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
