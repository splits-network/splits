"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useScrollReveal } from "@splits-network/basel-ui";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { formatSalary, formatRelativeTime } from "@/lib/utils";
import ApplicationWizardModal from "@/components/application-wizard-modal";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
    formatCommuteTypes,
    formatJobLevel,
    formatEmploymentType,
    getCompanyInitials,
    getCompanyName,
    getCompanyIndustry,
    getCompanyHQ,
    getStatusBadgeColor,
    formatStatus,
    shouldShowSalary,
    type Job,
    type JobRequirement,
} from "../../types";
import {
    LevelBadge,
    useGamification,
} from "@splits-network/shared-gamification";

interface JobDetailClientProps {
    job: Job;
    isAuthenticated: boolean;
    hasActiveRecruiter: boolean;
    existingApplication: any;
    initialSavedJobId: string | null;
}

export default function JobDetailClient({
    job,
    isAuthenticated,
    hasActiveRecruiter,
    existingApplication,
    initialSavedJobId,
}: JobDetailClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { getToken } = useAuth();

    const mainRef = useRef<HTMLElement>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const [savedJobId, setSavedJobId] = useState<string | null>(
        initialSavedJobId,
    );
    const [isSaving, setIsSaving] = useState(false);
    const saved = !!savedJobId;

    const { success: toastSuccess, error: toastError } = useToast();

    const { registerEntities, getLevel } = useGamification();
    const companyLevel = job.company?.id ? getLevel(job.company.id) : undefined;

    useEffect(() => {
        if (job.company?.id) {
            registerEntities("company", [job.company.id]);
        }
    }, [job.company?.id, registerEntities]);

    const handleSaveToggle = async () => {
        if (!isAuthenticated) {
            // Include `redirect_url` to come back here if we use standard clerk or just standard redirect
            router.push(
                `/sign-in?redirect_url=${encodeURIComponent(pathname)}`,
            );
            return;
        }

        if (isSaving) return;
        setIsSaving(true);

        try {
            const token = await getToken();
            if (!token) throw new Error("Could not get auth token");

            const client = createAuthenticatedClient(token);

            if (savedJobId) {
                // Delete
                await client.delete(`/saved-jobs/${savedJobId}`);
                setSavedJobId(null);
                toastSuccess("Job removed from saved list");
            } else {
                // Create
                const res = await client.post("/saved-jobs", {
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

    const companyDisplay = getCompanyName(job);
    const companyIndustry = getCompanyIndustry(job);
    const companyHQ = getCompanyHQ(job);
    const initials = getCompanyInitials(companyDisplay);
    const salary = shouldShowSalary(job)
        ? formatSalary(job.salary_min ?? 0, job.salary_max ?? 0)
        : null;
    const commuteDisplay = formatCommuteTypes(job.commute_types);
    const levelDisplay = formatJobLevel(job.job_level);
    const employmentDisplay = formatEmploymentType(job.employment_type);

    const mandatoryReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "mandatory")
        .sort((a, b) => a.sort_order - b.sort_order);
    const preferredReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "preferred")
        .sort((a, b) => a.sort_order - b.sort_order);

    useScrollReveal(mainRef);

    /* ─── Handlers ────────────────────────────────────────────────────── */

    const handleShare = async () => {
        setIsSharing(true);
        const shareUrl = `${window.location.origin}/jobs/${job.id}`;
        const shareText = `Check out this job: ${job.title} at ${companyDisplay}`;
        const clipboardText = `${shareText}\n${shareUrl}`;
        try {
            if (navigator.share && navigator.canShare?.({ url: shareUrl })) {
                await navigator.share({
                    title: `${job.title} at ${companyDisplay}`,
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

    const getButtonConfig = () => {
        if (!isAuthenticated) {
            return {
                text: "Get Started",
                icon: "fa-rocket",
                action: () => {
                    window.location.href = `/sign-in?redirect_url=${encodeURIComponent(`/jobs/${job.id}`)}`;
                },
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

    /* ─── Meta tags for hero ──────────────────────────────────────────── */

    const metaTags = [
        job.location
            ? {
                  icon: "fa-duotone fa-regular fa-location-dot",
                  text: job.location,
              }
            : null,
        commuteDisplay
            ? {
                  icon: "fa-duotone fa-regular fa-building-user",
                  text: commuteDisplay,
              }
            : null,
        job.employment_type
            ? {
                  icon: "fa-duotone fa-regular fa-briefcase",
                  text: employmentDisplay,
              }
            : null,
        levelDisplay
            ? {
                  icon: "fa-duotone fa-regular fa-signal",
                  text: levelDisplay,
              }
            : null,
        salary
            ? { icon: "fa-duotone fa-regular fa-dollar-sign", text: salary }
            : null,
    ].filter(Boolean) as { icon: string; text: string }[];

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Hero Header ─────────────────────────────────── */}
            <section className="relative bg-base-300 text-base-content py-16 lg:py-20">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative  container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl">
                        {/* Breadcrumb */}
                        <div className="scroll-reveal fade-up detail-kicker flex items-center gap-2 text-sm text-base-content/40 mb-6">
                            <Link
                                href="/jobs"
                                className="hover:text-base-content transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left mr-1" />
                                Jobs
                            </Link>
                            {job.department && (
                                <>
                                    <i className="fa-solid fa-chevron-right text-[8px]" />
                                    <span className="text-base-content/60">
                                        {job.department}
                                    </span>
                                </>
                            )}
                            <i className="fa-solid fa-chevron-right text-[8px]" />
                            <span className="text-base-content/70">
                                {job.title}
                            </span>
                        </div>

                        {/* Title + Company */}
                        <div className="flex items-start gap-5 mb-6">
                            <div className="relative flex-shrink-0">
                                {job.company?.logo_url ? (
                                    <img
                                        src={job.company.logo_url}
                                        alt={`${companyDisplay} logo`}
                                        className="w-14 h-14 object-contain"
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center font-black text-lg">
                                        {initials}
                                    </div>
                                )}
                                {companyLevel && (
                                    <div className="absolute -bottom-1 -right-1">
                                        <LevelBadge
                                            level={companyLevel}
                                            size="sm"
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight">
                                    <span className="scroll-reveal fade-up detail-title-word inline-block">
                                        {job.title}
                                    </span>
                                </h1>
                                <p className="scroll-reveal fade-up detail-meta text-lg text-base-content/60 mt-2">
                                    {companyDisplay}
                                </p>
                            </div>
                        </div>

                        {/* Meta tags */}
                        {metaTags.length > 0 && (
                            <div className="flex flex-wrap gap-3 mb-8">
                                {metaTags.map((tag, i) => (
                                    <span
                                        key={`${i}-${tag.text}`}
                                        className="scroll-reveal fade-up detail-meta flex items-center gap-1.5 px-3 py-1.5 bg-neutral-content/10 text-sm"
                                    >
                                        <i
                                            className={`${tag.icon} text-xs text-secondary`}
                                        />
                                        {tag.text}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                className={`scroll-reveal fade-up detail-action btn ${buttonConfig.disabled ? "btn-disabled" : "btn-primary"}`}
                                onClick={buttonConfig.action}
                                disabled={buttonConfig.disabled}
                            >
                                <i
                                    className={`fa-duotone fa-regular ${buttonConfig.icon}`}
                                />
                                {buttonConfig.text}
                            </button>
                            <button
                                onClick={handleSaveToggle}
                                disabled={isSaving}
                                className={`scroll-reveal fade-up detail-action btn ${saved ? "btn-secondary" : "btn-ghost border-neutral-content/20"}`}
                            >
                                {isSaving ? (
                                    <i className="fa-duotone fa-solid fa-spinner-third animate-spin" />
                                ) : (
                                    <i
                                        className={`fa-${saved ? "solid" : "regular"} fa-bookmark`}
                                    />
                                )}
                                {saved ? "Saved" : "Save"}
                            </button>
                            <button
                                className="scroll-reveal fade-up detail-action btn btn-ghost border-neutral-content/20"
                                onClick={handleShare}
                                disabled={isSharing}
                            >
                                <i className="fa-duotone fa-regular fa-share-nodes" />
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Status Bar ──────────────────────────────────── */}
            <section className="bg-base-200 border-b border-base-300 py-4">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-wrap items-center gap-6">
                        {job.status && (
                            <div className="flex items-center gap-2">
                                <span
                                    className={`w-2.5 h-2.5 rounded-full ${job.status === "active" ? "bg-success animate-pulse" : job.status === "paused" ? "bg-warning" : "bg-neutral"}`}
                                />
                                <span
                                    className={`text-sm font-bold ${job.status === "active" ? "text-success" : "text-base-content/60"}`}
                                >
                                    {formatStatus(job.status)}
                                </span>
                            </div>
                        )}
                        {(job.updated_at || job.created_at) && (
                            <div className="flex items-center gap-2 text-sm text-base-content/50">
                                <i className="fa-duotone fa-regular fa-calendar text-xs" />
                                Posted{" "}
                                {formatRelativeTime(
                                    job.updated_at ||
                                        (job.created_at as string),
                                )}
                            </div>
                        )}
                        {job.open_to_relocation && (
                            <div className="flex items-center gap-2 text-sm text-base-content/50">
                                <i className="fa-duotone fa-regular fa-butterfly text-xs" />
                                Open to relocation
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Content ─────────────────────────────────────── */}
            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
                    {/* ── Main Column ─────────────────────────── */}
                    <div className="lg:col-span-3">
                        {/* Description */}
                        <div className="scroll-reveal fade-up detail-section mb-10">
                            <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-file-lines text-primary" />
                                About This Role
                            </h2>
                            <div className="text-base-content/70 leading-relaxed">
                                <MarkdownRenderer
                                    content={
                                        job.candidate_description ||
                                        job.description ||
                                        ""
                                    }
                                />
                            </div>
                        </div>

                        {/* Mandatory Requirements */}
                        {mandatoryReqs.length > 0 && (
                            <div className="scroll-reveal fade-up detail-section mb-10">
                                <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-list-check text-primary" />
                                    Requirements
                                </h2>
                                <div className="space-y-3">
                                    {mandatoryReqs.map((req) => (
                                        <div
                                            key={req.id}
                                            className="flex gap-3"
                                        >
                                            <div className="w-6 h-6 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <i className="fa-duotone fa-regular fa-check text-primary text-xs" />
                                            </div>
                                            <span className="text-base-content/70 text-sm leading-relaxed">
                                                {req.description}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preferred Requirements */}
                        {preferredReqs.length > 0 && (
                            <div className="scroll-reveal fade-up detail-section mb-10">
                                <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-star text-primary" />
                                    Nice to Have
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {preferredReqs.map((req) => (
                                        <span
                                            key={req.id}
                                            className="px-3 py-1.5 bg-base-200 text-base-content/50 text-xs font-semibold border border-base-300"
                                        >
                                            {req.description}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No requirements fallback */}
                        {!mandatoryReqs.length && !preferredReqs.length && (
                            <div className="scroll-reveal fade-up detail-section mb-10">
                                <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-list-check text-primary" />
                                    Requirements
                                </h2>
                                <p className="text-sm text-base-content/50">
                                    No specific requirements listed for this
                                    role.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ──────────────────────────────── */}
                    <div className="lg:col-span-2">
                        {/* Apply CTA */}
                        <div className="bg-primary text-primary-content p-6 mb-6">
                            <h3 className="text-lg font-black mb-3">
                                {isAuthenticated
                                    ? hasActiveRecruiter
                                        ? "Send to Your Recruiter"
                                        : "Apply for This Role"
                                    : "Interested in This Role?"}
                            </h3>
                            <p className="text-sm opacity-80 mb-4">
                                {isAuthenticated
                                    ? existingApplication
                                        ? "You've already submitted an application for this position."
                                        : `Submit your application for ${job.title} at ${companyDisplay}.`
                                    : "Create an account to apply and track your application status."}
                            </p>
                            {salary && (
                                <div className="text-xs opacity-60 mb-4">
                                    <div className="flex justify-between py-1.5 border-b border-white/10">
                                        <span>Salary Range</span>
                                        <span className="font-bold">
                                            {salary}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {isAuthenticated ? (
                                <button
                                    className="btn bg-white text-primary hover:bg-white/90 border-0 w-full btn-sm"
                                    onClick={buttonConfig.action}
                                    disabled={buttonConfig.disabled}
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${buttonConfig.icon}`}
                                    />
                                    {buttonConfig.text}
                                </button>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href={`/sign-up?redirect_url=${encodeURIComponent(`/jobs/${job.id}`)}`}
                                        className="btn bg-white text-primary hover:bg-white/90 border-0 w-full btn-sm"
                                    >
                                        <i className="fa-duotone fa-regular fa-user-plus" />
                                        Create Account
                                    </Link>
                                    <Link
                                        href={`/sign-in?redirect_url=${encodeURIComponent(`/jobs/${job.id}`)}`}
                                        className="btn btn-ghost border-white/20 text-white w-full btn-sm"
                                    >
                                        <i className="fa-duotone fa-regular fa-right-to-bracket" />
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Job Details Card */}
                        <div className="bg-base-200 border-t-4 border-secondary p-6 mb-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                                Job Details
                            </h3>
                            <div className="space-y-2 text-sm">
                                {job.department && (
                                    <div className="flex justify-between py-1 border-b border-base-300">
                                        <span className="text-base-content/50">
                                            Department
                                        </span>
                                        <span className="font-semibold">
                                            {job.department}
                                        </span>
                                    </div>
                                )}
                                {job.employment_type && (
                                    <div className="flex justify-between py-1 border-b border-base-300">
                                        <span className="text-base-content/50">
                                            Type
                                        </span>
                                        <span className="font-semibold">
                                            {employmentDisplay}
                                        </span>
                                    </div>
                                )}
                                {levelDisplay && (
                                    <div className="flex justify-between py-1 border-b border-base-300">
                                        <span className="text-base-content/50">
                                            Level
                                        </span>
                                        <span className="font-semibold">
                                            {levelDisplay}
                                        </span>
                                    </div>
                                )}
                                {commuteDisplay && (
                                    <div className="flex justify-between py-1 border-b border-base-300">
                                        <span className="text-base-content/50">
                                            Work Type
                                        </span>
                                        <span className="font-semibold">
                                            {commuteDisplay}
                                        </span>
                                    </div>
                                )}
                                {job.location && (
                                    <div className="flex justify-between py-1 border-b border-base-300">
                                        <span className="text-base-content/50">
                                            Location
                                        </span>
                                        <span className="font-semibold">
                                            {job.location}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between py-1">
                                    <span className="text-base-content/50">
                                        Job ID
                                    </span>
                                    <span className="font-mono text-xs">
                                        {job.id.slice(0, 8)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Company Info Card */}
                        <div className="bg-base-200 border-t-4 border-accent p-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                                Company Info
                            </h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative shrink-0">
                                    {job.company?.logo_url ? (
                                        <img
                                            src={job.company.logo_url}
                                            alt={`${companyDisplay} logo`}
                                            className="w-12 h-12 object-contain"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-accent text-accent-content flex items-center justify-center font-black text-lg">
                                            {initials}
                                        </div>
                                    )}
                                    {companyLevel && (
                                        <div className="absolute -bottom-1 -right-1">
                                            <LevelBadge
                                                level={companyLevel}
                                                size="sm"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold">
                                        {companyDisplay}
                                    </div>
                                    {companyIndustry && (
                                        <div className="text-xs text-base-content/50">
                                            {companyIndustry}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {(companyHQ || job.company?.description) && (
                                <div className="space-y-2 text-sm">
                                    {companyHQ && (
                                        <div className="flex justify-between py-1 border-b border-base-300">
                                            <span className="text-base-content/50">
                                                Headquarters
                                            </span>
                                            <span className="font-semibold">
                                                {companyHQ}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {job.company?.description && (
                                <div className="mt-4 text-sm text-base-content/60 leading-relaxed">
                                    <MarkdownRenderer
                                        content={job.company.description}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Application Wizard Modal */}
            {showWizard && (
                <ApplicationWizardModal
                    jobId={job.id}
                    jobTitle={job.title}
                    companyName={companyDisplay}
                    onClose={() => setShowWizard(false)}
                    onSuccess={() => {
                        setShowWizard(false);
                    }}
                />
            )}
        </main>
    );
}
