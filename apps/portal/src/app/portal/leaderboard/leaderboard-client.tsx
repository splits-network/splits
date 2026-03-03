"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { LeaderboardEntryInfo, EntityLevelInfo } from "@splits-network/shared-gamification";
import {
    LeaderboardPodium,
    LeaderboardYourStats,
    LeaderboardNextMilestone,
    useGamification,
} from "@splits-network/shared-gamification";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LeaderboardHero } from "./leaderboard-hero";
import { LeaderboardList } from "./leaderboard-list";
import { LeaderboardFilterBar, HERO_COPY, type EntityType, type Period, type Metric } from "./leaderboard-filters";

export default function LeaderboardClient() {
    const { getToken } = useAuth();
    const { profile } = useUserProfile();
    const { registerEntities, getLevel } = useGamification();
    const mainRef = useRef<HTMLElement>(null);

    const [entityType, setEntityType] = useState<EntityType>("recruiter");
    const [period, setPeriod] = useState<Period>("monthly");
    const [metric, setMetric] = useState<Metric>("total_xp");
    const [entries, setEntries] = useState<LeaderboardEntryInfo[]>([]);
    const [myRank, setMyRank] = useState<LeaderboardEntryInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const myEntityId =
        entityType === "recruiter"
            ? profile?.recruiter_id
            : entityType === "candidate"
              ? profile?.candidate_id
              : null;

    useEffect(() => {
        let cancelled = false;

        async function fetchLeaderboard() {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);

                const params = { entity_type: entityType, period, metric, limit: 50 };
                const [leaderboardRes, rankRes] = await Promise.allSettled([
                    client.get<{ data: LeaderboardEntryInfo[] }>("/leaderboards", { params }),
                    myEntityId
                        ? client.get<{ data: LeaderboardEntryInfo }>("/leaderboards/rank", {
                              params: { entity_type: entityType, entity_id: myEntityId, period, metric },
                          })
                        : Promise.reject("no entity"),
                ]);

                if (cancelled) return;

                if (leaderboardRes.status === "fulfilled" && leaderboardRes.value?.data) {
                    setEntries(leaderboardRes.value.data);
                } else {
                    setEntries([]);
                }

                if (rankRes.status === "fulfilled" && rankRes.value?.data) {
                    setMyRank(rankRes.value.data);
                } else {
                    setMyRank(null);
                }
            } catch {
                setEntries([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchLeaderboard();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityType, period, metric, myEntityId]);

    /* ── Register entities for gamification batch fetch ───────────────── */
    useEffect(() => {
        if (entries.length > 0) {
            registerEntities(entityType, entries.map((e) => e.entity_id));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entries, entityType]);

    const levelMap = useMemo(() => {
        const map = new Map<string, EntityLevelInfo>();
        for (const entry of entries) {
            const level = getLevel(entry.entity_id);
            if (level) map.set(entry.entity_id, level);
        }
        return map;
    }, [entries, getLevel]);

    const myLevel = myEntityId ? getLevel(myEntityId) : undefined;
    const heroCopy = HERO_COPY[entityType];

    /* ── Mount animation ─────────────────────────────────────────────── */
    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                mainRef.current
                    .querySelectorAll("[class*='opacity-0']")
                    .forEach((el) => ((el as HTMLElement).style.opacity = "1"));
                return;
            }

            const $1 = (s: string) => mainRef.current!.querySelector(s);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo($1(".lb-kicker"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" })
                .fromTo(
                    mainRef.current!.querySelectorAll(".lb-title-word"),
                    { opacity: 0, y: 60, rotateX: 30 },
                    { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.1, clearProps: "transform" },
                    "-=0.3",
                )
                .fromTo($1(".lb-subtitle"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" }, "-=0.4")
                .fromTo($1(".lb-stat-bar"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" }, "-=0.2")
                .fromTo($1(".lb-body"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, clearProps: "transform" }, "-=0.2")
                .fromTo(
                    mainRef.current!.querySelectorAll(".lb-sidebar-card"),
                    { opacity: 0, x: 30 },
                    { opacity: 1, x: 0, stagger: 0.12, duration: 0.5, clearProps: "transform" },
                    "-=0.3",
                );
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            <LeaderboardHero title={heroCopy.title} subtitle={heroCopy.subtitle} />

            <section className="lb-body opacity-0 container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <LeaderboardFilterBar
                    entityType={entityType}
                    period={period}
                    metric={metric}
                    onEntityTypeChange={setEntityType}
                    onPeriodChange={setPeriod}
                    onMetricChange={setMetric}
                />

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 max-w-7xl mx-auto">
                    <div className="space-y-6">
                        <LeaderboardPodium entries={entries} myEntityId={myEntityId ?? undefined} levelMap={levelMap} />
                        <LeaderboardList entries={entries} myEntityId={myEntityId} loading={loading} levelMap={levelMap} />
                    </div>

                    <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                        <div className="lb-sidebar-card opacity-0">
                            <LeaderboardYourStats myRank={myRank} level={myLevel} entityType={entityType} period={period} metric={metric} />
                        </div>
                        <div className="lb-sidebar-card opacity-0">
                            <LeaderboardNextMilestone myRank={myRank} entries={entries} />
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="max-w-7xl mx-auto mt-12 bg-base-200 border-l-4 border-primary shadow-sm rounded-none p-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">KEEP CLIMBING</p>
                    <p className="text-lg font-black text-base-content mb-1">Rankings reset. Reputation doesn&apos;t.</p>
                    <p className="text-sm text-base-content/50">
                        Every placement, every badge you earn builds a track record across the network.
                    </p>
                </div>
            </section>
        </main>
    );
}
