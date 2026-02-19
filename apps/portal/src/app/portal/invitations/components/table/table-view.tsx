"use client";

import type { Invitation } from "../../types";
import { TableRow } from "./table-row";

const COLUMNS = [
    "",           // chevron
    "Candidate",
    "Email",
    "Title",
    "Status",
    "Location",
    "Invited",
    "",           // actions
] as const;

export function TableView({
    invitations,
    onSelect,
    selectedId,
    onRefresh,
}: {
    invitations: Invitation[];
    onSelect: (inv: Invitation) => void;
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
                    {invitations.map((invitation, idx) => (
                        <TableRow
                            key={invitation.id}
                            invitation={invitation}
                            idx={idx}
                            isSelected={selectedId === invitation.id}
                            colSpan={COLUMNS.length}
                            onSelect={() => onSelect(invitation)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
