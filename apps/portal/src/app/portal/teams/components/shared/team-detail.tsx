"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Badge } from "@splits-network/memphis-ui";
import type { Team, TeamMember } from "../../types";
import { formatCurrency, formatDate, formatMemberRole } from "../../types";
import type { AccentClasses } from "./accent";
import { statusVariant, memberRoleVariant } from "./accent";
import { formatStatus, teamInitials, memberCountDisplay } from "./helpers";
import { TeamActionsToolbar } from "./actions-toolbar";

// Detail Panel (shown in grid sidebar, table expand, split right panel)

export function TeamDetail({
    team,
    members,
    accent,
    onClose,
    onRefresh,
}: {
    team: Team;
    members: TeamMember[];
    accent: AccentClasses;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const previewMembers = members.slice(0, 5);
    const remainingCount = members.length - previewMembers.length;

    return (
        <div>
            {/* Header */}
            <div className={`p-6 border-b-4 ${accent.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2 text-dark">
                            {team.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <Badge color={statusVariant(team.status)}>
                                {formatStatus(team.status)}
                            </Badge>
                            <span className="text-dark/50">|</span>
                            <span className="text-dark/70">
                                <i className="fa-duotone fa-regular fa-calendar mr-1" />
                                Created {formatDate(team.created_at)}
                            </span>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-coral flex-shrink-0"
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
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
                        showActions={{ viewDetails: true, inviteMember: true }}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className={`grid grid-cols-3 border-b-4 ${accent.border}`}>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {team.active_member_count}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Members
                    </div>
                </div>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {team.total_placements}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Placements
                    </div>
                </div>
                <div className="p-4 text-center">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {formatCurrency(team.total_revenue)}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Revenue
                    </div>
                </div>
            </div>

            {/* Members Preview */}
            <div className="p-6">
                <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                    <span className="badge badge-xs badge-teal">
                        <i className="fa-duotone fa-regular fa-users" />
                    </span>
                    Team Members ({members.length})
                </h3>

                {previewMembers.length > 0 ? (
                    <div className="space-y-0">
                        {previewMembers.map((member, idx) => (
                            <div
                                key={member.id}
                                className={`flex items-center gap-3 p-3 ${idx < previewMembers.length - 1 ? "border-b-2 border-cream" : ""}`}
                            >
                                <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border-2 ${accent.border} bg-cream text-xs font-bold text-dark`}>
                                    {teamInitials(member.recruiter.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-dark truncate">
                                        {member.recruiter.name}
                                    </div>
                                    <div className="text-xs text-dark/50 truncate">
                                        {member.recruiter.email}
                                    </div>
                                </div>
                                <Badge color={memberRoleVariant(member.role)} size="sm" variant="outline">
                                    {formatMemberRole(member.role)}
                                </Badge>
                            </div>
                        ))}
                        {remainingCount > 0 && (
                            <a
                                href={`/portal/teams/${team.id}`}
                                className="block text-center text-sm font-bold text-teal mt-3 hover:underline"
                            >
                                View all {members.length} members
                            </a>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-dark/50">No members yet</p>
                )}

                {/* Team Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                    <div className="p-3 border-2 border-dark/20">
                        <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Team ID
                        </div>
                        <div className="text-sm font-bold text-dark truncate">
                            {team.id}
                        </div>
                    </div>
                    <div className="p-3 border-2 border-dark/20">
                        <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Status
                        </div>
                        <div className="text-sm font-bold text-dark">
                            {formatStatus(team.status)}
                        </div>
                    </div>
                    <div className="p-3 border-2 border-dark/20">
                        <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Created
                        </div>
                        <div className="text-sm font-bold text-dark">
                            {formatDate(team.created_at)}
                        </div>
                    </div>
                    <div className="p-3 border-2 border-dark/20">
                        <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Total Members
                        </div>
                        <div className="text-sm font-bold text-dark">
                            {memberCountDisplay(team)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Detail Loading Wrapper (fetches members only, receives team from list data)

export function TeamDetailLoader({
    team,
    accent,
    onClose,
    onRefresh,
}: {
    team: Team;
    accent: AccentClasses;
    onClose: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
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
                const res = await client.get(`/teams/${team.id}/members`);
                if (!cancelled) setMembers(res.data || []);
            } catch (err) {
                console.error("Failed to fetch team members:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [team.id]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="flex justify-center gap-3 mb-4">
                        <div className="w-4 h-4 bg-coral animate-pulse" />
                        <div className="w-4 h-4 rounded-full bg-teal animate-pulse" />
                        <div className="w-4 h-4 rotate-45 bg-yellow animate-pulse" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Loading details...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <TeamDetail
            team={team}
            members={members}
            accent={accent}
            onClose={onClose}
            onRefresh={onRefresh}
        />
    );
}
