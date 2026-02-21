"use client";

import type { Application } from "../../types";
import { TableRow } from "./table-row";

const COLUMNS = [
    "", // chevron
    "Position",
    "Company",
    "Location",
    "Status",
    "Recruiter",
    "Applied",
    "", // actions
] as const;

export function TableView({
    applications,
    onSelect,
    selectedId,
    onRefresh,
}: {
    applications: Application[];
    onSelect: (app: Application) => void;
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
                    {applications.map((app, idx) => (
                        <TableRow
                            key={app.id}
                            app={app}
                            idx={idx}
                            isSelected={selectedId === app.id}
                            colSpan={COLUMNS.length}
                            onSelect={() => onSelect(app)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
