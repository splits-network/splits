"use client";

import type { Firm } from "../../types";
import { TableRow } from "./table-row";

const COLUMNS = [
    "", // chevron
    "Firm",
    "Status",
    "Members",
    "Placements",
    "Revenue",
    "Created",
    "", // actions
] as const;

export function TableView({
    firms,
    onSelect,
    selectedId,
    onRefresh,
}: {
    firms: Firm[];
    onSelect: (t: Firm) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    return (
        <div className="container mx-auto px-6 lg:px-12 py-6">
            <div className="overflow-x-auto border-2 border-base-300">
                <table className="w-full" style={{ minWidth: 800 }}>
                    <thead>
                        <tr className="bg-base-200 border-b-2 border-base-300">
                            {COLUMNS.map((h, i) => (
                                <th
                                    key={i}
                                    className={`px-4 py-3 text-left text-sm uppercase tracking-[0.2em] font-bold text-base-content/40 ${i === 0 ? "w-8" : ""} ${i === COLUMNS.length - 1 ? "w-24" : ""}`}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {firms.map((firm, idx) => (
                            <TableRow
                                key={firm.id}
                                firm={firm}
                                idx={idx}
                                isSelected={selectedId === firm.id}
                                colSpan={COLUMNS.length}
                                onSelect={() => onSelect(firm)}
                                onRefresh={onRefresh}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
