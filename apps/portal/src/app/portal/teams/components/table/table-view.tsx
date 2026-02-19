"use client";

import type { Team } from "../../types";
import { TableRow } from "./table-row";

const COLUMNS = [
    "",          // chevron
    "Team",
    "Status",
    "Members",
    "Placements",
    "Revenue",
    "Created",
    "",          // actions
] as const;

export function TableView({
    teams,
    onSelect,
    selectedId,
    onRefresh,
}: {
    teams: Team[];
    onSelect: (t: Team) => void;
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
                                    className={`px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 ${i === 0 ? "w-8" : ""} ${i === COLUMNS.length - 1 ? "w-24" : ""}`}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team, idx) => (
                            <TableRow
                                key={team.id}
                                team={team}
                                idx={idx}
                                isSelected={selectedId === team.id}
                                colSpan={COLUMNS.length}
                                onSelect={() => onSelect(team)}
                                onRefresh={onRefresh}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
