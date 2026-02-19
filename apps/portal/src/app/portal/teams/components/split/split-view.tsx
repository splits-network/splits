"use client";

import type { Team } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { TeamDetailLoader } from "../shared/team-detail";
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
    const selectedTeam = teams.find((t) => t.id === selectedId) ?? null;

    return (
        <div className="container mx-auto px-6 lg:px-12 py-6">
            <div
                className="flex border-2 border-base-300"
                style={{ minHeight: 600 }}
            >
                {/* Left list — hidden on mobile when a team is selected */}
                <div
                    className={`w-full md:w-2/5 border-r-2 border-base-300 overflow-y-auto ${
                        selectedId ? "hidden md:block" : "block"
                    }`}
                >
                    {teams.map((team) => (
                        <SplitItem
                            key={team.id}
                            team={team}
                            isSelected={selectedId === team.id}
                            onSelect={() => onSelect(team)}
                        />
                    ))}
                </div>

                {/* Right detail — MobileDetailOverlay handles mobile portal */}
                <MobileDetailOverlay
                    isOpen={!!selectedTeam}
                    className="md:w-3/5 w-full bg-base-100"
                >
                    {selectedTeam ? (
                        <TeamDetailLoader
                            teamId={selectedTeam.id}
                            onClose={() => onSelect(selectedTeam)}
                            onRefresh={onRefresh}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center p-12">
                            <div className="text-center">
                                <i className="fa-duotone fa-regular fa-hand-pointer text-5xl text-base-content/30 mb-4" />
                                <h3 className="font-bold text-base text-base-content/30 tracking-tight">
                                    Select a team to view details
                                </h3>
                            </div>
                        </div>
                    )}
                </MobileDetailOverlay>
            </div>
        </div>
    );
}
