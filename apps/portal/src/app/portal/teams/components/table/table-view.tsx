"use client";

import type { Team } from "../../types";
import { accentAt } from "../shared/accent";
import { TableRow } from "./table-row";

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
    const columns = ["", "Team", "Status", "Members", "Placements", "Revenue", "Created", ""];

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
                    {teams.map((team, idx) => (
                        <TableRow
                            key={team.id}
                            team={team}
                            accent={accentAt(idx)}
                            idx={idx}
                            isSelected={selectedId === team.id}
                            colSpan={columns.length}
                            onSelect={() => onSelect(team)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
