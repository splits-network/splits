"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    useGamification,
    LeaderboardPodium,
    LeaderboardYourStats,
    LeaderboardNextMilestone,
} from "@splits-network/shared-gamification";
import type { LeaderboardEntryInfo, EntityLevelInfo } from "@splits-network/shared-gamification";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LeaderboardHero } from "./leaderboard-hero";
import { LeaderboardList } from "./leaderboard-list";

type Period = "weekly" | "monthly" | "quarterly" | "all_time";
type Metric = "total_xp" | "placements" | "hire_rate";

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
    { key: "weekly", label: "This Week" },  { key: "monthly", label: "This Month" },
    { key: "quarterly", label: "This Quarter" },  { key: "all_time", label: "All Time" },
];
const METRIC_OPTIONS: { key: Metric; label: string }[] = [
    { key: "total_xp", label: "Total XP" },  { key: "placements", label: "Placements" },
    { key: "hire_rate", label: "Hire Rate" },
];

export default function LeaderboardClient() {
    const { getToken } = useAuth();
    const { profile } = useUserProfile();
    const { registerEntities, getLevel } = useGamification();
    const mainRef = useRef<HTMLElement>(null);

    const [period, setPeriod] = useState<Period>("monthly");
    const [metric, setMetric] = useState<Metric>("total_xp");
    const [entries, setEntries] = useState<LeaderboardEntryInfo[]>([]);
    const [myRank, setMyRank] = useState<LeaderboardEntryInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const myEntityId = profile?.candidate_id ?? null;

    useEffect(() => {
        let cancelled = false;

        async function fetchLeaderboard() {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);

                const params = { entity_type: "candidate", period, metric, limit: 50 };
                const [leaderboardRes, rankRes] = await Promise.allSettled([
                    client.get<{ data: LeaderboardEntryInfo[] }>("/leaderboards", { params }),
                    myEntityId
                        ? client.get<{ data: LeaderboardEntryInfo }>("/leaderboards/rank", {
                              params: { entity_type: "candidate", entity_id: myEntityId, period, metric },
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
    }, [period, metric, myEntityId]);

    /* ── Register entities for gamification ─────────────────────────────── */
    useEffect(() => {
        if (entries.length > 0) {
            registerEntities("candidate", entries.map((e) => e.entity_id));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entries]);

    const levelMap = useMemo(() => {
        const map = new Map<string, EntityLevelInfo>();
        for (const entry of entries) {
            const level = getLevel(entry.entity_id);
            if (level) map.set(entry.entity_id, level);
        }
        return map;
    }, [entries, getLevel]);
    const myLevel = myEntityId ? getLevel(myEntityId) : undefined;

    /* ── Mount animation ─────────────────────────────────────────────────── */
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
            const tl = gsap.timeline({ defaults: { ease: "power3.out", clearProps: "transform" } });

            tl.fromTo($1(".lb-kicker"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" })
                .fromTo(
                    mainRef.current!.querySelectorAll(".lb-title-word"),
                    { opacity: 0, y: 60, rotateX: 30 },
                    { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.1, clearProps: "transform" },
                    "-=0.3",
                )
                .fromTo($1(".lb-subtitle"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" }, "-=0.4")
                .fromTo($1(".lb-stat-bar"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" }, "-=0.2")
                .fromTo($1(".lb-body"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, clearProps: "transform" }, "-=0.2");
        },
        { scope: mainRef },
    );

    /* ── Sidebar card animation ──────────────────────────────────────────── */
    useGSAP(() => {
        if (!mainRef.current || loading) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const cards = mainRef.current.querySelectorAll(".lb-sidebar-card");
        if (cards.length === 0) return;
        gsap.fromTo(cards, { opacity: 0, x: 30 }, { opacity: 1, x: 0, stagger: 0.12, duration: 0.5, ease: "power3.out", clearProps: "transform" });
    }, { scope: mainRef, dependencies: [loading, myRank] });

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            <LeaderboardHero
                title="Show Your Range."
                subtitle="Recruiters are watching. Your XP reflects how you engage and how serious you are about your next move."
            />

            <section className="lb-body opacity-0 container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                {/* Frosted glass filter bar */}
                <div className="sticky top-0 z-10 backdrop-blur-md bg-base-100/90 border-b border-base-300 -mx-6 px-6 py-4 flex flex-wrap gap-6 lg:-mx-12 lg:px-12 mb-8">
                    <fieldset className="fieldset">
                        <label className="label text-xs font-bold uppercase tracking-widest text-base-content/40">Period</label>
                        <select className="select select-sm rounded-none" value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
                            {PERIOD_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                        </select>
                    </fieldset>
                    <fieldset className="fieldset">
                        <label className="label text-xs font-bold uppercase tracking-widest text-base-content/40">Metric</label>
                        <select className="select select-sm rounded-none" value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
                            {METRIC_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                        </select>
                    </fieldset>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 max-w-7xl mx-auto">
                    {/* Left column: podium + list */}
                    <div className="space-y-6">
                        <LeaderboardPodium entries={entries} myEntityId={myEntityId ?? undefined} levelMap={levelMap} />
                        <LeaderboardList entries={entries} myEntityId={myEntityId} loading={loading} levelMap={levelMap} />
                    </div>
                    {/* Right column: sticky sidebar */}
                    <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                        <LeaderboardYourStats myRank={myRank} level={myLevel} entityType="candidate" period={period} metric={metric} />
                        <LeaderboardNextMilestone myRank={myRank} entries={entries} />
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="max-w-7xl mx-auto mt-12 bg-base-200 border-l-4 border-primary shadow-sm rounded-none p-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">KEEP CLIMBING</p>
                    <p className="text-lg font-black text-base-content mb-1">Rankings reset. Reputation doesn&apos;t.</p>
                    <p className="text-sm text-base-content/50">Every level, every badge you earn builds a track record that follows you across the network.</p>
                </div>
            </section>
        </main>
    );
}
