"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { SettingsNav } from "@splits-network/memphis-ui";
import { LoadingState } from "@splits-network/shared-ui";
import type { Team, TeamMember } from "../types";
import { formatCurrency, formatDate } from "../types";
import { TeamDetailAnimator } from "./team-detail-animator";
import { MembersSection } from "../components/detail/members-section";
import { SettingsSection } from "../components/detail/settings-section";

type DetailTab = "members" | "settings";

const NAV_ITEMS = [
    {
        key: "members" as const,
        label: "Members",
        icon: "fa-duotone fa-regular fa-users",
        accent: "coral" as const,
    },
    {
        key: "settings" as const,
        label: "Settings",
        icon: "fa-duotone fa-regular fa-cog",
        accent: "teal" as const,
    },
];

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
            const [teamRes, membersRes] = await Promise.all([
                client.get(`/teams/${teamId}`),
                client.get(`/teams/${teamId}/members`),
            ]);

            setTeam(teamRes.data);
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
                <div className="border-4 border-coral bg-coral-light p-6">
                    <p className="text-sm font-bold text-dark">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-coral mr-2" />
                        {error || "Team not found"}
                    </p>
                    <a
                        href="/portal/teams"
                        className="btn btn-sm btn-ghost mt-4"
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
            <section className="bg-dark -mx-2 -mt-2">
                <div className="relative overflow-hidden py-16 bg-dark -mx-2 -mt-4">
                    {/* Memphis shapes */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-16 h-16 rounded-full border-4 border-teal opacity-0" />
                        <div className="memphis-shape absolute top-[45%] right-[8%] w-12 h-12 rounded-full bg-coral opacity-0" />
                        <div className="memphis-shape absolute bottom-[12%] left-[15%] w-8 h-8 rotate-45 bg-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[25%] right-[20%] w-10 h-10 rotate-12 bg-purple opacity-0" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-5xl mx-auto">
                            {/* Back button */}
                            <a
                                href="/portal/teams"
                                className="header-badge inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white mb-6 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left" />
                                Back to Teams
                            </a>

                            <h1 className="header-title text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-4 text-white opacity-0">
                                {team.name}
                            </h1>

                            <div className="header-subtitle flex flex-wrap items-center gap-4 text-white/70 opacity-0">
                                <span className={`badge ${team.status === "active" ? "badge-teal" : "badge-coral"} badge-lg`}>
                                    {team.status === "active" ? "Active" : "Suspended"}
                                </span>
                                <span>
                                    <i className="fa-duotone fa-regular fa-calendar mr-1" />
                                    Created {formatDate(team.created_at)}
                                </span>
                                <span>
                                    <i className="fa-duotone fa-regular fa-users mr-1" />
                                    {team.active_member_count} members
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="retro-metrics grid grid-cols-1 sm:grid-cols-3 w-full">
                    <div className="metric-block metric-block-sm bg-coral text-coral-content">
                        <div className="retro-metric-value">{team.active_member_count}</div>
                        <div className="retro-metric-label">Members</div>
                    </div>
                    <div className="metric-block metric-block-sm bg-teal text-teal-content">
                        <div className="retro-metric-value">{team.total_placements}</div>
                        <div className="retro-metric-label">Placements</div>
                    </div>
                    <div className="metric-block metric-block-sm bg-yellow text-yellow-content">
                        <div className="retro-metric-value">{formatCurrency(team.total_revenue)}</div>
                        <div className="retro-metric-label">Revenue</div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="min-h-screen bg-cream">
                <div className="py-8 px-4 lg:px-8">
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
                        {/* Sidebar Nav */}
                        <div className="detail-tabs lg:col-span-1 opacity-0">
                            <SettingsNav
                                items={NAV_ITEMS}
                                active={activeTab}
                                onChange={(key) => setActiveTab(key as DetailTab)}
                            />
                        </div>

                        {/* Tab Content */}
                        <div className="detail-content lg:col-span-3 opacity-0">
                            {activeTab === "members" && (
                                <MembersSection
                                    teamId={teamId}
                                    members={members}
                                    onRefresh={loadTeamData}
                                />
                            )}

                            {activeTab === "settings" && (
                                <SettingsSection team={team} />
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </TeamDetailAnimator>
    );
}
