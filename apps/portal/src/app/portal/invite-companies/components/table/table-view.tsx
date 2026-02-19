"use client";

import type { CompanyInvitation } from "../../types";
import { TableRow } from "./table-row";

const COLUMNS = [
    "",           // chevron
    "Company",
    "Email",
    "Code",
    "Status",
    "Created",
    "Expires",
    "",           // actions
] as const;

export function TableView({
    invitations,
    onSelect,
    selectedId,
    onRefresh,
}: {
    invitations: CompanyInvitation[];
    onSelect: (inv: CompanyInvitation) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    return (
        <div className="overflow-x-auto border-2 border-base-300">
            <table className="w-full" style={{ minWidth: 800 }}>
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
                    {invitations.map((inv, idx) => (
                        <TableRow
                            key={inv.id}
                            invitation={inv}
                            idx={idx}
                            isSelected={selectedId === inv.id}
                            colSpan={COLUMNS.length}
                            onSelect={() => onSelect(inv)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
