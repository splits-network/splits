"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@splits-network/shared-ui";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { RepresentationStatus } from "@/components/representation-status";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Candidate } from "../../types";
import { RecruiterCandidateWithCandidate } from "@splits-network/shared-types";

interface DetailsProps {
    itemId: string;
    onRefresh?: () => void;
}

type TabType = "overview" | "applications" | "documents";

export default function Details({ itemId, onRefresh }: DetailsProps) {
    const { getToken } = useAuth();
    const { isRecruiter } = useUserProfile();
    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(false);

    // Applications state
    const [applications, setApplications] = useState<any[]>([]);
    const [appsLoading, setAppsLoading] = useState(false);

    // Documents state
    const [document, setDocument] = useState<any>(null);
    const [docsLoading, setDocsLoading] = useState(false);

    // Invitation state
    const [invitation, setInvitation] =
        useState<RecruiterCandidateWithCandidate | null>(null);
    const [invitationLoading, setInvitationLoading] = useState(true);

    const fetchCandidate = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const response: any = await client.get(`/candidates/${itemId}`);
            setCandidate(response.data);
        } catch (err) {
            console.error("Failed to fetch candidate:", err);
        } finally {
            setLoading(false);
        }
    }, [itemId, getToken]);

    const fetchInvitation = useCallback(async () => {
        if (!itemId) return;
        setInvitationLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const response = await client.get(
                `/recruiter-candidates?candidate_id=${itemId}`,
            );
            if (response.data && response.data.length > 0) {
                setInvitation(response.data[0]);
            } else {
                setInvitation(null);
            }
        } catch (err) {
            console.error("Failed to fetch invitation:", err);
        } finally {
            setInvitationLoading(false);
        }
    }, [itemId, getToken]);

    const fetchApplications = useCallback(async () => {
        if (!itemId) return;
        setAppsLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get(
                `/applications?candidate_id=${itemId}&include=job`,
            );
            setApplications(res.data || []);
        } catch (e) {
            console.error("Failed to fetch applications:", e);
        } finally {
            setAppsLoading(false);
        }
    }, [itemId, getToken]);

    const fetchDocuments = useCallback(async () => {
        if (!itemId) return;
        setDocsLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const data = await client.get(
                `/candidates/${itemId}/primary-resume`,
            );
            setDocument(data.data);
        } catch (err) {
            console.error("Failed to fetch documents:", err);
        } finally {
            setDocsLoading(false);
        }
    }, [itemId, getToken]);

    useEffect(() => {
        fetchCandidate();
        fetchInvitation();
    }, [fetchCandidate, fetchInvitation]);

    useEffect(() => {
        if (activeTab === "applications") fetchApplications();
        if (activeTab === "documents") fetchDocuments();
    }, [activeTab, fetchApplications, fetchDocuments]);

    if (loading) {
        return (
            <div className="p-8">
                <LoadingState message="Loading candidate details..." />
            </div>
        );
    }

    if (!candidate) return null;

    const bioText =
        candidate.marketplace_profile?.bio ||
        candidate.bio ||
        candidate.description;

    const legacySkills = candidate.skills
        ? candidate.skills
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
        : [];
    const specialties = candidate.marketplace_profile?.specialties || [];
    const allSkills = Array.from(new Set([...legacySkills, ...specialties]));

    return (
        <div className="flex flex-col h-full min-h-0 p-6 gap-6">
            {/* Tabs */}
            <div className="overflow-x-auto shrink-0">
                <div role="tablist" className="tabs tabs-lift min-w-max">
                    <a
                        role="tab"
                        className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        <i className="fa-duotone fa-regular fa-user mr-2" />
                        Overview
                    </a>
                    <a
                        role="tab"
                        className={`tab ${activeTab === "applications" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("applications")}
                    >
                        <i className="fa-duotone fa-regular fa-briefcase mr-2" />
                        Applications
                        {applications.length > 0 && (
                            <span className="badge badge-xs badge-primary ml-1">
                                {applications.length}
                            </span>
                        )}
                    </a>
                    <a
                        role="tab"
                        className={`tab ${activeTab === "documents" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("documents")}
                    >
                        <i className="fa-duotone fa-regular fa-file-lines mr-2" />
                        Documents
                    </a>
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
                {activeTab === "overview" && (
                    <OverviewTab
                        candidate={candidate}
                        bioText={bioText}
                        allSkills={allSkills}
                        invitation={invitation}
                        invitationLoading={invitationLoading}
                        onInvitationUpdate={fetchInvitation}
                    />
                )}
                {activeTab === "applications" && (
                    <ApplicationsTab
                        applications={applications}
                        loading={appsLoading}
                    />
                )}
                {activeTab === "documents" && (
                    <DocumentsTab
                        document={document}
                        loading={docsLoading}
                        isRecruiter={isRecruiter}
                    />
                )}
            </div>
        </div>
    );
}

// --- Tab Components ---

function OverviewTab({
    candidate,
    bioText,
    allSkills,
    invitation,
    invitationLoading,
    onInvitationUpdate,
}: {
    candidate: Candidate;
    bioText?: string;
    allSkills: string[];
    invitation: RecruiterCandidateWithCandidate | null;
    invitationLoading: boolean;
    onInvitationUpdate: () => void;
}) {
    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex gap-5 items-start">
                <div className="avatar avatar-placeholder">
                    <div className="bg-secondary text-neutral-content rounded-full w-16 h-16">
                        <span className="text-xl font-bold">
                            {candidate.full_name?.charAt(0) || "?"}
                        </span>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold">
                            {candidate.full_name}
                        </h3>
                        {candidate.verification_status === "verified" && (
                            <span className="badge badge-sm badge-ghost text-secondary gap-1">
                                <i className="fa-duotone fa-regular fa-badge-check" />
                                Verified
                            </span>
                        )}
                        {candidate.has_active_relationship && (
                            <span className="badge badge-sm badge-success gap-1">
                                <i className="fa-duotone fa-regular fa-user-check" />
                                Representing
                            </span>
                        )}
                        {!candidate.has_active_relationship &&
                            !candidate.has_other_active_recruiters && (
                                <span className="badge badge-sm badge-accent badge-soft gap-1 border-0">
                                    <i className="fa-duotone fa-regular fa-user-plus" />
                                    Available
                                </span>
                            )}
                    </div>
                    <div className="text-base text-base-content/80">
                        {candidate.current_title || "No Title"}
                        {candidate.current_company && (
                            <span className="text-base-content/60">
                                {" "}
                                at {candidate.current_company}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-base-content/60 pt-1">
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
                            <div className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-phone" />
                                {candidate.phone}
                            </div>
                        )}
                        {candidate.location && (
                            <div className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-location-dot" />
                                {candidate.location}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {candidate.linkedin_url && (
                            <a
                                href={candidate.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-ghost gap-1.5 text-base-content/70"
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
                                className="btn btn-xs btn-ghost gap-1.5 text-base-content/70"
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
                                className="btn btn-xs btn-ghost gap-1.5 text-base-content/70"
                            >
                                <i className="fa-duotone fa-regular fa-globe" />
                                Portfolio
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Invitation Status */}
            <RepresentationStatus
                invitation={invitation}
                loading={invitationLoading}
                onUpdate={onInvitationUpdate}
            />

            {/* Bio */}
            <section>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-address-card text-primary" />
                    About
                </h4>
                <div className="text-base-content/80 bg-base-200/50 p-4 rounded-lg border border-base-200">
                    {bioText ? (
                        <MarkdownRenderer content={bioText} />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center opacity-60">
                            <i className="fa-duotone fa-regular fa-pen-field text-4xl mb-2" />
                            <p className="italic">No biography provided.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Preferences */}
            <section className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="p-4 border-b border-base-200 bg-base-200/30">
                    <h4 className="font-semibold flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-briefcase text-accent" />
                        Career Preferences
                    </h4>
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                            Desired Salary
                        </span>
                        <span className="font-medium">
                            {candidate.desired_salary_min ||
                            candidate.desired_salary_max ? (
                                <>
                                    {candidate.desired_salary_min
                                        ? `$${candidate.desired_salary_min.toLocaleString()}`
                                        : ""}
                                    {candidate.desired_salary_min &&
                                    candidate.desired_salary_max
                                        ? " - "
                                        : ""}
                                    {candidate.desired_salary_max
                                        ? `$${candidate.desired_salary_max.toLocaleString()}`
                                        : ""}
                                </>
                            ) : (
                                <span className="text-sm opacity-40 italic">
                                    Not specified
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                            Job Type
                        </span>
                        <span className="font-medium capitalize">
                            {candidate.desired_job_type ? (
                                candidate.desired_job_type.replace(/_/g, " ")
                            ) : (
                                <span className="text-sm opacity-40 italic">
                                    Not specified
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                            Availability
                        </span>
                        <span className="font-medium capitalize">
                            {candidate.availability ? (
                                candidate.availability.replace(/_/g, " ")
                            ) : (
                                <span className="text-sm opacity-40 italic">
                                    Not specified
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                            Work Mode
                        </span>
                        <div className="flex gap-2 flex-wrap">
                            {candidate.open_to_remote && (
                                <div className="badge badge-success badge-soft gap-2 badge-md border-0">
                                    <i className="fa-duotone fa-house-laptop" />
                                    Remote
                                </div>
                            )}
                            {candidate.open_to_relocation && (
                                <div className="badge badge-info badge-soft gap-2 badge-md border-0">
                                    <i className="fa-duotone fa-plane-departure" />
                                    Open to Relocation
                                </div>
                            )}
                            {!candidate.open_to_remote &&
                                !candidate.open_to_relocation && (
                                    <span className="opacity-40 italic text-sm">
                                        No preferences listed
                                    </span>
                                )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Skills */}
            {allSkills.length > 0 && (
                <section className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="p-4 border-b border-base-200 bg-base-200/30">
                        <h4 className="font-semibold flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-laptop-code text-secondary" />
                            Skills & Specialties
                        </h4>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                        {allSkills.map((skill, i) => (
                            <span
                                key={i}
                                className="badge badge-lg bg-base-200 border-base-300 p-3"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function ApplicationsTab({
    applications,
    loading,
}: {
    applications: any[];
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="p-4 space-y-3">
                <div className="skeleton h-12 w-full"></div>
                <div className="skeleton h-12 w-full"></div>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-base-content/60">
                <i className="fa-duotone fa-regular fa-briefcase text-3xl mb-2 block" />
                <p>No active applications</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {applications.map((app) => (
                <div key={app.id} className="card bg-base-200 p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="font-semibold text-sm">
                                {app.job?.title || "Unknown Job"}
                            </h4>
                            <p className="text-xs text-base-content/60 mt-1">
                                {app.job?.company?.name || "Unknown Company"}
                            </p>
                        </div>
                        <span className="badge badge-sm badge-outline bg-base-100">
                            {app.status_id || "Applied"}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function DocumentsTab({
    document,
    loading,
    isRecruiter,
}: {
    document: any;
    loading: boolean;
    isRecruiter: boolean;
}) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!document?.download_url) return;
        setDownloading(true);
        try {
            const response = await fetch(document.download_url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = window.document.createElement("a");
            link.href = url;
            link.download = document.filename || "resume";
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return <div className="skeleton h-16 w-full rounded-xl"></div>;
    }

    if (!document) {
        return (
            <div className="p-8 text-center text-sm text-base-content/60">
                <i className="fa-duotone fa-regular fa-file-lines text-3xl mb-2 block" />
                <p>No resume attached</p>
            </div>
        );
    }

    const isPdf = document.content_type?.includes("pdf");
    const fileSize = document.file_size
        ? `${(document.file_size / 1024).toFixed(0)} KB`
        : "";

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-2xl opacity-80">
                        <i
                            className={`fa-duotone fa-regular fa-file-${isPdf ? "pdf text-error" : "word text-info"}`}
                        />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <div className="text-sm font-medium truncate">
                            {document.filename}
                        </div>
                        {fileSize && (
                            <div className="text-xs text-base-content/50">
                                {fileSize}
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn"
                >
                    {downloading ? (
                        <span className="loading loading-spinner loading-sm text-primary"></span>
                    ) : (
                        <i className="fa-duotone fa-regular fa-download text-base-content/40" />
                    )}
                </button>
            </div>

            {!isRecruiter && (
                <button className="mt-3 w-full border border-dashed border-base-300 rounded-xl p-3 hover:border-primary/50 hover:bg-base-50 transition-all text-center flex items-center justify-center gap-2 text-base-content/50 hover:text-primary">
                    <i className="fa-duotone fa-regular fa-plus" />
                    <span className="text-xs font-medium">Upload Resume</span>
                </button>
            )}
        </div>
    );
}
