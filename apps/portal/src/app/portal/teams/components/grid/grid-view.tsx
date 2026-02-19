"use client";

import type { Team } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
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
    const selectedTeam = teams.find((t) => t.id === selectedId) ?? null;

    return (
        <div className="flex gap-6">
            {/* Card grid — hidden on mobile when a detail is open */}
            <div
                className={`flex flex-col w-full ${selectedTeam ? "hidden md:flex" : "flex"}`}
            >
                <div
                    className={`grid gap-4 w-full ${
                        selectedTeam
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
                    {teams.map((team) => (
                        <GridCard
                            key={team.id}
                            team={team}
                            isSelected={selectedId === team.id}
                            onSelect={() => onSelectAction(team)}
                            onRefresh={onRefreshAction}
                        />
                    ))}
                </div>
            </div>

            {/* Detail sidebar — 50% width on desktop, full-screen overlay on mobile */}
            {selectedTeam && (
                <MobileDetailOverlay
                    isOpen
                    className="md:w-1/2 md:border-2 md:border-base-300 md:flex-shrink-0 md:self-start bg-base-100"
                >
                    <TeamDetailLoader
                        teamId={selectedTeam.id}
                        onClose={() => onSelectAction(selectedTeam)}
                        onRefresh={onRefreshAction}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
