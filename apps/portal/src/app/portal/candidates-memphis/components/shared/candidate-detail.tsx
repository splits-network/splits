"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Badge } from "@splits-network/memphis-ui";
import { LoadingState } from "@splits-network/shared-ui";
import type { Candidate } from "../../types";
import { formatJobType, formatAvailability, formatVerificationStatus } from "../../types";
import type { AccentClasses } from "./accent";
import { ACCENT, accentAt, statusVariant } from "./accent";
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

// ─── Tab Types ──────────────────────────────────────────────────────────────

type TabType = "overview" | "resume" | "applications" | "documents";

const TABS: { key: TabType; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "fa-user" },
    { key: "resume", label: "Resume", icon: "fa-file-user" },
    { key: "applications", label: "Applications", icon: "fa-briefcase" },
    { key: "documents", label: "Documents", icon: "fa-file-lines" },
];

// ─── Detail Loading Wrapper ─────────────────────────────────────────────────

interface DetailLoaderProps {
    candidateId: string;
    accent: AccentClasses;
    onClose: () => void;
    onRefresh?: () => void;
}

export function DetailLoader({ candidateId, accent, onClose, onRefresh }: DetailLoaderProps) {
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
                const res = await client.get<{ data: Candidate }>(`/candidates/${candidateId}`);
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

    if (!candidate) return null;

    return (
        <CandidateDetail
            candidate={candidate}
            accent={accent}
            onClose={onClose}
            onRefresh={onRefresh}
        />
    );
}

// ─── Detail Panel ───────────────────────────────────────────────────────────

export function CandidateDetail({
    candidate,
    accent,
    onClose,
    onRefresh,
}: {
    candidate: Candidate;
    accent: AccentClasses;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>("overview");

    // Lazy-loaded applications
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
            <div className={`p-6 border-b-4 ${accent.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                        {/* Initials square */}
                        <div
                            className={`w-14 h-14 flex items-center justify-center ${accent.bg} ${accent.textOnBg} font-black text-lg flex-shrink-0`}
                        >
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {isNew(candidate) && (
                                    <Badge variant="yellow">
                                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                                        New
                                    </Badge>
                                )}
                                <Badge variant={statusVariant(candidate.verification_status)}>
                                    {formatVerificationStatus(candidate.verification_status)}
                                </Badge>
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-1 text-dark">
                                {name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className={`font-bold ${accent.text}`}>{title}</span>
                                {company && (
                                    <>
                                        <span className="text-dark/50">|</span>
                                        <span className="text-dark/70">{company}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className={`btn btn-xs btn-square btn-ghost flex-shrink-0 ${accent.text}`}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}
                </div>

                {/* Contact row */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-dark/60">
                    {candidate.email && (
                        <a
                            href={`mailto:${candidate.email}`}
                            className="flex items-center gap-1.5 hover:text-coral transition-colors"
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
                            className="text-sm font-bold text-dark/50 hover:text-coral transition-colors flex items-center gap-1.5"
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
                            className="text-sm font-bold text-dark/50 hover:text-coral transition-colors flex items-center gap-1.5"
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
                            className="text-sm font-bold text-dark/50 hover:text-coral transition-colors flex items-center gap-1.5"
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
                        showActions={{
                            viewDetails: false,
                        }}
                    />
                </div>
            </div>

            {/* Memphis Tabs */}
            <div className="flex border-b-4 border-dark/10">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors border-b-4 -mb-[4px] ${
                            activeTab === tab.key
                                ? `${accent.border} ${accent.text}`
                                : "border-transparent text-dark/40 hover:text-dark/70"
                        }`}
                    >
                        <i className={`fa-duotone fa-regular ${tab.icon} mr-1.5`} />
                        {tab.label}
                        {tab.key === "applications" && applications.length > 0 && (
                            <span className="ml-1.5 text-xs">{applications.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                {activeTab === "overview" && (
                    <OverviewTab
                        candidate={candidate}
                        accent={accent}
                        bioText={bioText}
                        skills={skills}
                        salary={salary}
                    />
                )}
                {activeTab === "resume" && <ResumeTab />}
                {activeTab === "applications" && (
                    <ApplicationsTab applications={applications} loading={appsLoading} />
                )}
                {activeTab === "documents" && <DocumentsTab />}
            </div>
        </div>
    );
}

// ─── Overview Tab ───────────────────────────────────────────────────────────

function OverviewTab({
    candidate,
    accent,
    bioText,
    skills,
    salary,
}: {
    candidate: Candidate;
    accent: AccentClasses;
    bioText?: string;
    skills: string[];
    salary: string | null;
}) {
    return (
        <div className="p-6 space-y-6">
            {/* About / Bio */}
            {bioText ? (
                <div className={`border-l-4 ${accent.border} pl-4`}>
                    <h3 className="font-black text-sm uppercase tracking-wider mb-2 text-dark">
                        About
                    </h3>
                    <p className="text-sm text-dark/70 leading-relaxed whitespace-pre-line">
                        {bioText}
                    </p>
                </div>
            ) : (
                <div className="border-l-4 border-dark/20 pl-4">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-2 text-dark">
                        About
                    </h3>
                    <p className="text-sm text-dark/40 italic">No biography provided.</p>
                </div>
            )}

            {/* Career Preferences Card */}
            <div className="border-4 border-dark">
                <div className={`px-4 py-2 border-b-4 ${accent.border} ${accent.bg}`}>
                    <h3 className={`font-black text-sm uppercase tracking-wider ${accent.textOnBg}`}>
                        Career Preferences
                    </h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Desired Salary
                        </div>
                        <div className="text-sm font-bold text-dark">
                            {salary || <span className="text-dark/30 italic">Not specified</span>}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Job Type
                        </div>
                        <div className="text-sm font-bold text-dark capitalize">
                            {formatJobType(candidate.desired_job_type)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Availability
                        </div>
                        <div className="text-sm font-bold text-dark capitalize">
                            {formatAvailability(candidate.availability)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Work Mode
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {candidate.open_to_remote && (
                                <Badge variant="teal">Remote</Badge>
                            )}
                            {candidate.open_to_relocation && (
                                <Badge variant="purple">Relocation</Badge>
                            )}
                            {!candidate.open_to_remote && !candidate.open_to_relocation && (
                                <span className="text-sm text-dark/30 italic">Not specified</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div>
                <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                    <span className={`w-3 h-3 ${accent.bg}`} />
                    Skills & Expertise
                </h3>
                {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, i) => {
                            const skillAccent = accentAt(i);
                            return (
                                <Badge key={i} variant={skillAccent.bg.replace("bg-", "") as any}>
                                    {skill}
                                </Badge>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-dark/40 italic">No skills listed.</p>
                )}
            </div>

            {/* Profile Status Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border-2 border-dark/20">
                    <div className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                        Verification
                    </div>
                    <div className="text-sm font-bold text-dark">
                        {formatVerificationStatus(candidate.verification_status)}
                    </div>
                </div>
                <div className="p-3 border-2 border-dark/20">
                    <div className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                        Marketplace
                    </div>
                    <div className="text-sm font-bold text-dark capitalize">
                        {candidate.marketplace_visibility || "Not set"}
                    </div>
                </div>
                {candidate.onboarding_status && (
                    <div className="p-3 border-2 border-dark/20">
                        <div className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Onboarding
                        </div>
                        <div className="text-sm font-bold text-dark capitalize">
                            {candidate.onboarding_status.replace(/_/g, " ")}
                        </div>
                    </div>
                )}
                {candidate.created_at && (
                    <div className="p-3 border-2 border-dark/20">
                        <div className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Profile Created
                        </div>
                        <div className="text-sm font-bold text-dark">
                            {new Date(candidate.created_at).toLocaleDateString()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Resume Tab ─────────────────────────────────────────────────────────────

function ResumeTab() {
    return (
        <div className="h-full flex items-center justify-center p-12">
            <div className="text-center">
                <div className="flex justify-center gap-3 mb-4">
                    <div className="w-6 h-6 bg-teal" />
                    <div className="w-6 h-6 rotate-12 bg-coral" />
                </div>
                <h3 className="font-black text-lg uppercase tracking-tight mb-2 text-dark">
                    Resume
                </h3>
                <p className="text-sm text-dark/40">
                    Resume details coming soon.
                </p>
            </div>
        </div>
    );
}

// ─── Applications Tab ───────────────────────────────────────────────────────

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
                    <div className="flex justify-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-purple" />
                        <div className="w-6 h-6 rotate-45 bg-yellow" />
                    </div>
                    <h3 className="font-black text-lg uppercase tracking-tight mb-2 text-dark">
                        No Applications
                    </h3>
                    <p className="text-sm text-dark/40">
                        This candidate has no active applications.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-3">
            {applications.map((app, idx) => {
                const ac = accentAt(idx);
                return (
                    <div key={app.id} className={`border-4 ${ac.border} p-4`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-tight text-dark">
                                    {app.job?.title || "Unknown Job"}
                                </h4>
                                <p className={`text-sm font-bold mt-0.5 ${ac.text}`}>
                                    {app.job?.company?.name || "Unknown Company"}
                                </p>
                            </div>
                            <Badge variant={ac.bg.replace("bg-", "") as any}>
                                {app.status_id || "Applied"}
                            </Badge>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Documents Tab ──────────────────────────────────────────────────────────

function DocumentsTab() {
    return (
        <div className="h-full flex items-center justify-center p-12">
            <div className="text-center">
                <div className="flex justify-center gap-3 mb-4">
                    <div className="w-6 h-6 bg-yellow" />
                    <div className="w-6 h-6 rotate-12 bg-purple" />
                </div>
                <h3 className="font-black text-lg uppercase tracking-tight mb-2 text-dark">
                    Documents
                </h3>
                <p className="text-sm text-dark/40">
                    Document management coming soon.
                </p>
            </div>
        </div>
    );
}
