"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@splits-network/shared-ui";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { RepresentationStatus } from "@/components/representation-status";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Candidate, ResumeMetadata } from "../../types";
import { RecruiterCandidateWithCandidate } from "@splits-network/shared-types";

interface DetailsProps {
    itemId: string;
    onRefresh?: () => void;
}

type TabType = "overview" | "resume" | "applications" | "documents";

export default function Details({ itemId, onRefresh }: DetailsProps) {
    const { getToken } = useAuth();
    const { isRecruiter } = useUserProfile();
    const [activeTab, setActiveTab] = useState<TabType>("overview");

    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(false);

    // Tab scroll arrow buttons
    const tabScrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = useCallback(() => {
        const el = tabScrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }, []);

    useEffect(() => {
        const el = tabScrollRef.current;
        if (!el) return;
        updateScrollButtons();
        el.addEventListener("scroll", updateScrollButtons);
        const observer = new ResizeObserver(updateScrollButtons);
        observer.observe(el);
        return () => {
            el.removeEventListener("scroll", updateScrollButtons);
            observer.disconnect();
        };
        // Re-run when candidate loads so ref is attached
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateScrollButtons, !!candidate]);

    const scrollTabs = useCallback((direction: "left" | "right") => {
        const el = tabScrollRef.current;
        if (!el) return;
        el.scrollBy({
            left: direction === "left" ? -120 : 120,
            behavior: "smooth",
        });
    }, []);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);

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
    const specialties = candidate.marketplace_profile?.skills_expertise || [];
    const allSkills = Array.from(new Set([...legacySkills, ...specialties]));

    return (
        <div className="flex flex-col h-full min-h-0 p-6 gap-6">
            {/* Tabs */}
            <div className="relative shrink-0">
                {canScrollLeft && (
                    <button
                        onClick={() => scrollTabs("left")}
                        className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-1 bg-gradient-to-r from-base-100 via-base-100 to-transparent"
                        aria-label="Scroll tabs left"
                    >
                        <i className="fa-duotone fa-regular fa-chevron-left text-xs text-base-content/60" />
                    </button>
                )}
                <div
                    ref={tabScrollRef}
                    className="overflow-x-auto"
                    style={{ scrollbarWidth: "none" }}
                    data-tab-scroll
                >
                    <style>{`[data-tab-scroll]::-webkit-scrollbar { display: none; }`}</style>
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
                            className={`tab ${activeTab === "resume" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("resume")}
                        >
                            <i className="fa-duotone fa-regular fa-file-user mr-2" />
                            Resume
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
                {canScrollRight && (
                    <button
                        onClick={() => scrollTabs("right")}
                        className="absolute right-0 top-0 bottom-0 z-10 flex items-center px-1 bg-gradient-to-l from-base-100 via-base-100 to-transparent"
                        aria-label="Scroll tabs right"
                    >
                        <i className="fa-duotone fa-regular fa-chevron-right text-xs text-base-content/60" />
                    </button>
                )}
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
                {activeTab === "resume" && (
                    <ResumeTab resumeMetadata={(candidate.resume_metadata as ResumeMetadata | null) ?? undefined} />
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
                        {candidate.current_title || "Title not provided"}
                        <span className="text-base-content/60">
                            {candidate.current_company
                                ? ` at ${candidate.current_company}`
                                : " • Company not provided"}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-base-content/60 pt-1">
                        <a
                            href={
                                candidate.email
                                    ? `mailto:${candidate.email}`
                                    : "#"
                            }
                            className={`flex items-center gap-1.5 ${candidate.email ? "hover:text-primary transition-colors" : "cursor-not-allowed opacity-50"}`}
                        >
                            <i className="fa-duotone fa-regular fa-envelope" />
                            {candidate.email || "Email not provided"}
                        </a>
                        <div className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-phone" />
                            {candidate.phone || "Phone not provided"}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-location-dot" />
                            {candidate.location || "Location not provided"}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <a
                            href={candidate.linkedin_url || "#"}
                            target={
                                candidate.linkedin_url ? "_blank" : undefined
                            }
                            rel={
                                candidate.linkedin_url
                                    ? "noopener noreferrer"
                                    : undefined
                            }
                            className={`btn btn-xs btn-ghost gap-1.5 ${candidate.linkedin_url ? "text-base-content/70" : "text-base-content/40 cursor-not-allowed"}`}
                        >
                            <i className="fa-brands fa-linkedin" />
                            {candidate.linkedin_url
                                ? "LinkedIn"
                                : "LinkedIn not provided"}
                        </a>
                        <a
                            href={candidate.github_url || "#"}
                            target={candidate.github_url ? "_blank" : undefined}
                            rel={
                                candidate.github_url
                                    ? "noopener noreferrer"
                                    : undefined
                            }
                            className={`btn btn-xs btn-ghost gap-1.5 ${candidate.github_url ? "text-base-content/70" : "text-base-content/40 cursor-not-allowed"}`}
                        >
                            <i className="fa-brands fa-github" />
                            {candidate.github_url
                                ? "GitHub"
                                : "GitHub not provided"}
                        </a>
                        <a
                            href={candidate.portfolio_url || "#"}
                            target={
                                candidate.portfolio_url ? "_blank" : undefined
                            }
                            rel={
                                candidate.portfolio_url
                                    ? "noopener noreferrer"
                                    : undefined
                            }
                            className={`btn btn-xs btn-ghost gap-1.5 ${candidate.portfolio_url ? "text-base-content/70" : "text-base-content/40 cursor-not-allowed"}`}
                        >
                            <i className="fa-duotone fa-regular fa-globe" />
                            {candidate.portfolio_url
                                ? "Portfolio"
                                : "Portfolio not provided"}
                        </a>
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
            <section className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="p-4 border-b border-base-200 bg-base-200/30">
                    <h4 className="font-semibold flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-laptop-code text-secondary" />
                        Skills & Specialties
                    </h4>
                </div>
                <div className="p-4">
                    {allSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {allSkills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="badge badge-lg bg-base-200 border-base-300 p-3"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center opacity-60">
                            <i className="fa-duotone fa-regular fa-code text-3xl mb-2" />
                            <p className="italic">Skills not provided.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Profile Status & Metadata */}
            <section className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="p-4 border-b border-base-200 bg-base-200/30">
                    <h4 className="font-semibold flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-user-gear text-info" />
                        Profile Status
                    </h4>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                                Verification Status
                            </span>
                            <div className="font-medium flex items-center gap-2">
                                {candidate.verification_status ===
                                "verified" ? (
                                    <>
                                        <i className="fa-duotone fa-regular fa-badge-check text-success" />
                                        <span className="text-success">
                                            Verified
                                        </span>
                                    </>
                                ) : candidate.verification_status ===
                                  "pending" ? (
                                    <>
                                        <i className="fa-duotone fa-regular fa-clock text-warning" />
                                        <span className="text-warning">
                                            Pending
                                        </span>
                                    </>
                                ) : candidate.verification_status ===
                                  "rejected" ? (
                                    <>
                                        <i className="fa-duotone fa-regular fa-times-circle text-error" />
                                        <span className="text-error">
                                            Rejected
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-question-circle text-base-content/40" />
                                        <span className="text-base-content/60">
                                            Unverified
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                                Marketplace Visibility
                            </span>
                            <span className="font-medium capitalize">
                                {candidate.marketplace_visibility || "Not set"}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                                Onboarding Status
                            </span>
                            <span className="font-medium capitalize">
                                {candidate.onboarding_status
                                    ? candidate.onboarding_status.replace(
                                          /_/g,
                                          " ",
                                      )
                                    : "Not specified"}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                                Profile Created
                            </span>
                            <span className="font-medium">
                                {candidate.created_at
                                    ? new Date(
                                          candidate.created_at,
                                      ).toLocaleDateString()
                                    : "Date not available"}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Marketplace Profile */}
            <section className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="p-4 border-b border-base-200 bg-base-200/30">
                    <h4 className="font-semibold flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-store text-accent" />
                        Marketplace Profile
                    </h4>
                </div>
                <div className="p-4 space-y-6">
                    {/* Professional Profile */}
                    <div className="space-y-4">
                        <h5 className="text-sm font-semibold opacity-80 uppercase tracking-wider flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-user-tie text-primary" />
                            Professional Details
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                                    Work Availability
                                </span>
                                <div className="font-medium flex items-center gap-2">
                                    {candidate.marketplace_profile
                                        ?.available_for_work ? (
                                        <>
                                            <i className="fa-duotone fa-regular fa-check-circle text-success" />
                                            <span className="text-success">
                                                Available
                                            </span>
                                        </>
                                    ) : candidate.marketplace_profile
                                          ?.available_for_work === false ? (
                                        <>
                                            <i className="fa-duotone fa-regular fa-times-circle text-error" />
                                            <span className="text-error">
                                                Unavailable
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-base-content/60">
                                            Not specified
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                                    Max Concurrent Roles
                                </span>
                                <span className="font-medium">
                                    {candidate.marketplace_profile
                                        ?.max_concurrent_roles ||
                                        "Not specified"}
                                </span>
                            </div>
                        </div>

                        {/* Professional Links */}
                        {candidate.marketplace_profile?.linkedin_url ||
                        candidate.marketplace_profile?.website_url ? (
                            <div className="flex flex-col">
                                <span className="text-xs font-medium opacity-60 uppercase tracking-wider mb-2">
                                    Professional Links
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.marketplace_profile
                                        ?.linkedin_url && (
                                        <a
                                            href={
                                                candidate.marketplace_profile
                                                    .linkedin_url
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-xs btn-ghost gap-1.5 text-base-content/70"
                                        >
                                            <i className="fa-brands fa-linkedin" />
                                            Professional LinkedIn
                                        </a>
                                    )}
                                    {candidate.marketplace_profile
                                        ?.website_url && (
                                        <a
                                            href={
                                                candidate.marketplace_profile
                                                    .website_url
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-xs btn-ghost gap-1.5 text-base-content/70"
                                        >
                                            <i className="fa-duotone fa-regular fa-globe" />
                                            Professional Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                                    Professional Links
                                </span>
                                <span className="text-sm text-base-content/60 italic">
                                    No additional professional links provided
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Recruitment Specialization */}
                    <div className="space-y-4">
                        <h5 className="text-sm font-semibold opacity-80 uppercase tracking-wider flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-bullseye text-secondary" />
                            Recruitment Specialization
                        </h5>

                        {/* Industries */}
                        <div className="flex flex-col">
                            <span className="text-xs font-medium opacity-60 uppercase tracking-wider mb-2">
                                Industries
                            </span>
                            {candidate.marketplace_profile?.industries
                                ?.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {candidate.marketplace_profile.industries.map(
                                        (industry, i) => (
                                            <span
                                                key={i}
                                                className="badge badge-lg bg-primary/10 border-primary/20 text-primary p-3"
                                            >
                                                {industry}
                                            </span>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <span className="text-sm text-base-content/60 italic">
                                    No industry specializations listed
                                </span>
                            )}
                        </div>

                        {/* Job Levels */}
                        <div className="flex flex-col">
                            <span className="text-xs font-medium opacity-60 uppercase tracking-wider mb-2">
                                Job Levels
                            </span>
                            {candidate.marketplace_profile?.job_levels
                                ?.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {candidate.marketplace_profile.job_levels.map(
                                        (level, i) => (
                                            <span
                                                key={i}
                                                className="badge badge-lg bg-secondary/10 border-secondary/20 text-secondary p-3"
                                            >
                                                {level}
                                            </span>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <span className="text-sm text-base-content/60 italic">
                                    No job level specializations listed
                                </span>
                            )}
                        </div>

                        {/* Skills Expertise */}
                        <div className="flex flex-col">
                            <span className="text-xs font-medium opacity-60 uppercase tracking-wider mb-2">
                                Skills Expertise
                            </span>
                            {candidate.marketplace_profile?.skills_expertise
                                ?.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {candidate.marketplace_profile.skills_expertise.map(
                                        (skill, i) => (
                                            <span
                                                key={i}
                                                className="badge badge-lg bg-accent/10 border-accent/20 text-accent p-3"
                                            >
                                                {skill}
                                            </span>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <span className="text-sm text-base-content/60 italic">
                                    No skills expertise listed
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Rates and Fees */}
                    <div className="space-y-4">
                        <h5 className="text-sm font-semibold opacity-80 uppercase tracking-wider flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-dollar-sign text-success" />
                            Rates & Fees
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                                    Fee Structure
                                </span>
                                <span className="font-medium capitalize">
                                    {candidate.marketplace_profile
                                        ?.placement_fee_type || "Not specified"}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium opacity-60 uppercase tracking-wider">
                                    Fee Amount
                                </span>
                                <span className="font-medium">
                                    {candidate.marketplace_profile
                                        ?.placement_fee_amount
                                        ? candidate.marketplace_profile
                                              .placement_fee_type ===
                                          "percentage"
                                            ? `${candidate.marketplace_profile.placement_fee_amount}%`
                                            : `$${candidate.marketplace_profile.placement_fee_amount.toLocaleString()}`
                                        : "Not specified"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Communication Preferences */}
                    <div className="space-y-4">
                        <h5 className="text-sm font-semibold opacity-80 uppercase tracking-wider flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-comments text-info" />
                            Communication Preferences
                        </h5>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium opacity-60 uppercase tracking-wider mb-2">
                                Preferred Methods
                            </span>
                            {candidate.marketplace_profile
                                ?.preferred_communication?.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {candidate.marketplace_profile.preferred_communication.map(
                                        (method, i) => (
                                            <span
                                                key={i}
                                                className="badge badge-lg bg-info/10 border-info/20 text-info p-3 capitalize"
                                            >
                                                {method.replace(/_/g, " ")}
                                            </span>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <span className="text-sm text-base-content/60 italic">
                                    No communication preferences specified
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ResumeTab({ resumeMetadata }: { resumeMetadata?: ResumeMetadata }) {
    if (!resumeMetadata) {
        return (
            <div className="p-8 text-center text-sm text-base-content/60">
                <i className="fa-duotone fa-regular fa-file-circle-question text-3xl mb-2 block" />
                <p>No resume metadata available.</p>
                <p className="text-xs mt-1">Upload a resume and set it as primary to extract structured data.</p>
            </div>
        );
    }

    const formatDate = (dateStr: string | undefined | null): string => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        if (!month) return year;
        const date = new Date(Number(year), Number(month) - 1);
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };

    const proficiencyColor = (p?: string): string => {
        switch (p) {
            case "expert": return "badge-primary";
            case "advanced": return "badge-secondary";
            case "intermediate": return "badge-accent";
            case "beginner": return "badge-ghost";
            default: return "bg-base-200 border-base-300";
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="flex flex-wrap gap-3">
                {resumeMetadata.total_years_experience != null && (
                    <div className="badge badge-lg gap-1.5 p-3 bg-primary/10 border-primary/20 text-primary">
                        <i className="fa-duotone fa-regular fa-clock" />
                        {resumeMetadata.total_years_experience} years experience
                    </div>
                )}
                {resumeMetadata.highest_degree && resumeMetadata.highest_degree !== "none" && (
                    <div className="badge badge-lg gap-1.5 p-3 bg-secondary/10 border-secondary/20 text-secondary">
                        <i className="fa-duotone fa-regular fa-graduation-cap" />
                        {resumeMetadata.highest_degree.charAt(0).toUpperCase() + resumeMetadata.highest_degree.slice(1)}
                    </div>
                )}
                {resumeMetadata.skills_count != null && resumeMetadata.skills_count > 0 && (
                    <div className="badge badge-lg gap-1.5 p-3 bg-accent/10 border-accent/20 text-accent">
                        <i className="fa-duotone fa-regular fa-code" />
                        {resumeMetadata.skills_count} skills
                    </div>
                )}
            </div>

            {/* Professional Summary */}
            {resumeMetadata.professional_summary && (
                <section>
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-address-card text-primary" />
                        Professional Summary
                    </h4>
                    <p className="text-base-content/80 bg-base-200/50 p-4 rounded-lg border border-base-200">
                        {resumeMetadata.professional_summary}
                    </p>
                </section>
            )}

            {/* Experience */}
            {resumeMetadata.experience.length > 0 && (
                <section className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="p-4 border-b border-base-200 bg-base-200/30">
                        <h4 className="font-semibold flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-briefcase text-accent" />
                            Experience
                        </h4>
                    </div>
                    <div className="p-4 space-y-4">
                        {resumeMetadata.experience.map((exp, i) => (
                            <div key={i} className={`flex gap-4 ${i > 0 ? "pt-4 border-t border-base-200" : ""}`}>
                                <div className="flex flex-col items-center pt-1">
                                    <div className={`w-3 h-3 rounded-full ${exp.is_current ? "bg-success" : "bg-base-300"}`} />
                                    {i < resumeMetadata.experience.length - 1 && (
                                        <div className="w-px flex-1 bg-base-300 mt-1" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold">{exp.title}</div>
                                    <div className="text-sm text-base-content/70">
                                        {exp.company}
                                        {exp.location && <span className="text-base-content/50"> - {exp.location}</span>}
                                    </div>
                                    <div className="text-xs text-base-content/50 mt-0.5">
                                        {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                    </div>
                                    {exp.description && (
                                        <p className="text-sm text-base-content/70 mt-2">{exp.description}</p>
                                    )}
                                    {exp.highlights && exp.highlights.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {exp.highlights.map((h, j) => (
                                                <li key={j} className="text-sm text-base-content/70 flex gap-2">
                                                    <span className="text-primary mt-0.5">&#8226;</span>
                                                    <span>{h}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {resumeMetadata.education.length > 0 && (
                <section className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="p-4 border-b border-base-200 bg-base-200/30">
                        <h4 className="font-semibold flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-graduation-cap text-secondary" />
                            Education
                        </h4>
                    </div>
                    <div className="p-4 space-y-4">
                        {resumeMetadata.education.map((edu, i) => (
                            <div key={i} className={`${i > 0 ? "pt-4 border-t border-base-200" : ""}`}>
                                <div className="font-semibold">{edu.institution}</div>
                                {(edu.degree || edu.field_of_study) && (
                                    <div className="text-sm text-base-content/70">
                                        {[edu.degree, edu.field_of_study].filter(Boolean).join(" in ")}
                                    </div>
                                )}
                                {(edu.start_date || edu.end_date) && (
                                    <div className="text-xs text-base-content/50 mt-0.5">
                                        {formatDate(edu.start_date)}{edu.start_date && edu.end_date ? " - " : ""}{formatDate(edu.end_date)}
                                    </div>
                                )}
                                {edu.gpa && (
                                    <div className="text-xs text-base-content/50 mt-0.5">GPA: {edu.gpa}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {resumeMetadata.skills.length > 0 && (
                <section className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="p-4 border-b border-base-200 bg-base-200/30">
                        <h4 className="font-semibold flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-laptop-code text-primary" />
                            Skills
                        </h4>
                    </div>
                    <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                            {resumeMetadata.skills.map((skill, i) => (
                                <span
                                    key={i}
                                    className={`badge badge-lg p-3 ${proficiencyColor(skill.proficiency)}`}
                                    title={[
                                        skill.category?.replace(/_/g, " "),
                                        skill.proficiency,
                                        skill.years_used ? `${skill.years_used}y` : null,
                                    ].filter(Boolean).join(" - ")}
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Certifications */}
            {resumeMetadata.certifications.length > 0 && (
                <section className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="p-4 border-b border-base-200 bg-base-200/30">
                        <h4 className="font-semibold flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-award text-warning" />
                            Certifications
                        </h4>
                    </div>
                    <div className="p-4 space-y-3">
                        {resumeMetadata.certifications.map((cert, i) => (
                            <div key={i} className={`${i > 0 ? "pt-3 border-t border-base-200" : ""}`}>
                                <div className="font-semibold">{cert.name}</div>
                                {cert.issuer && (
                                    <div className="text-sm text-base-content/70">{cert.issuer}</div>
                                )}
                                {(cert.date_obtained || cert.expiry_date) && (
                                    <div className="text-xs text-base-content/50 mt-0.5">
                                        {cert.date_obtained ? `Obtained ${formatDate(cert.date_obtained)}` : ""}
                                        {cert.date_obtained && cert.expiry_date ? " - " : ""}
                                        {cert.expiry_date ? `Expires ${formatDate(cert.expiry_date)}` : ""}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Extraction info */}
            <div className="text-xs text-base-content/40 flex items-center gap-1.5">
                <i className="fa-duotone fa-regular fa-robot" />
                Extracted from resume
                {resumeMetadata.extracted_at && (
                    <span>on {new Date(resumeMetadata.extracted_at).toLocaleDateString()}</span>
                )}
            </div>
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
