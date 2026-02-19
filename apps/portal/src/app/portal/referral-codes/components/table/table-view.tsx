"use client";

import type { RecruiterCode } from "../../types";
import { TableRow } from "./table-row";

const COLUMNS = [
    "Code",
    "Label",
    "Status",
    "Signups",
    "Created",
    "",  // actions
] as const;

export function TableView({
    codes,
    onRefresh,
}: {
    codes: RecruiterCode[];
    onRefresh?: () => void;
}) {
    return (
        <div className="overflow-x-auto border-2 border-base-300">
            <table className="w-full" style={{ minWidth: 700 }}>
                <thead>
                    <tr className="bg-base-200 border-b-2 border-base-300">
                        {COLUMNS.map((h, i) => (
                            <th
                                key={i}
                                className={`px-6 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 ${
                                    i === COLUMNS.length - 1 ? "text-right" : ""
                                }`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {codes.map((code, idx) => (
                        <TableRow
                            key={code.id}
                            code={code}
                            idx={idx}
                            onRefresh={onRefresh}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
