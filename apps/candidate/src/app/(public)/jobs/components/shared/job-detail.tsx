"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { apiClient, createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import ApplicationWizardModal from "@/components/application-wizard-modal";
import { BaselBadge } from "@splits-network/basel-ui";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import type { Job } from "../../types";
import { formatCommuteTypes, formatJobLevel } from "../../types";
import { statusSemanticColor } from "./status-color";
import {
    salaryDisplay,
    formatEmploymentType,
    formatStatusLabel,
    isNew,
    companyName,
    companyInitials,
    requiredSkillNames,
    preferredSkillNames,
    matchScoreTextColor,
} from "./helpers";

/* ── Detail Panel ── */

interface JobDetailProps {
    job: Job;
    onClose?: () => void;
}

export function JobDetail({ job, onClose }: JobDetailProps) {
    const { isSignedIn, getToken } = useAuth();
    const { success: toastSuccess, error: toastError } = useToast();

    const [hasActiveRecruiter, setHasActiveRecruiter] = useState(false);
    const [savedJobId, setSavedJobId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [existingApplication, setExistingApplication] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const { registerEntities, getLevel: getCompanyLevel } = useGamification();
    const name = companyName(job);
    const salary = salaryDisplay(job);
    const commute = formatCommuteTypes(job.commute_types);
    const level = formatJobLevel(job.job_level);
    const companyGamLevel = job.company?.id ? getCompanyLevel(job.company.id) : undefined;

    useEffect(() => {
        if (job.company?.id) {
            registerEntities("company", [job.company.id]);
        }
    }, [job.company?.id, registerEntities]);

    const mandatoryReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "mandatory")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const preferredReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "preferred")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const reqSkills = requiredSkillNames(job);
    const prefSkills = preferredSkillNames(job);

    // Fetch auth-dependent data when signed in
    useEffect(() => {
        if (!isSignedIn) return;
        let cancelled = false;
        setAuthLoading(true);

        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;

                const authClient = createAuthenticatedClient(token);
                const [recruitersRes, applicationsRes, savedJobsRes] =
                    await Promise.all([
                        authClient.get<{ data: any[] }>(
                            "/recruiter-candidates",
                        ),
                        authClient.get<{ data: any[] }>("/applications"),
                        authClient.get<{ data: any[] }>(
                            `/saved-jobs?job_id=${job.id}`,
                        ),
                    ]);

                if (cancelled) return;

                setHasActiveRecruiter((recruitersRes.data?.length ?? 0) > 0);

                const applications = Array.isArray(applicationsRes.data)
                    ? applicationsRes.data
                    : [];
                const existing = applications.find(
                    (app: any) =>
                        app.job_id === job.id &&
                        !["rejected", "withdrawn"].includes(app.stage),
                );
                setExistingApplication(existing || null);

                const savedJobs = Array.isArray(savedJobsRes.data)
                    ? savedJobsRes.data
                    : [];
                const saved = savedJobs.find((s: any) => s.job_id === job.id);
                setSavedJobId(saved ? saved.id : null);
            } catch (err) {
                console.error("Failed to fetch auth data for job detail:", err);
            } finally {
                if (!cancelled) setAuthLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn, job.id]);

    const getButtonConfig = () => {
        if (!isSignedIn) {
            return {
                text: "Get Started",
                icon: "fa-rocket",
                action: () => {
                    window.location.href = `/sign-up?redirect_url=${encodeURIComponent(`/jobs/${job.id}`)}`;
                },
            };
        }

        if (authLoading) {
            return {
                text: "Loading...",
                icon: "fa-spinner fa-spin",
                action: () => {},
                disabled: true,
            };
        }

        if (existingApplication) {
            return {
                text: "Already Applied",
                icon: "fa-check-circle",
                action: () => {},
                disabled: true,
            };
        }

        return {
            text: hasActiveRecruiter ? "Send to Recruiter" : "Apply Now",
            icon: hasActiveRecruiter ? "fa-user-tie" : "fa-paper-plane",
            action: () => setShowWizard(true),
        };
    };

    const buttonConfig = getButtonConfig();

    const handleSaveToggle = async () => {
        if (!isSignedIn) {
            window.location.href = `/sign-in?redirect_url=${encodeURIComponent(`/jobs/${job.id}`)}`;
            return;
        }

        if (isSaving) return;
        setIsSaving(true);

        try {
            const token = await getToken();
            if (!token) throw new Error("Could not get auth token");
            const authClient = createAuthenticatedClient(token);

            if (savedJobId) {
                await authClient.delete(`/saved-jobs/${savedJobId}`);
                setSavedJobId(null);
                toastSuccess("Job removed from saved list");
            } else {
                const res = await authClient.post("/saved-jobs", {
                    job_id: job.id,
                });
                setSavedJobId(res.data.id);
                toastSuccess("Job saved successfully");
            }
        } catch (error) {
            console.error("Failed to toggle saved job:", error);
            toastError("Failed to update saved job status");
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        const shareUrl = `${window.location.origin}/jobs/${job.id}`;
        const shareText = `Check out this job: ${job.title} at ${name}`;
        const clipboardText = `${shareText}\n${shareUrl}`;
        try {
            if (navigator.share && navigator.canShare?.({ url: shareUrl })) {
                await navigator.share({
                    title: `${job.title} at ${name}`,
                    text: shareText,
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(clipboardText);
                toastSuccess("Job link copied to clipboard!");
            }
        } catch (error: any) {
            if (error.name !== "AbortError") {
                await navigator.clipboard.writeText(clipboardText);
                toastSuccess("Job link copied to clipboard!");
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div>
            {/* Sticky header */}
            <div className="sticky top-0 bg-base-100 border-b-2 border-base-300 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <BaselBadge
                                color={statusSemanticColor(job.status)}
                                variant="soft"
                                size="sm"
                            >
                                {formatStatusLabel(job.status)}
                            </BaselBadge>
                            {isNew(job) && (
                                <BaselBadge
                                    color="warning"
                                    variant="soft"
                                    size="sm"
                                    icon="fa-sparkles"
                                >
                                    New
                                </BaselBadge>
                            )}
                            {job.employment_type && (
                                <BaselBadge variant="outline" size="sm">
                                    {formatEmploymentType(job.employment_type)}
                                </BaselBadge>
                            )}
                            {level && (
                                <BaselBadge variant="outline" size="sm">
                                    {level}
                                </BaselBadge>
                            )}
                        </div>

                        {/* Department kicker */}
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                            {job.department || name}
                        </p>

                        {/* Title */}
                        <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-3">
                            {job.title}
                        </h2>

                        {/* Meta row */}
                        <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                            <span>
                                <i className="fa-duotone fa-regular fa-building mr-1" />
                                {name}
                            </span>
                            {job.location && (
                                <span>
                                    <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                    {job.location}
                                </span>
                            )}
                            <Link
                                href={`/jobs/${job.id}`}
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-xs" />
                                Full page
                            </Link>
                        </div>
                    </div>

                    {/* Match score + Close */}
                    <div className="flex items-start gap-3 shrink-0">
                        {job.match_score != null && (
                            <div className="text-right pt-1">
                                <span className={`text-2xl font-black leading-none ${matchScoreTextColor(job.match_score)}`}>
                                    {Math.round(job.match_score)}%
                                </span>
                                <span className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 block mt-0.5">
                                    Match
                                </span>
                            </div>
                        )}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="btn btn-sm btn-square btn-ghost"
                                style={{ borderRadius: 0 }}
                            >
                                <i className="fa-duotone fa-regular fa-xmark text-lg" />
                            </button>
                        )}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-4 flex gap-3">
                    <button
                        className={`btn ${buttonConfig.disabled ? "btn-disabled" : "btn-primary"} flex-1`}
                        style={{ borderRadius: 0 }}
                        onClick={buttonConfig.action}
                        disabled={buttonConfig.disabled}
                    >
                        <i
                            className={`fa-duotone fa-regular ${buttonConfig.icon} mr-2`}
                        />
                        {buttonConfig.text}
                    </button>
                    <button
                        className={`btn ${savedJobId ? "btn-secondary" : "btn-outline"}`}
                        style={{ borderRadius: 0 }}
                        title={
                            savedJobId ? "Remove from saved" : "Save for later"
                        }
                        onClick={handleSaveToggle}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <i className="fa-duotone fa-solid fa-spinner-third animate-spin" />
                        ) : (
                            <i
                                className={`fa-duotone ${savedJobId ? "fa-solid" : "fa-regular"} fa-bookmark`}
                            />
                        )}
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ borderRadius: 0 }}
                        title="Share"
                        onClick={handleShare}
                        disabled={isSharing}
                    >
                        <i className="fa-duotone fa-regular fa-share-nodes" />
                    </button>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="p-6 space-y-8">
                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="border-l-4 border-primary pl-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Compensation
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {salary || (
                                <span className="text-base-content/30 font-semibold text-sm">
                                    Not listed
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="border-l-4 border-secondary pl-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Work Style
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {commute || (
                                <span className="text-base-content/30 font-semibold text-sm">
                                    Not listed
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="border-l-4 border-accent pl-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Department
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {job.department || (
                                <span className="text-base-content/30 font-semibold text-sm">
                                    Not listed
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Description */}
                {(job.candidate_description || job.description) && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            About This Role
                        </h3>
                        <MarkdownRenderer
                            content={
                                (job.candidate_description || job.description)!
                            }
                            className="prose prose-sm max-w-none text-base-content/70 leading-relaxed"
                        />
                    </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    {level && (
                        <div className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Level
                            </p>
                            <p className="font-bold text-sm">{level}</p>
                        </div>
                    )}
                    {job.open_to_relocation && (
                        <div className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Relocation
                            </p>
                            <p className="font-bold text-sm">
                                Open to relocation
                            </p>
                        </div>
                    )}
                </div>

                {/* Must Have */}
                {mandatoryReqs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Must Have
                        </h3>
                        <ul className="space-y-2">
                            {mandatoryReqs.map((req) => (
                                <li
                                    key={req.id}
                                    className="flex items-start gap-3 text-base-content/70"
                                >
                                    <i className="fa-duotone fa-regular fa-check text-primary text-xs mt-1.5 flex-shrink-0" />
                                    <span className="leading-relaxed">
                                        {req.description}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Nice to Have */}
                {preferredReqs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Nice to Have
                        </h3>
                        <ul className="space-y-2">
                            {preferredReqs.map((req) => (
                                <li
                                    key={req.id}
                                    className="flex items-start gap-3 text-base-content/70"
                                >
                                    <i className="fa-duotone fa-regular fa-plus text-secondary text-xs mt-1.5 flex-shrink-0" />
                                    <span className="leading-relaxed">
                                        {req.description}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Required Skills */}
                {reqSkills.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Required Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {reqSkills.map((skill) => (
                                <BaselBadge key={skill} color="primary" variant="soft" size="sm">
                                    {skill}
                                </BaselBadge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Nice-to-Have Skills */}
                {prefSkills.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Nice-to-Have Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {prefSkills.map((skill) => (
                                <BaselBadge key={skill} variant="outline" size="sm">
                                    {skill}
                                </BaselBadge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Company info */}
                <div className="border-t-2 border-base-300 pt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                        About the Company
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative shrink-0">
                            {job.company?.logo_url ? (
                                <img
                                    src={job.company.logo_url}
                                    alt={name}
                                    className="w-12 h-12 object-contain border-2 border-base-300"
                                />
                            ) : (
                                <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-sm">
                                    {companyInitials(name)}
                                </div>
                            )}
                            {companyGamLevel && (
                                <div className="absolute -bottom-1.5 -right-2">
                                    <LevelBadge level={companyGamLevel} size="sm" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold">{name}</p>
                            {job.company?.industry && (
                                <p className="text-sm text-base-content/50">
                                    {job.company.industry}
                                </p>
                            )}
                            {job.company?.headquarters_location && (
                                <p className="text-sm text-base-content/50">
                                    <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                    {job.company.headquarters_location}
                                </p>
                            )}
                        </div>
                    </div>

                    {job.company?.description && (
                        <MarkdownRenderer
                            content={job.company.description}
                            className="prose prose-sm max-w-none text-base-content/60"
                        />
                    )}
                </div>

                {/* Bottom CTA */}
                {!isSignedIn && (
                    <div className="border-t-2 border-base-300 pt-6">
                        <div className="bg-primary/5 border-l-4 border-primary p-6">
                            <h3 className="font-black text-lg tracking-tight mb-2">
                                Interested in this role?
                            </h3>
                            <p className="text-sm text-base-content/60 mb-4">
                                Create your profile on Splits Network to apply
                                and get matched with more opportunities.
                            </p>
                            <a
                                href={`/sign-up?redirect_url=${encodeURIComponent(`/jobs/${job.id}`)}`}
                                className="btn btn-primary"
                                style={{ borderRadius: 0 }}
                            >
                                <i className="fa-duotone fa-regular fa-user-plus mr-2" />
                                Get Started
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Application Wizard Modal — portaled to body so it escapes overflow containers */}
            {showWizard &&
                createPortal(
                    <ApplicationWizardModal
                        jobId={job.id}
                        jobTitle={job.title}
                        companyName={name}
                        onClose={() => setShowWizard(false)}
                        onSuccess={() => setShowWizard(false)}
                    />,
                    document.body,
                )}
        </div>
    );
}

/* ── Detail Loader ── */

interface JobDetailLoaderProps {
    jobId: string;
    onClose?: () => void;
}

export function JobDetailLoader({ jobId, onClose }: JobDetailLoaderProps) {
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                // Optional auth — send token if available for personalized enrichment (e.g. match scores)
                const token = await getToken().catch(() => null);
                const client = token ? createAuthenticatedClient(token) : apiClient;
                const res = await client.get<{ data: Job }>(
                    `/jobs/${jobId}/view/candidate-detail`,
                );
                if (!cancelled) setJob(res.data);
            } catch (err) {
                console.error("Failed to fetch job detail:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [jobId]);

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

    return <JobDetail job={job} onClose={onClose} />;
}
