"use client";

import type { Team } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
import { TeamDetailLoader } from "../shared/team-detail";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { SplitItem } from "./split-item";

export function SplitView({
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
    const selectedTeam = teams.find((t) => t.id === selectedId);
    const selectedAc = selectedTeam ? accentAt(teams.indexOf(selectedTeam)) : ACCENT[0];

    return (
        <div className="flex gap-0 border-4 border-dark" style={{ minHeight: 600 }}>
            {/* Left list */}
            <div className={`w-full md:w-2/5 border-r-4 border-dark overflow-y-auto ${selectedId ? "hidden md:block" : "block"}`}>
                {teams.map((team, idx) => (
                    <SplitItem
                        key={team.id}
                        team={team}
                        accent={accentAt(idx)}
                        isSelected={selectedId === team.id}
                        onSelect={() => onSelect(team)}
                    />
                ))}
            </div>

            {/* Right detail */}
            <MobileDetailOverlay
                isOpen={!!selectedTeam}
                className="md:w-3/5 w-full bg-white overflow-y-auto"
            >
                {selectedTeam ? (
                    <TeamDetailLoader
                        team={selectedTeam}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedTeam)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-yellow" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-dark">
                                Select a Team
                            </h3>
                            <p className="text-sm text-dark/50">
                                Click a team on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
