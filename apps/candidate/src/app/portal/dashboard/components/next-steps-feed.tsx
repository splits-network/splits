'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Application } from '../hooks/use-candidate-dashboard-data';
import { ContentCard, EmptyState } from '@/components/ui/cards';
import { SkeletonList } from '@splits-network/shared-ui';

interface NextStepsFeedProps {
    applications: Application[];
    loading?: boolean;
}

interface NextStepItem {
    id: string;
    priority: number;
    icon: string;
    iconColor: string;
    iconBg: string;
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

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
}

function getStageName(stage: string): string {
    const names: Record<string, string> = {
        draft: 'Draft',
        ai_review: 'AI Review',
        ai_reviewed: 'AI Reviewed',
        recruiter_request: 'Recruiter Review',
        recruiter_proposed: 'Recruiter Proposed',
        recruiter_review: 'Recruiter Review',
        submitted: 'Submitted',
        company_review: 'Company Review',
        company_feedback: 'Company Feedback',
        screen: 'Screening',
        interview: 'Interview',
        final_interview: 'Final Interview',
        offer: 'Offer',
        hired: 'Hired',
    };
    return names[stage] || stage;
}

export default function NextStepsFeed({ applications, loading }: NextStepsFeedProps) {
    const items = useMemo(() => {
        const result: NextStepItem[] = [];
        const now = new Date();

        applications.forEach(app => {
            const jobTitle = app.job?.title || 'Unknown Position';
            const company = app.job?.company?.name || 'Unknown Company';
            const timeLabel = getRelativeTime(app.created_at);
            const updatedTime = app.updated_at ? getRelativeTime(app.updated_at) : timeLabel;

            // Skip terminal + closed
            if (app.job?.status === 'closed' || app.job?.status === 'filled') return;

            // P1: Offers
            if (app.stage === 'offer') {
                result.push({
                    id: `offer-${app.id}`,
                    priority: 1,
                    icon: 'fa-trophy',
                    iconColor: 'text-warning',
                    iconBg: 'bg-warning/10',
                    title: `Offer from ${company}`,
                    description: jobTitle,
                    timeLabel: updatedTime,
                    cta: 'Review Offer',
                    href: '/portal/applications',
                });
                return;
            }

            // P2: Upcoming interviews
            if (app.stage === 'interview' || app.stage === 'final_interview') {
                result.push({
                    id: `interview-${app.id}`,
                    priority: 2,
                    icon: 'fa-calendar-check',
                    iconColor: 'text-success',
                    iconBg: 'bg-success/10',
                    title: `Interview with ${company}`,
                    description: jobTitle,
                    timeLabel: updatedTime,
                    cta: 'Prepare',
                    href: '/portal/applications',
                });
                return;
            }

            // P3: Recruiter requests
            if (app.stage === 'recruiter_request') {
                result.push({
                    id: `recruiter-${app.id}`,
                    priority: 3,
                    icon: 'fa-user-tie',
                    iconColor: 'text-info',
                    iconBg: 'bg-info/10',
                    title: `Recruiter wants to discuss`,
                    description: `${jobTitle} at ${company}`,
                    timeLabel: updatedTime,
                    cta: 'View',
                    href: '/portal/applications',
                });
                return;
            }

            // P4: Stale applications (14+ days without movement)
            if (app.updated_at && !['rejected', 'withdrawn', 'hired', 'expired', 'draft'].includes(app.stage)) {
                const daysSinceUpdate = Math.floor(
                    (now.getTime() - new Date(app.updated_at).getTime()) / (1000 * 60 * 60 * 24)
                );
                if (daysSinceUpdate >= 14) {
                    result.push({
                        id: `stale-${app.id}`,
                        priority: 5,
                        icon: 'fa-clock',
                        iconColor: 'text-base-content/50',
                        iconBg: 'bg-base-200',
                        title: `${jobTitle} hasn't moved`,
                        description: `At ${getStageName(app.stage)} for ${daysSinceUpdate} days`,
                        timeLabel: `${daysSinceUpdate}d stale`,
                        cta: 'Follow Up',
                        href: '/portal/applications',
                    });
                    return;
                }
            }

            // P6: Recent submissions (fallback)
            if (!['rejected', 'withdrawn', 'hired', 'expired', 'draft'].includes(app.stage)) {
                result.push({
                    id: `recent-${app.id}`,
                    priority: 6,
                    icon: 'fa-paper-plane',
                    iconColor: 'text-primary',
                    iconBg: 'bg-primary/10',
                    title: `Applied to ${jobTitle}`,
                    description: company,
                    timeLabel,
                    cta: 'Track',
                    href: '/portal/applications',
                });
            }
        });

        return result
            .sort((a, b) => a.priority - b.priority)
            .slice(0, MAX_ITEMS);
    }, [applications]);

    return (
        <ContentCard
            title="What's next"
            icon="fa-compass"
            className="bg-base-200"
            headerActions={
                <Link href="/portal/applications" className="btn btn-sm btn-ghost text-xs">
                    All applications
                    <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                </Link>
            }
        >
            {loading ? (
                <SkeletonList count={4} variant="text-block" gap="gap-3" />
            ) : items.length > 0 ? (
                <div className="flex flex-col gap-1 -mx-2">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-100 transition-all duration-150 group"
                        >
                            {/* Priority icon */}
                            <div className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                                <i className={`fa-duotone fa-regular ${item.icon} text-sm ${item.iconColor}`}></i>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-base-content group-hover:text-primary transition-colors truncate">
                                    {item.title}
                                </div>
                                <div className="text-xs text-base-content/50 truncate">
                                    {item.description}
                                </div>
                            </div>

                            {/* Time + CTA */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-base-content/40 hidden sm:block">
                                    {item.timeLabel}
                                </span>
                                <span className="btn btn-ghost btn-xs text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.cta}
                                    <i className="fa-duotone fa-regular fa-chevron-right text-[8px] ml-0.5"></i>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="fa-compass"
                    title="No actions yet"
                    description="Start applying to jobs to build your pipeline"
                    size="sm"
                    card={false}
                    action={
                        <Link href="/public/jobs" className="btn btn-primary btn-sm">
                            <i className="fa-duotone fa-regular fa-search"></i>
                            Browse Jobs
                        </Link>
                    }
                />
            )}
        </ContentCard>
    );
}
