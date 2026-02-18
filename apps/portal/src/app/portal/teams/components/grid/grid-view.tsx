"use client";

import type { Team } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
import { TeamDetailLoader } from "../shared/team-detail";
import { GridCard } from "./grid-card";

export function GridView({
    teams,
    onSelectAction,
    selectedId,
    onRefreshAction,
}: {
    teams: Team[];
    onSelectAction: (t: Team) => void;
    selectedId: string | null;
    onRefreshAction?: () => void;
}) {
    const selectedTeam = teams.find((t) => t.id === selectedId);
    const selectedAc = selectedTeam
        ? accentAt(teams.indexOf(selectedTeam))
        : ACCENT[0];

    return (
        <div className="flex gap-6">
            <div className="flex flex-col w-full">
                <div
                    className={`grid gap-4 w-full ${
                        selectedTeam
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
                    {teams.map((team, idx) => (
                        <GridCard
                            key={team.id}
                            team={team}
                            accent={accentAt(idx)}
                            isSelected={selectedId === team.id}
                            onSelect={() => onSelectAction(team)}
                            onRefresh={onRefreshAction}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedTeam && (
                <div
                    className={`w-1/2 border-4 flex-shrink-0 self-start bg-white ${selectedAc.border}`}
                >
                    <TeamDetailLoader
                        team={selectedTeam}
                        accent={selectedAc}
                        onClose={() => onSelectAction(selectedTeam)}
                        onRefresh={onRefreshAction}
                    />
                </div>
            )}
        </div>
    );
}
