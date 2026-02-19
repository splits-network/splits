"use client";

import type { Team } from "../../types";
import { formatCurrency, formatDate } from "../../types";
import { statusColor } from "../shared/status-color";
import { formatStatus, memberCountDisplay } from "../shared/helpers";

interface SettingsSectionProps {
    team: Team;
    onRefresh: () => void;
}

export function SettingsSection({ team, onRefresh }: SettingsSectionProps) {
    return (
        <div className="space-y-8">
            {/* Section 1: Team Information */}
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                    Team Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Team ID
                        </p>
                        <p className="font-bold text-sm font-mono truncate">
                            {team.id}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Status
                        </p>
                        <span
                            className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(team.status)}`}
                        >
                            {formatStatus(team.status)}
                        </span>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Created
                        </p>
                        <p className="font-bold text-sm">
                            {formatDate(team.created_at)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Members
                        </p>
                        <p className="font-bold text-sm">
                            {memberCountDisplay(team)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Total Placements
                        </p>
                        <p className="font-bold text-sm">
                            {team.total_placements}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Total Revenue
                        </p>
                        <p className="font-bold text-sm">
                            {formatCurrency(team.total_revenue)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 2: Split Distribution */}
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                    Split Distribution
                </h3>
                <div className="bg-info/10 text-info text-sm p-4">
                    Split configuration coming soon
                </div>
            </div>

            {/* Section 3: Danger Zone */}
            <div className="border-2 border-error/20 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-error mb-4">
                    Danger Zone
                </h3>
                <p className="text-sm text-base-content/60 mb-4">
                    Suspending a team will disable all member access and pause
                    active placements. This action can be reversed.
                </p>
                <button
                    className="btn btn-sm btn-error btn-outline"
                    style={{ borderRadius: 0 }}
                    disabled
                >
                    <i className="fa-duotone fa-regular fa-ban mr-2" />
                    {team.status === "active" ? "Suspend Team" : "Activate Team"}
                </button>
            </div>
        </div>
    );
}
