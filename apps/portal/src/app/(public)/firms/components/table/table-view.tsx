"use client";

import type { PublicFirm } from "../../types";
import { TableRow } from "./table-row";

const COLUMNS = ["", "Name", "Location", "Industries", "Partnership", "Founded"];

const RESPONSIVE_CLASSES = [
    "",              // chevron
    "",              // name
    "hidden md:table-cell", // location
    "hidden lg:table-cell", // industries
    "",              // partnership
    "hidden xl:table-cell", // founded
];

interface TableViewProps {
    firms: PublicFirm[];
    selectedId: string | null;
    onSelect: (firm: PublicFirm) => void;
}

export function TableView({ firms, selectedId, onSelect }: TableViewProps) {
    return (
        <div className="overflow-x-auto border-2 border-base-300">
            <table className="w-full" style={{ minWidth: 700 }}>
                <thead>
                    <tr className="bg-base-200 border-b-2 border-base-300">
                        {COLUMNS.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-sm uppercase tracking-[0.2em] font-bold text-base-content/40 ${
                                    i === 0 ? "w-8" : ""
                                } ${RESPONSIVE_CLASSES[i]}`}
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
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
