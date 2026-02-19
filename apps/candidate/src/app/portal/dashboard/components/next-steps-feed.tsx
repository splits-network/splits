"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BaselEmptyState } from "@splits-network/basel-ui";
import type { Application } from "../hooks/use-candidate-dashboard-data";

interface NextStepsFeedProps {
    applications: Application[];
    loading?: boolean;
}

interface NextStepItem {
    id: string;
    priority: number;
    icon: string;
    colorClass: string;
    bgClass: string;
    title: string;
    description: string;
    timeLabel: string;
    cta: string;
    href: string;
}

const MAX_ITEMS = 6;

function getRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
}

function getStageName(stage: string): string {
    const names: Record<string, string> = {
        draft: "Draft",
        ai_review: "AI Review",
        ai_reviewed: "AI Reviewed",
        recruiter_request: "Recruiter Review",
        recruiter_proposed: "Recruiter Proposed",
        recruiter_review: "Recruiter Review",
        submitted: "Submitted",
        company_review: "Company Review",
        company_feedback: "Company Feedback",
        screen: "Screening",
        interview: "Interview",
        final_interview: "Final Interview",
        offer: "Offer",
        hired: "Hired",
    };
    return names[stage] || stage;
}

export default function NextStepsFeed({
    applications,
    loading,
}: NextStepsFeedProps) {
    const items = useMemo(() => {
        const result: NextStepItem[] = [];
        const now = new Date();

        applications.forEach((app) => {
            const jobTitle = app.job?.title || "Unknown Position";
            const company = app.job?.company?.name || "Unknown Company";
            const timeLabel = getRelativeTime(app.created_at);
            const updatedTime = app.updated_at
                ? getRelativeTime(app.updated_at)
                : timeLabel;

            if (app.job?.status === "closed" || app.job?.status === "filled")
                return;

            // P1: Offers
            if (app.stage === "offer") {
                result.push({
                    id: `offer-${app.id}`,
                    priority: 1,
                    icon: "fa-trophy",
                    colorClass: "text-accent",
                    bgClass: "bg-accent/15",
                    title: `Offer from ${company}`,
                    description: jobTitle,
                    timeLabel: updatedTime,
                    cta: "Review Offer",
                    href: "/portal/applications",
                });
                return;
            }

            // P2: Upcoming interviews
            if (
                app.stage === "interview" ||
                app.stage === "final_interview"
            ) {
                result.push({
                    id: `interview-${app.id}`,
                    priority: 2,
                    icon: "fa-calendar-check",
                    colorClass: "text-warning",
                    bgClass: "bg-warning/15",
                    title: `Interview with ${company}`,
                    description: jobTitle,
                    timeLabel: updatedTime,
                    cta: "Prepare",
                    href: "/portal/applications",
                });
                return;
            }

            // P3: Recruiter requests
            if (app.stage === "recruiter_request") {
                result.push({
                    id: `recruiter-${app.id}`,
                    priority: 3,
                    icon: "fa-user-tie",
                    colorClass: "text-secondary",
                    bgClass: "bg-secondary/15",
                    title: "Recruiter wants to discuss",
                    description: `${jobTitle} at ${company}`,
                    timeLabel: updatedTime,
                    cta: "View",
                    href: "/portal/applications",
                });
                return;
            }

            // P4: Stale applications (14+ days)
            if (
                app.updated_at &&
                !["rejected", "withdrawn", "hired", "expired", "draft"].includes(
                    app.stage,
                )
            ) {
                const daysSinceUpdate = Math.floor(
                    (now.getTime() - new Date(app.updated_at).getTime()) /
                        (1000 * 60 * 60 * 24),
                );
                if (daysSinceUpdate >= 14) {
                    result.push({
                        id: `stale-${app.id}`,
                        priority: 5,
                        icon: "fa-clock",
                        colorClass: "text-error",
                        bgClass: "bg-error/15",
                        title: `${jobTitle} hasn't moved`,
                        description: `At ${getStageName(app.stage)} for ${daysSinceUpdate} days`,
                        timeLabel: `${daysSinceUpdate}d stale`,
                        cta: "Follow Up",
                        href: "/portal/applications",
                    });
                    return;
                }
            }

            // P6: Recent submissions
            if (
                !["rejected", "withdrawn", "hired", "expired", "draft"].includes(
                    app.stage,
                )
            ) {
                result.push({
                    id: `recent-${app.id}`,
                    priority: 6,
                    icon: "fa-paper-plane",
                    colorClass: "text-primary",
                    bgClass: "bg-primary/15",
                    title: `Applied to ${jobTitle}`,
                    description: company,
                    timeLabel,
                    cta: "Track",
                    href: "/portal/applications",
                });
            }
        });

        return result.sort((a, b) => a.priority - b.priority).slice(0, MAX_ITEMS);
    }, [applications]);

    if (loading) {
        return (
            <div className="bg-base-200 p-8 h-full">
                <div className="h-5 w-32 bg-base-content/10 animate-pulse mb-6" />
                <div className="space-y-4">
                    {[85, 72, 90, 78].map((w, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-base-content/10 animate-pulse shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div
                                    className="h-3.5 bg-base-content/10 animate-pulse"
                                    style={{ width: `${w}%` }}
                                />
                                <div
                                    className="h-2.5 bg-base-content/5 animate-pulse"
                                    style={{ width: `${w - 25}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-base-200 p-8 h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-base-content">
                        What&apos;s Next
                    </h3>
                    <p className="text-sm text-base-content/50">
                        Priority actions for your job search
                    </p>
                </div>
                <Link
                    href="/portal/applications"
                    className="btn btn-ghost btn-sm text-primary"
                    style={{ borderRadius: 0 }}
                >
                    All applications
                    <i className="fa-duotone fa-regular fa-arrow-right" />
                </Link>
            </div>

            {items.length > 0 ? (
                <div className="flex flex-col gap-0.5">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="flex items-center gap-3 p-3 -mx-3 hover:bg-base-300/60 transition-all duration-150 group border-b border-base-content/5 last:border-0"
                        >
                            <div
                                className={`w-9 h-9 ${item.bgClass} flex items-center justify-center shrink-0`}
                            >
                                <i
                                    className={`fa-duotone fa-regular ${item.icon} text-sm ${item.colorClass}`}
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-base-content group-hover:text-primary transition-colors truncate">
                                    {item.title}
                                </div>
                                <div className="text-xs text-base-content/40 truncate">
                                    {item.description}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/30 hidden sm:block">
                                    {item.timeLabel}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.cta}
                                    <i className="fa-duotone fa-regular fa-chevron-right text-[8px] ml-0.5" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <BaselEmptyState
                    icon="fa-duotone fa-regular fa-compass"
                    title="No actions yet"
                    description="Start applying to jobs to build your pipeline"
                    actions={[
                        {
                            label: "Browse Jobs",
                            icon: "fa-duotone fa-regular fa-search",
                            href: "/public/jobs",
                            style: "btn-primary",
                        },
                    ]}
                />
            )}
        </div>
    );
}
