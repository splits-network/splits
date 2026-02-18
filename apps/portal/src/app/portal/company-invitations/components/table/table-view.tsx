"use client";

import type { RecruiterCompanyRelationship } from "../../types";
import { accentAt } from "../shared/accent";
import { TableRow } from "./table-row";

export function TableView({
    invitations,
    onSelect,
    selectedId,
    onRefresh,
}: {
    invitations: RecruiterCompanyRelationship[];
    onSelect: (inv: RecruiterCompanyRelationship) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const columns = ["", "Name", "Details", "Type", "Status", "Jobs", "Received", ""];

    return (
        <div className="overflow-x-auto border-4 border-dark">
            <table className="w-full min-w-[800px]">
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
                    {invitations.map((invitation, idx) => (
                        <TableRow
                            key={invitation.id}
                            invitation={invitation}
                            accent={accentAt(idx)}
                            idx={idx}
                            isSelected={selectedId === invitation.id}
                            colSpan={columns.length}
                            onSelect={() => onSelect(invitation)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
