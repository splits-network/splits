"use client";

import { useState, useEffect, useCallback } from "react";
import { BaselTabBar } from "@splits-network/basel-ui";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts/user-profile-context";
import type { Job } from "../../types";
import { RecruiterBriefTab } from "./job-detail-brief-tab";
import { CandidateDescriptionTab } from "./job-detail-candidate-tab";
import { FinancialsTab } from "./job-detail-financials-tab";
import { CompanyTab } from "./job-detail-company-tab";
import { JobMatchesTab } from "./job-matches-tab";
import { JobCallsTab } from "./job-calls-tab";
import { JobHeroHeader } from "./job-detail-header";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type TabKey =
    | "brief"
    | "candidate"
    | "financials"
    | "company"
    | "matches"
    | "calls";

const TABS = [
    {
        value: "brief",
        label: "Recruiter Brief",
        icon: "fa-duotone fa-regular fa-file-lines",
    },
    {
        value: "candidate",
        label: "Candidate",
        icon: "fa-duotone fa-regular fa-user",
    },
    {
        value: "financials",
        label: "Financials",
        icon: "fa-duotone fa-regular fa-calculator",
    },
    {
        value: "company",
        label: "Company",
        icon: "fa-duotone fa-regular fa-building",
    },
    {
        value: "matches",
        label: "Matches",
        icon: "fa-duotone fa-regular fa-bullseye",
    },
    { value: "calls", label: "Calls", icon: "fa-duotone fa-regular fa-video" },
];

/* ─── Detail Panel ───────────────────────────────────────────────────────── */

export function JobDetail({
    job,
    onClose,
    onRefresh,
    onUpdateItem,
    accent: _accent,
}: {
    job: Job;
    onClose?: () => void;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
    /** @deprecated Basel ignores this prop. Kept for backward compatibility with Memphis consumers. */
    accent?: unknown;
}) {
    const [activeTab, setActiveTab] = useState<TabKey>("brief");
    const { planTier, isRecruiter } = useUserProfile();

    return (
        <div className="w-full z-10">
            <JobHeroHeader
                job={job}
                onClose={onClose}
                onRefresh={onRefresh}
                onUpdateItem={onUpdateItem}
            />

            <BaselTabBar
                tabs={TABS}
                active={activeTab}
                onChange={(v) => setActiveTab(v as TabKey)}
                className="bg-base-100 border-b border-base-300"
            />

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === "brief" && <RecruiterBriefTab job={job} />}
                {activeTab === "candidate" && (
                    <CandidateDescriptionTab job={job} />
                )}
                {activeTab === "financials" && <FinancialsTab job={job} />}
                {activeTab === "company" && <CompanyTab job={job} />}
                {activeTab === "matches" && (
                    <JobMatchesTab
                        job={job}
                        isPartner={planTier === "partner"}
                        isRecruiter={isRecruiter}
                    />
                )}
                {activeTab === "calls" && (
                    <JobCallsTab jobId={job.id} jobTitle={job.title} />
                )}
            </div>
        </div>
    );
}

/* ─── Detail Loading Wrapper ─────────────────────────────────────────────── */

export function DetailLoader({
    jobId,
    onClose,
    onRefresh,
    onUpdateItem,
}: {
    jobId: string;
    onClose: () => void;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
}) {
    const { getToken } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDetail = useCallback(
        async (id: string, signal?: { cancelled: boolean }) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: Job }>(`/jobs/${id}`, {
                    params: { include: "company,requirements,skills" },
                });
                if (!signal?.cancelled) setJob(res.data);
            } catch (err) {
                console.error("Failed to fetch job detail:", err);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);

        fetchDetail(jobId, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });

        return () => {
            signal.cancelled = true;
        };
    }, [jobId, refreshKey, fetchDetail]);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
        onRefresh?.();
    }, [onRefresh]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <span className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                        Loading role...
                    </span>
                </div>
            </div>
        );
    }

    if (!job) return null;

    return (
        <JobDetail
            job={job}
            onClose={onClose}
            onRefresh={handleRefresh}
            onUpdateItem={onUpdateItem}
        />
    );
}
