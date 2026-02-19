"use client";

import type { Application } from "../../types";
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
    const columns = ["", "Candidate", "Role", "Stage", "AI", "Submitted", ""];

    return (
        <div className="overflow-x-auto">
            <table className="table w-full" style={{ minWidth: 900 }}>
                <thead>
                    <tr className="bg-base-200 border-b-2 border-base-300">
                        {columns.map((h, i) => (
                            <th
                                key={i}
                                className={`text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 py-2 px-4 ${
                                    i === 0 ? "w-6 pl-4 pr-1" : ""
                                } ${i === columns.length - 1 ? "w-20 text-right" : ""}`}
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
