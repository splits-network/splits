"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Team, TeamMember } from "../../types";
import {
    formatCurrency,
    formatDate,
    formatMemberRole,
    formatMemberStatus,
} from "../../types";
import {
    statusColor,
    memberRoleColor,
    memberStatusColor,
} from "./status-color";
import { formatStatus, teamInitials, memberCountDisplay } from "./helpers";
import { TeamActionsToolbar } from "./actions-toolbar";

/* ─── Detail Panel ───────────────────────────────────────────────────────── */

export function TeamDetail({
    team,
    members,
    onClose,
    onRefresh,
}: {
    team: Team;
    members: TeamMember[];
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const previewMembers = members.slice(0, 5);
    const remainingCount = members.length - previewMembers.length;

    return (
        <div>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-base-100 border-b-2 border-base-300 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 ${statusColor(team.status)}`}
                            >
                                {formatStatus(team.status)}
                            </span>
                        </div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                            {memberCountDisplay(team)}
                        </p>
                        <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-3">
                            {team.name}
                        </h2>
                        <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                            <span>
                                <i className="fa-duotone fa-regular fa-calendar mr-1" />
                                Created {formatDate(team.created_at)}
                            </span>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4">
                    <TeamActionsToolbar
                        team={team}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{ viewDetails: false }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Members
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {team.active_member_count}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Placements
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {team.total_placements}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Revenue
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {formatCurrency(team.total_revenue)}
                        </p>
                    </div>
                </div>

                {/* Members preview */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Team Members ({members.length})
                    </h3>
                    {previewMembers.length > 0 ? (
                        <div className="space-y-0">
                            {previewMembers.map((member, idx) => (
                                <div
                                    key={member.id}
                                    className={`flex items-center gap-3 p-3 ${idx < previewMembers.length - 1 ? "border-b-2 border-base-300" : ""}`}
                                >
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border-2 border-base-300 bg-base-200 text-xs font-bold">
                                        {teamInitials(
                                            member.recruiter.user?.name,
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold truncate">
                                            {member.recruiter.user?.name}
                                        </div>
                                        <div className="text-xs text-base-content/50 truncate">
                                            {member.recruiter.user?.email}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 ${memberRoleColor(member.role)}`}
                                        >
                                            {formatMemberRole(member.role)}
                                        </span>
                                        <span
                                            className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 ${memberStatusColor(member.status)}`}
                                        >
                                            {formatMemberStatus(member.status)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {remainingCount > 0 && (
                                <a
                                    href={`/portal/teams/${team.id}`}
                                    className="block text-center text-sm font-bold text-primary mt-3 hover:underline"
                                >
                                    View all {members.length} members
                                </a>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-base-content/50">
                            No members yet
                        </p>
                    )}
                </div>

                {/* Team info grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
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
                            Status
                        </p>
                        <p className="font-bold text-sm">
                            {formatStatus(team.status)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Owner
                        </p>
                        <p className="font-bold text-sm truncate">
                            {team.owner_user_id}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Detail Loading Wrapper ─────────────────────────────────────────────── */

export function TeamDetailLoader({
    teamId,
    team,
    onClose,
    onRefresh,
}: {
    teamId: string;
    team?: Team;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [loadedTeam, setLoadedTeam] = useState<Team | null>(team || null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);

                // Fetch team if not provided
                if (!team) {
                    const teamRes = await client.get<{ data: Team }>(
                        `/teams/${teamId}`,
                    );
                    if (!cancelled) setLoadedTeam(teamRes.data);
                }

                // Fetch members
                const membersRes = await client.get(`/teams/${teamId}/members`);
                if (!cancelled) setMembers(membersRes.data || []);
            } catch (err) {
                console.error("Failed to fetch team details:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamId]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                        Loading team...
                    </span>
                </div>
            </div>
        );
    }

    const resolvedTeam = team || loadedTeam;
    if (!resolvedTeam) return null;

    return (
        <TeamDetail
            team={resolvedTeam}
            members={members}
            onClose={onClose}
            onRefresh={onRefresh}
        />
    );
}
