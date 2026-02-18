"use client";

import { Button, DetailSection } from "@splits-network/memphis-ui";
import type { Team } from "../../types";
import { formatDate } from "../../types";
import { formatStatus, memberCountDisplay } from "../shared/helpers";

interface SettingsSectionProps {
    team: Team;
}

export function SettingsSection({ team }: SettingsSectionProps) {
    return (
        <div className="space-y-8">
            {/* Split Distribution */}
            <DetailSection
                title="Split Distribution"
                icon="fa-duotone fa-regular fa-percent"
                accent="teal"
            >
                <p className="text-sm text-dark/60 mb-4">
                    Configure how placement fees are distributed among team members.
                    Define split percentages, tiered structures, or custom models.
                </p>
                <Button color="teal">
                    <i className="fa-duotone fa-regular fa-cog mr-2" />
                    Configure Splits
                </Button>
            </DetailSection>

            {/* Team Information */}
            <DetailSection
                title="Team Information"
                icon="fa-duotone fa-regular fa-circle-info"
                accent="purple"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-dark/20">
                        <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Team ID
                        </div>
                        <div className="text-sm font-bold text-dark font-mono truncate">
                            {team.id}
                        </div>
                    </div>
                    <div className="p-4 border-2 border-dark/20">
                        <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Status
                        </div>
                        <div className="text-sm font-bold text-dark">
                            {formatStatus(team.status)}
                        </div>
                    </div>
                    <div className="p-4 border-2 border-dark/20">
                        <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Created
                        </div>
                        <div className="text-sm font-bold text-dark">
                            {formatDate(team.created_at)}
                        </div>
                    </div>
                    <div className="p-4 border-2 border-dark/20">
                        <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Members
                        </div>
                        <div className="text-sm font-bold text-dark">
                            {memberCountDisplay(team)}
                        </div>
                    </div>
                </div>
            </DetailSection>

            {/* Danger Zone */}
            <DetailSection
                title="Danger Zone"
                icon="fa-duotone fa-regular fa-triangle-exclamation"
                accent="coral"
            >
                <p className="text-sm text-dark/60 mb-4">
                    Suspending a team will disable all member access and pause active placements.
                    This action can be reversed.
                </p>
                <Button
                    color="coral"
                    variant="outline"
                    disabled
                >
                    <i className="fa-duotone fa-regular fa-ban mr-2" />
                    Suspend Team
                </Button>
            </DetailSection>
        </div>
    );
}
