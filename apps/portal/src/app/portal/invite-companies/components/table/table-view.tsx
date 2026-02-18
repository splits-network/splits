"use client";

import type { CompanyInvitation } from "../../types";
import { accentAt } from "../shared/accent";
import { TableRow } from "./table-row";

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
    const columns = ["", "Company", "Email", "Code", "Status", "Created", "Expires", ""];

    return (
        <div className="overflow-x-auto border-4 border-dark">
            <table className="w-full" style={{ minWidth: 800 }}>
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
                    {invitations.map((inv, idx) => (
                        <TableRow
                            key={inv.id}
                            invitation={inv}
                            accent={accentAt(idx)}
                            idx={idx}
                            isSelected={selectedId === inv.id}
                            colSpan={columns.length}
                            onSelect={() => onSelect(inv)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
