"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { AdminPageHeader } from "../../components";
import { BaselTabBar } from "@splits-network/basel-ui";
import JobOverviewTab from "./components/job-overview-tab";
import MatchedCandidatesTab from "./components/matched-candidates-tab";

type TabKey = "overview" | "matches";

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "fa-file-lines" },
    { key: "matches", label: "Matched Candidates", icon: "fa-bullseye" },
];

interface Job {
    id: string;
    title: string;
    status: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    employment_type?: string;
    job_level?: string;
    department?: string;
    description?: string;
    recruiter_description?: string;
    commute_types?: string[];
    guarantee_days?: number;
    fee_percentage?: number;
    requirements?: Array<{
        id: string;
        description: string;
        requirement_type: "mandatory" | "preferred";
        sort_order?: number;
    }>;
    company?: { id: string; name: string; logo_url?: string };
    created_at: string;
    updated_at: string;
}

export default function JobDetailClient({ jobId }: { jobId: string }) {
    const { getToken } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("overview");

    const loadJob = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const client = createAuthenticatedClient(token);
            const response = await client.get(
                `/jobs/${jobId}?include=company,requirements`,
            );
            setJob(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load job");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId]);

    useEffect(() => {
        loadJob();
    }, [loadJob]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="skeleton h-12 w-64" />
                <div className="skeleton h-96 w-full" />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="alert alert-error">
                <i className="fa-duotone fa-regular fa-circle-exclamation" />
                <span>
                    {error ||
                        "This role could not be found. It may have been removed or is no longer available."}
                </span>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        draft: "badge-ghost",
        active: "badge-success",
        paused: "badge-warning",
        closed: "badge-primary",
        filled: "badge-info",
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title={job.title}
                subtitle={job.company?.name || "Company not listed"}
                breadcrumbs={[
                    { label: "Jobs", href: "/portal/admin/jobs" },
                    { label: job.title },
                ]}
                badge={
                    <span
                        className={`badge ${statusColors[job.status] || "badge-ghost"}`}
                    >
                        {job.status}
                    </span>
                }
            />

            {/* Tab Navigation */}
            <BaselTabBar
                tabs={TABS.map((t) => ({
                    label: t.label,
                    value: t.key,
                    icon: `fa-duotone fa-regular ${t.icon}`,
                }))}
                active={activeTab}
                onChange={(v) => setActiveTab(v as TabKey)}
            />

            {/* Tab Content */}
            {activeTab === "overview" && <JobOverviewTab job={job} />}
            {activeTab === "matches" && <MatchedCandidatesTab jobId={jobId} />}
        </div>
    );
}
