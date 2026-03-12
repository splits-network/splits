"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import ActionsToolbar from "./actions-toolbar";
import { BaselBadge } from "@splits-network/basel-ui";
import { getStageDisplay, getStageDisplayWithExpired } from "./status-color";
import { formatApplicationDate } from "../../types";
import type { Application } from "../../types";

interface ApplicationDetailHeaderProps {
    application: Application;
    onClose: () => void;
    onRefresh: () => void;
}

const ICON_STYLES = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

export function ApplicationDetailHeader({
    application,
    onClose,
    onRefresh,
}: ApplicationDetailHeaderProps) {
    const candidate = application.candidate;
    const job = application.job;
    const stageDisplay = getStageDisplayWithExpired(
        application.stage,
        (application as any).expired_at,
    );

    const candidateName = candidate?.full_name || "Unnamed Candidate";
    const candidateInitials = candidateName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const subtitle = job
        ? `${job.title}${job.company?.name ? ` at ${job.company.name}` : ""}`
        : undefined;

    const meta = [
        candidate?.current_title
            ? { icon: "fa-duotone fa-regular fa-briefcase", text: candidate.current_title }
            : null,
        candidate?.current_company
            ? { icon: "fa-duotone fa-regular fa-building", text: candidate.current_company }
            : null,
    ].filter(Boolean) as { icon: string; text: string }[];

    const aiScoreFromApp = application.ai_review?.fit_score;
    const [fetchedAiScore, setFetchedAiScore] = useState<number | null>(null);
    const { getToken } = useAuth();

    // Self-fetch AI score when not included in the application data
    useEffect(() => {
        if (aiScoreFromApp != null) return;
        let cancelled = false;
        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get("/ai-reviews", {
                    params: { application_id: application.id },
                });
                const review = Array.isArray(res.data) ? res.data[0] : res.data;
                if (!cancelled && review?.fit_score != null) {
                    setFetchedAiScore(Math.round(review.fit_score));
                }
            } catch { /* silent */ }
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [application.id, aiScoreFromApp]);

    const aiScore = aiScoreFromApp ?? fetchedAiScore;
    const stageLabel = getStageDisplay(application.stage);
    const docsCount = application.documents?.length || 0;
    const daysInPipeline = Math.floor(
        (Date.now() - new Date(application.created_at).getTime()) / (1000 * 60 * 60 * 24),
    );

    const stats = [
        { label: "AI Score", value: aiScore != null ? `${aiScore}%` : "\u2014", icon: "fa-duotone fa-regular fa-brain" },
        { label: "Stage", value: stageLabel.label, icon: `fa-duotone fa-regular ${stageLabel.icon}` },
        { label: "Docs", value: String(docsCount), icon: "fa-duotone fa-regular fa-file" },
        { label: "Pipeline", value: `${daysInPipeline}d`, icon: "fa-duotone fa-regular fa-clock" },
    ];

    return (
        <header className="relative bg-neutral text-neutral-content border-l-4 border-l-primary shrink-0">
            {/* Diagonal accent */}
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{ clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)" }}
            />

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 btn btn-sm btn-square btn-primary"
            >
                <i className="fa-duotone fa-regular fa-xmark" />
            </button>

            <div className="relative px-6 pt-6 pb-0">
                {/* Kicker row */}
                <div className="flex items-center justify-between mb-6 pr-10">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-content/40 truncate">
                        Submitted {formatApplicationDate(application.created_at)}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        <BaselBadge color={stageDisplay.color} size="sm" variant="soft">
                            <i className={`fa-duotone fa-regular ${stageDisplay.icon}`} />
                            {stageDisplay.label}
                        </BaselBadge>
                    </div>
                </div>

                {/* Avatar + Identity */}
                <div className="flex items-end gap-5">
                    <div className="w-20 h-20 bg-primary text-primary-content flex items-center justify-center text-2xl font-black tracking-tight select-none shrink-0 border-2 border-primary">
                        {candidateInitials}
                    </div>
                    <div className="min-w-0 pb-1">
                        {subtitle && (
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-1 truncate">
                                {subtitle}
                            </p>
                        )}
                        <h2 className="text-3xl font-black tracking-tight leading-none text-neutral-content mb-2 truncate">
                            {candidateName}
                        </h2>
                        {meta.length > 0 && (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-content/40">
                                {meta.map((m, i) => (
                                    <span key={i} className="flex items-center gap-1.5">
                                        <i className={`${m.icon} text-xs`} />
                                        {m.text}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions toolbar */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <ActionsToolbar
                        application={application as any}
                        variant="descriptive"
                        size="sm"
                        showActions={{ viewDetails: false }}
                        onRefresh={onRefresh}
                    />
                </div>

                {/* Stats strip */}
                <div
                    className="grid divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-6"
                    style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
                >
                    {stats.map((stat, i) => (
                        <div key={stat.label} className="flex items-center gap-2.5 px-3 py-4">
                            <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${ICON_STYLES[i % ICON_STYLES.length]}`}>
                                <i className={`${stat.icon} text-sm`} />
                            </div>
                            <div>
                                <span className="text-lg font-black text-neutral-content leading-none block">
                                    {stat.value}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-content/40 leading-none">
                                    {stat.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );
}
