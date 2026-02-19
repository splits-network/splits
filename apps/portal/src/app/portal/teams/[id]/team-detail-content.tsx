"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@splits-network/shared-ui";
import type { Team, TeamMember } from "../types";
import { formatCurrency } from "../types";
import { statusColor } from "../components/shared/status-color";
import { formatStatus, teamInitials, memberCountDisplay } from "../components/shared/helpers";
import { TeamDetailAnimator } from "./team-detail-animator";
import { MembersSection } from "../components/detail/members-section";
import { SettingsSection } from "../components/detail/settings-section";

type DetailTab = "members" | "settings";

const VALID_TABS = new Set<string>(["members", "settings"]);

interface TeamDetailContentProps {
    teamId: string;
}

export default function TeamDetailContent({ teamId }: TeamDetailContentProps) {
    const { getToken } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<DetailTab>(() => {
        const tab = searchParams.get("tab");
        return tab && VALID_TABS.has(tab) ? (tab as DetailTab) : "members";
    });

    // Sync tab to URL
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (activeTab !== "members") {
            params.set("tab", activeTab);
        } else {
            params.delete("tab");
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        const currentQuery = searchParamsRef.current.toString();
        const currentUrl = currentQuery
            ? `${pathname}?${currentQuery}`
            : pathname;

        if (newUrl !== currentUrl) {
            router.replace(newUrl, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, pathname, router]);

    const loadTeamData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const teamRes = await client.get(`/teams/${teamId}`);
            setTeam(teamRes.data);

            const membersRes = await client.get(`/teams/${teamId}/members`);
            setMembers(membersRes.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamId]);

    useEffect(() => {
        loadTeamData();
    }, [loadTeamData]);

    if (loading) {
        return <LoadingState message="Loading team..." />;
    }

    if (error || !team) {
        return (
            <div className="p-8">
                <div className="border-2 border-error/30 bg-error/5 p-6">
                    <p className="text-sm font-bold">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error mr-2" />
                        {error || "Team not found"}
                    </p>
                    <a
                        href="/portal/teams"
                        className="btn btn-sm btn-ghost mt-4"
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left mr-2" />
                        Back to Teams
                    </a>
                </div>
            </div>
        );
    }

    return (
        <TeamDetailAnimator>
            {/* Header */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl">
                        {/* Back link */}
                        <a
                            href="/portal/teams"
                            className="detail-badge inline-flex items-center gap-2 text-sm font-semibold text-neutral-content/50 hover:text-neutral-content mb-6 opacity-0"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-left" />
                            Back to Teams
                        </a>

                        {/* Status badge */}
                        <div className="mb-4">
                            <span
                                className={`detail-badge text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 opacity-0 ${statusColor(team.status)}`}
                            >
                                {formatStatus(team.status)}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="detail-title text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[0.92] mb-4 opacity-0">
                            {team.name}
                        </h1>

                        {/* Subtitle */}
                        <p className="detail-subtitle text-base-content/60 text-lg mb-8 opacity-0">
                            {memberCountDisplay(team)}
                        </p>

                        {/* Stats row */}
                        <div className="flex flex-wrap gap-8">
                            <div className="detail-stat opacity-0">
                                <div className="text-2xl font-black tracking-tight text-primary">
                                    {team.active_member_count}
                                </div>
                                <div className="text-xs uppercase tracking-wider text-neutral-content/40">
                                    Members
                                </div>
                            </div>
                            <div className="detail-stat opacity-0">
                                <div className="text-2xl font-black tracking-tight text-primary">
                                    {team.total_placements}
                                </div>
                                <div className="text-xs uppercase tracking-wider text-neutral-content/40">
                                    Placements
                                </div>
                            </div>
                            <div className="detail-stat opacity-0">
                                <div className="text-2xl font-black tracking-tight text-primary">
                                    {formatCurrency(team.total_revenue)}
                                </div>
                                <div className="text-xs uppercase tracking-wider text-neutral-content/40">
                                    Revenue
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diagonal clip-path accent */}
                <div
                    className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/5 hidden lg:block"
                    style={{
                        clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                />
            </section>

            {/* Tab bar */}
            <div className="detail-tabs opacity-0 container mx-auto px-6 lg:px-12 pt-8">
                <div className="flex bg-base-200 p-1 w-fit">
                    <button
                        type="button"
                        className={`px-5 py-2 text-sm font-semibold transition-colors ${
                            activeTab === "members"
                                ? "bg-primary text-primary-content"
                                : "text-base-content/50 hover:text-base-content/70"
                        }`}
                        style={{ borderRadius: 0 }}
                        onClick={() => setActiveTab("members")}
                    >
                        Members
                    </button>
                    <button
                        type="button"
                        className={`px-5 py-2 text-sm font-semibold transition-colors ${
                            activeTab === "settings"
                                ? "bg-primary text-primary-content"
                                : "text-base-content/50 hover:text-base-content/70"
                        }`}
                        style={{ borderRadius: 0 }}
                        onClick={() => setActiveTab("settings")}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {/* Content area */}
            <div className="detail-content opacity-0 container mx-auto px-6 lg:px-12 py-8">
                {activeTab === "members" && (
                    <MembersSection
                        team={team}
                        members={members}
                        onRefresh={loadTeamData}
                    />
                )}
                {activeTab === "settings" && (
                    <SettingsSection
                        team={team}
                        onRefresh={loadTeamData}
                    />
                )}
            </div>
        </TeamDetailAnimator>
    );
}
