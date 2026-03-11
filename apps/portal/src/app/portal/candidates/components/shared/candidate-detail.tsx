"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    BaselTabBar,
    PanelHeader,
    type PanelStat,
} from "@splits-network/basel-ui";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@splits-network/shared-ui";
import type { Candidate } from "../../types";
import {
    formatJobType,
    formatAvailability,
    formatVerificationStatus,
} from "../../types";
import { statusColorName } from "./status-color";
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
import RequestToRepresentModal from "../modals/request-to-represent-modal";
import { useUserProfile } from "@/contexts";
import { ModalPortal } from "@splits-network/shared-ui";
import {
    LevelBadge,
    BadgeGrid,
    useGamification,
} from "@splits-network/shared-gamification";

/* ─── Tab Types ─────────────────────────────────────────────────────────── */

type TabType = "overview" | "resume" | "applications" | "documents";

const TABS = [
    {
        value: "overview",
        label: "Overview",
        icon: "fa-duotone fa-regular fa-user",
    },
    {
        value: "resume",
        label: "Resume",
        icon: "fa-duotone fa-regular fa-file-user",
    },
    {
        value: "applications",
        label: "Applications",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        value: "documents",
        label: "Documents",
        icon: "fa-duotone fa-regular fa-file-lines",
    },
];

/* ─── Badge class mapping ──────────────────────────────────────────────── */

const VERIFICATION_BADGE_CLASS: Record<string, string> = {
    success: "badge-success",
    warning: "badge-warning badge-soft badge-outline",
    info: "badge-info badge-soft",
    error: "badge-error",
    neutral: "badge-ghost",
};

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
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDetail = useCallback(
        async (id: string, signal?: { cancelled: boolean }) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: Candidate }>(
                    `/candidates/${id}`,
                    { params: { include: "skills" } },
                );
                if (!signal?.cancelled) setCandidate(res.data);
            } catch (err) {
                console.error("Failed to fetch candidate detail:", err);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);

        fetchDetail(candidateId, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });

        return () => {
            signal.cancelled = true;
        };
    }, [candidateId, refreshKey, fetchDetail]);

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
            onRefresh={handleRefresh}
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
    const [showRTRModal, setShowRTRModal] = useState(false);
    const { isRecruiter } = useUserProfile();
    const { registerEntities, getLevel, getBadges } = useGamification();

    useEffect(() => {
        registerEntities("candidate", [candidate.id]);
    }, [candidate.id, registerEntities]);

    const level = getLevel(candidate.id);
    const badges = getBadges(candidate.id);

    /* Lazy-loaded applications */
    const [applications, setApplications] = useState<any[]>([]);
    const [appsLoading, setAppsLoading] = useState(false);

    const tabsWithCounts = useMemo(
        () =>
            TABS.map((tab) =>
                tab.value === "applications"
                    ? { ...tab, count: applications.length }
                    : tab,
            ),
        [applications.length],
    );

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

    /* Build header badges */
    const verificationColor = statusColorName(candidate.verification_status);
    const headerBadges = [
        {
            label: formatVerificationStatus(candidate.verification_status),
            className:
                VERIFICATION_BADGE_CLASS[verificationColor] || "badge-ghost",
        },
        ...(isNew(candidate)
            ? [
                  {
                      label: "New",
                      className: "badge-warning badge-soft badge-outline",
                  },
              ]
            : []),
        ...(!candidate.user_id
            ? [{ label: "No Account", className: "badge-error" }]
            : []),
    ];

    /* Build meta items */
    const meta = [
        candidate.email && {
            icon: "fa-duotone fa-regular fa-envelope",
            text: candidate.email,
            href: `mailto:${candidate.email}`,
        },
        candidate.phone && {
            icon: "fa-duotone fa-regular fa-phone",
            text: candidate.phone,
        },
        candidate.location && {
            icon: "fa-duotone fa-regular fa-location-dot",
            text: candidate.location,
        },
    ].filter(Boolean) as { icon: string; text: string; href?: string }[];

    /* Build stats (available data only) */
    const stats: PanelStat[] = [
        ...(skills.length > 0
            ? [
                  {
                      label: "Skills",
                      value: String(skills.length),
                      icon: "fa-duotone fa-regular fa-code",
                  },
              ]
            : []),
    ];

    /* Social links */
    const socialLinks = [
        candidate.linkedin_url && {
            href: candidate.linkedin_url,
            icon: "fa-brands fa-linkedin",
            label: "LinkedIn",
        },
        candidate.github_url && {
            href: candidate.github_url,
            icon: "fa-brands fa-github",
            label: "GitHub",
        },
        candidate.portfolio_url && {
            href: candidate.portfolio_url,
            icon: "fa-duotone fa-regular fa-globe",
            label: "Portfolio",
        },
    ].filter(Boolean) as { href: string; icon: string; label: string }[];

    return (
        <div className="flex flex-col h-full w-full min-h-0 bg-base-100">
            {/* Dark header */}
            <PanelHeader
                kicker={company || ""}
                badges={headerBadges}
                avatar={{ initials }}
                avatarOverlay={
                    level ? (
                        <div className="absolute -bottom-1.5 -right-2">
                            <LevelBadge level={level} size="sm" />
                        </div>
                    ) : undefined
                }
                title={name}
                subtitle={title || "Title not set"}
                meta={meta}
                stats={stats}
                actions={
                    <CandidateActionsToolbar
                        candidate={candidate}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{ viewDetails: false }}
                    />
                }
                onClose={onClose}
            />

            {/* Social links row */}
            {socialLinks.length > 0 && (
                <div className="flex items-center gap-4 px-6 py-3 border-b border-base-300 bg-base-100">
                    {socialLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-base-content/50 hover:text-primary flex items-center gap-1.5"
                        >
                            <i className={link.icon} />
                            {link.label}
                        </a>
                    ))}
                </div>
            )}

            {/* Tab Bar */}
            <BaselTabBar
                tabs={tabsWithCounts}
                active={activeTab}
                onChange={(v) => setActiveTab(v as TabType)}
            />

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                {activeTab === "overview" && (
                    <OverviewTab
                        candidate={candidate}
                        bioText={bioText}
                        skills={skills}
                        salary={salary}
                        badges={badges}
                        onRequestRTR={
                            isRecruiter &&
                            !candidate.has_active_relationship &&
                            !candidate.has_pending_invitation &&
                            candidate.email
                                ? () => setShowRTRModal(true)
                                : undefined
                        }
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

            {/* RTR Modal */}
            <ModalPortal>
                {showRTRModal && (
                    <RequestToRepresentModal
                        isOpen={showRTRModal}
                        onClose={() => setShowRTRModal(false)}
                        onSuccess={() => {
                            setShowRTRModal(false);
                            onRefresh?.();
                        }}
                        candidateId={candidate.id}
                        candidateName={candidate.full_name || "Unknown"}
                        candidateEmail={candidate.email || ""}
                    />
                )}
            </ModalPortal>
        </div>
    );
}

/* ─── Overview Tab ──────────────────────────────────────────────────────── */

function OverviewTab({
    candidate,
    bioText,
    skills,
    salary,
    badges,
    onRequestRTR,
}: {
    candidate: Candidate;
    bioText?: string;
    skills: string[];
    salary: string | null;
    badges: import("@splits-network/shared-gamification").BadgeAward[];
    onRequestRTR?: () => void;
}) {
    return (
        <div className="space-y-8 p-6">
            {/* About / Bio */}
            {bioText ? (
                <div className="border-l-4 border-l-primary pl-6">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                        About
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-line">
                        {bioText}
                    </p>
                </div>
            ) : (
                <div className="border-l-4 border-l-base-300 pl-6">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                        About
                    </p>
                    <p className="text-sm text-base-content/40 italic">
                        No biography added. Edit the profile to include one.
                    </p>
                </div>
            )}

            {/* Career Preferences */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Career Preferences
                </p>
                <div className="grid grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Desired Salary
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {salary || "N/A"}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Job Type
                        </p>
                        <p className="text-lg font-black tracking-tight capitalize">
                            {formatJobType(candidate.desired_job_type)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Availability
                        </p>
                        <p className="text-lg font-black tracking-tight capitalize">
                            {formatAvailability(candidate.availability)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Work Mode
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {candidate.open_to_remote && (
                                <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-success/15 text-success">
                                    Remote
                                </span>
                            )}
                            {candidate.open_to_relocation && (
                                <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-info/15 text-info">
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
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Skills & Expertise
                </p>
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
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Profile Status
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
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
                            <div>
                                <p className="font-bold text-sm text-base-content/50 flex items-center gap-1.5">
                                    <i className="fa-duotone fa-regular fa-user-xmark" />
                                    Unrepresented
                                </p>
                                {onRequestRTR && (
                                    <button
                                        type="button"
                                        className="text-xs font-bold text-accent hover:text-accent-content hover:bg-accent px-2 py-1 mt-1.5 uppercase tracking-wider transition-colors"
                                        style={{ borderRadius: 0 }}
                                        onClick={onRequestRTR}
                                    >
                                        <i className="fa-duotone fa-regular fa-handshake mr-1" />
                                        Request to Represent
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Verification
                        </p>
                        <p className="font-bold text-sm capitalize">
                            {formatVerificationStatus(
                                candidate.verification_status,
                            )}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Platform Account
                        </p>
                        {candidate.user_id ? (
                            <p className="font-bold text-sm text-success flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-user-check" />
                                Registered
                            </p>
                        ) : (
                            <p className="font-bold text-sm text-error flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-user-slash" />
                                No Account
                            </p>
                        )}
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Marketplace
                        </p>
                        <p className="font-bold text-sm capitalize">
                            {candidate.marketplace_visibility ||
                                "Not configured"}
                        </p>
                    </div>
                    {candidate.onboarding_status && (
                        <div className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Onboarding
                            </p>
                            <p className="font-bold text-sm capitalize">
                                {candidate.onboarding_status.replace(/_/g, " ")}
                            </p>
                        </div>
                    )}
                    {candidate.created_at && (
                        <div className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
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

            {/* Achievements */}
            {badges.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Achievements
                    </p>
                    <BadgeGrid badges={badges} maxVisible={6} />
                </div>
            )}
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
                    Resume parsing is not yet available. Upload documents in the
                    Documents tab.
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
                        This candidate has not been submitted to any roles. Use
                        Send Opportunity to get started.
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
                        <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-base-200 text-base-content/60">
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
                    No files have been uploaded for this candidate. Document
                    management is coming soon.
                </p>
            </div>
        </div>
    );
}
