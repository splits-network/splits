'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Application } from '../hooks/use-candidate-dashboard-data';
import { Button, EmptyState } from '@splits-network/memphis-ui';
import { ACCENT, accentAt } from './accent';
import { MemphisCard, MemphisBtn, MemphisSkeleton } from './primitives';

interface NextStepsFeedProps {
    applications: Application[];
    loading?: boolean;
}

interface NextStepItem {
    id: string;
    priority: number;
    icon: string;
    accent: number; // index into ACCENT array
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

            // P1: Offers — yellow accent (index 2)
            if (app.stage === 'offer') {
                result.push({
                    id: `offer-${app.id}`,
                    priority: 1,
                    icon: 'fa-trophy',
                    accent: 2, // yellow
                    title: `Offer from ${company}`,
                    description: jobTitle,
                    timeLabel: updatedTime,
                    cta: 'Review Offer',
                    href: '/portal/applications',
                });
                return;
            }

            // P2: Upcoming interviews — teal accent (index 1)
            if (app.stage === 'interview' || app.stage === 'final_interview') {
                result.push({
                    id: `interview-${app.id}`,
                    priority: 2,
                    icon: 'fa-calendar-check',
                    accent: 1, // teal
                    title: `Interview with ${company}`,
                    description: jobTitle,
                    timeLabel: updatedTime,
                    cta: 'Prepare',
                    href: '/portal/applications',
                });
                return;
            }

            // P3: Recruiter requests — purple accent (index 3)
            if (app.stage === 'recruiter_request') {
                result.push({
                    id: `recruiter-${app.id}`,
                    priority: 3,
                    icon: 'fa-user-tie',
                    accent: 3, // purple
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
                        accent: 0, // coral (stale = attention)
                        title: `${jobTitle} hasn't moved`,
                        description: `At ${getStageName(app.stage)} for ${daysSinceUpdate} days`,
                        timeLabel: `${daysSinceUpdate}d stale`,
                        cta: 'Follow Up',
                        href: '/portal/applications',
                    });
                    return;
                }
            }

            // P6: Recent submissions (fallback) — cycling accent
            if (!['rejected', 'withdrawn', 'hired', 'expired', 'draft'].includes(app.stage)) {
                result.push({
                    id: `recent-${app.id}`,
                    priority: 6,
                    icon: 'fa-paper-plane',
                    accent: 1, // teal
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
        <MemphisCard
            title="What's Next"
            icon="fa-compass"
            accent={ACCENT[0]}
            headerRight={
                <MemphisBtn href="/portal/applications" accent={ACCENT[0]} variant="ghost" size="sm">
                    All applications <i className="fa-duotone fa-regular fa-arrow-right" />
                </MemphisBtn>
            }
        >
            {loading ? (
                <MemphisSkeleton count={4} />
            ) : items.length > 0 ? (
                <div className="flex flex-col gap-1 -mx-2">
                    {items.map((item) => {
                        const accent = accentAt(item.accent);
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="flex items-center gap-3 p-3 hover:bg-dark/5 transition-all duration-150 group border-b border-dark/10 last:border-0"
                            >
                                {/* Priority icon — Memphis square badge */}
                                <div className={`w-9 h-9 border-4 border-dark ${accent.bg} flex items-center justify-center shrink-0`}>
                                    <i className={`fa-duotone fa-regular ${item.icon} text-sm ${accent.textOnBg}`}></i>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-dark group-hover:text-coral transition-colors truncate">
                                        {item.title}
                                    </div>
                                    <div className="text-[10px] text-dark/40 truncate">
                                        {item.description}
                                    </div>
                                </div>

                                {/* Time + CTA */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-dark/30 hidden sm:block">
                                        {item.timeLabel}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-coral opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.cta}
                                        <i className="fa-duotone fa-regular fa-chevron-right text-[8px] ml-0.5"></i>
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    icon="fa-duotone fa-regular fa-compass"
                    title="No actions yet"
                    description="Start applying to jobs to build your pipeline"
                    color="teal"
                    action={
                        <Link href="/public/jobs" className="inline-flex">
                            <Button color="coral" size="sm">
                                <i className="fa-duotone fa-regular fa-search"></i>
                                Browse Jobs
                            </Button>
                        </Link>
                    }
                    className="border-0"
                />
            )}
        </MemphisCard>
    );
}
