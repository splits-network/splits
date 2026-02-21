"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@splits-network/shared-ui";
import type { Candidate } from "../../types";
import {
    formatJobType,
    formatAvailability,
    formatVerificationStatus,
} from "../../types";
import { statusColor } from "./status-color";
import {
    salaryDisplay,
    isNew,
    candidateName,
    candidateInitials,
    candidateTitle,
    candidateCompany,
    skillsList,
} from "./helpers";
import CandidateActionsToolbar from "./actions-toolbar";

/* ─── Tab Types ─────────────────────────────────────────────────────────── */

type TabType = "overview" | "resume" | "applications" | "documents";

const TABS: { key: TabType; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "fa-user" },
    { key: "resume", label: "Resume", icon: "fa-file-user" },
    { key: "applications", label: "Applications", icon: "fa-briefcase" },
    { key: "documents", label: "Documents", icon: "fa-file-lines" },
];

/* ─── Detail Loading Wrapper ────────────────────────────────────────────── */

export function DetailLoader({
    candidateId,
    onClose,
    onRefresh,
}: {
    candidateId: string;
    onClose: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: Candidate }>(
                    `/candidates/${candidateId}`,
                );
                if (!cancelled) setCandidate(res.data);
            } catch (err) {
                console.error("Failed to fetch candidate detail:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidateId]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                        Loading profile...
                    </span>
                </div>
            </div>
        );
    }

    if (!candidate) return null;

    return (
        <CandidateDetail
            candidate={candidate}
            onClose={onClose}
            onRefresh={onRefresh}
        />
    );
}

/* ─── Detail Panel ──────────────────────────────────────────────────────── */

export function CandidateDetail({
    candidate,
    onClose,
    onRefresh,
    accent: _accent,
}: {
    candidate: Candidate;
    onClose?: () => void;
    onRefresh?: () => void;
    /** @deprecated Basel ignores this prop. Kept for backward compatibility with Memphis consumers. */
    accent?: unknown;
}) {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>("overview");

    /* Lazy-loaded applications */
    const [applications, setApplications] = useState<any[]>([]);
    const [appsLoading, setAppsLoading] = useState(false);

    const fetchApplications = useCallback(async () => {
        setAppsLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get(
                `/applications?candidate_id=${candidate.id}&include=job`,
            );
            setApplications(res.data || []);
        } catch (e) {
            console.error("Failed to fetch applications:", e);
        } finally {
            setAppsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidate.id]);

    useEffect(() => {
        if (activeTab === "applications") fetchApplications();
    }, [activeTab, fetchApplications]);

    const name = candidateName(candidate);
    const initials = candidateInitials(name);
    const title = candidateTitle(candidate);
    const company = candidateCompany(candidate);
    const salary = salaryDisplay(candidate);
    const skills = skillsList(candidate);
    const bioText =
        candidate.marketplace_profile?.bio ||
        candidate.bio ||
        candidate.description;

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-base-100 border-b-2 border-base-300 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                        {/* Initials square */}
                        <div className="w-14 h-14 flex items-center justify-center bg-primary text-primary-content font-black text-lg flex-shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {isNew(candidate) && (
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 bg-warning/15 text-warning">
                                        New
                                    </span>
                                )}
                                <span
                                    className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 ${statusColor(candidate.verification_status)}`}
                                >
                                    {formatVerificationStatus(
                                        candidate.verification_status,
                                    )}
                                </span>
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-1">
                                {name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="font-semibold text-primary">
                                    {title || "Title not set"}
                                </span>
                                {company && (
                                    <>
                                        <span className="text-base-content/40">
                                            |
                                        </span>
                                        <span className="text-base-content/70">
                                            {company}
                                        </span>
                                    </>
                                )}
                            </div>
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

                {/* Contact row */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-base-content/60">
                    {candidate.email && (
                        <a
                            href={`mailto:${candidate.email}`}
                            className="flex items-center gap-1.5 hover:text-primary transition-colors"
                        >
                            <i className="fa-duotone fa-regular fa-envelope" />
                            {candidate.email}
                        </a>
                    )}
                    {candidate.phone && (
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-phone" />
                            {candidate.phone}
                        </span>
                    )}
                    {candidate.location && (
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-location-dot" />
                            {candidate.location}
                        </span>
                    )}
                </div>

                {/* Social links */}
                <div className="flex flex-wrap gap-3 mt-3">
                    {candidate.linkedin_url && (
                        <a
                            href={candidate.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-base-content/50 hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                            <i className="fa-brands fa-linkedin" />
                            LinkedIn
                        </a>
                    )}
                    {candidate.github_url && (
                        <a
                            href={candidate.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-base-content/50 hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                            <i className="fa-brands fa-github" />
                            GitHub
                        </a>
                    )}
                    {candidate.portfolio_url && (
                        <a
                            href={candidate.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-base-content/50 hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                            <i className="fa-duotone fa-regular fa-globe" />
                            Portfolio
                        </a>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4">
                    <CandidateActionsToolbar
                        candidate={candidate}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{ viewDetails: false }}
                    />
                </div>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b-2 border-base-300">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-[0.15em] transition-colors border-b-2 -mb-[2px] ${
                            activeTab === tab.key
                                ? "border-b-2 border-primary text-primary"
                                : "border-transparent text-base-content/40 hover:text-base-content/70"
                        }`}
                    >
                        <i
                            className={`fa-duotone fa-regular ${tab.icon} mr-1.5`}
                        />
                        {tab.label}
                        {tab.key === "applications" &&
                            applications.length > 0 && (
                                <span className="ml-1.5 text-xs">
                                    {applications.length}
                                </span>
                            )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                {activeTab === "overview" && (
                    <OverviewTab
                        candidate={candidate}
                        bioText={bioText}
                        skills={skills}
                        salary={salary}
                    />
                )}
                {activeTab === "resume" && <ResumeTab />}
                {activeTab === "applications" && (
                    <ApplicationsTab
                        applications={applications}
                        loading={appsLoading}
                    />
                )}
                {activeTab === "documents" && <DocumentsTab />}
            </div>
        </div>
    );
}

/* ─── Overview Tab ──────────────────────────────────────────────────────── */

function OverviewTab({
    candidate,
    bioText,
    skills,
    salary,
}: {
    candidate: Candidate;
    bioText?: string;
    skills: string[];
    salary: string | null;
}) {
    return (
        <div className="p-6 space-y-8">
            {/* About / Bio */}
            {bioText ? (
                <div className="border-l-4 border-primary pl-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                        About
                    </h3>
                    <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-line">
                        {bioText}
                    </p>
                </div>
            ) : (
                <div className="border-l-4 border-base-300 pl-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                        About
                    </h3>
                    <p className="text-sm text-base-content/40 italic">
                        No biography added. Edit the profile to include one.
                    </p>
                </div>
            )}

            {/* Career Preferences */}
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                    Career Preferences
                </h3>
                <div className="grid grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Desired Salary
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {salary || "N/A"}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Job Type
                        </p>
                        <p className="text-lg font-black tracking-tight capitalize">
                            {formatJobType(candidate.desired_job_type)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Availability
                        </p>
                        <p className="text-lg font-black tracking-tight capitalize">
                            {formatAvailability(candidate.availability)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Work Mode
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {candidate.open_to_remote && (
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 bg-success/15 text-success">
                                    Remote
                                </span>
                            )}
                            {candidate.open_to_relocation && (
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 bg-info/15 text-info">
                                    Relocation
                                </span>
                            )}
                            {!candidate.open_to_remote &&
                                !candidate.open_to_relocation && (
                                    <span className="text-sm text-base-content/40 italic">
                                        No preference set
                                    </span>
                                )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills & Expertise */}
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                    Skills & Expertise
                </h3>
                {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, i) => (
                            <span
                                key={i}
                                className="bg-primary/10 text-primary px-3 py-1 text-sm font-semibold"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/40 italic">
                        No skills added. Edit the profile to include them.
                    </p>
                )}
            </div>

            {/* Profile Status Grid */}
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                    Profile Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Representation
                        </p>
                        {candidate.has_active_relationship ? (
                            <p className="font-bold text-sm text-success flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-user-check" />
                                Your Candidate
                            </p>
                        ) : candidate.has_other_active_recruiters ? (
                            <p className="font-bold text-sm text-warning flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-user-shield" />
                                Has Recruiter
                            </p>
                        ) : candidate.has_pending_invitation ? (
                            <p className="font-bold text-sm text-info flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-clock" />
                                Invitation Pending
                            </p>
                        ) : (
                            <p className="font-bold text-sm text-base-content/50 flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-user-xmark" />
                                Unrepresented
                            </p>
                        )}
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Verification
                        </p>
                        <p className="font-bold text-sm">
                            {formatVerificationStatus(
                                candidate.verification_status,
                            )}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Marketplace
                        </p>
                        <p className="font-bold text-sm capitalize">
                            {candidate.marketplace_visibility || "Not configured"}
                        </p>
                    </div>
                    {candidate.onboarding_status && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Onboarding
                            </p>
                            <p className="font-bold text-sm capitalize">
                                {candidate.onboarding_status.replace(/_/g, " ")}
                            </p>
                        </div>
                    )}
                    {candidate.created_at && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Profile Created
                            </p>
                            <p className="font-bold text-sm">
                                {new Date(
                                    candidate.created_at,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Resume Tab ────────────────────────────────────────────────────────── */

function ResumeTab() {
    return (
        <div className="h-full flex items-center justify-center p-12">
            <div className="text-center">
                <i className="fa-duotone fa-regular fa-file-user text-3xl text-base-content/20 mb-4 block" />
                <h3 className="text-lg font-black tracking-tight mb-2">
                    No Resume on File
                </h3>
                <p className="text-sm text-base-content/40">
                    Resume parsing is not yet available. Upload documents in the Documents tab.
                </p>
            </div>
        </div>
    );
}

/* ─── Applications Tab ──────────────────────────────────────────────────── */

function ApplicationsTab({
    applications,
    loading,
}: {
    applications: any[];
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="p-6">
                <LoadingState message="Loading applications..." />
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <i className="fa-duotone fa-regular fa-briefcase text-3xl text-base-content/20 mb-4 block" />
                    <h3 className="text-lg font-black tracking-tight mb-2">
                        No Active Applications
                    </h3>
                    <p className="text-sm text-base-content/40">
                        This candidate has not been submitted to any roles. Use Send Opportunity to get started.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-[2px] bg-base-300">
            {applications.map((app) => (
                <div key={app.id} className="bg-base-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h4 className="font-bold text-sm tracking-tight">
                                {app.job?.title || "Untitled Role"}
                            </h4>
                            <p className="text-sm text-base-content/60 mt-0.5">
                                {app.job?.company?.name || "Company not listed"}
                            </p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 bg-base-200 text-base-content/60">
                            {app.status_id || "Applied"}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Documents Tab ─────────────────────────────────────────────────────── */

function DocumentsTab() {
    return (
        <div className="h-full flex items-center justify-center p-12">
            <div className="text-center">
                <i className="fa-duotone fa-regular fa-file-lines text-3xl text-base-content/20 mb-4 block" />
                <h3 className="text-lg font-black tracking-tight mb-2">
                    No Documents
                </h3>
                <p className="text-sm text-base-content/40">
                    No files have been uploaded for this candidate. Document management is coming soon.
                </p>
            </div>
        </div>
    );
}
