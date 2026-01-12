'use client';

import Link from 'next/link';
import { DataRow, DataList, KeyMetric, MetricCard, VerticalDataRow } from '@/components/ui/cards';
import { formatRelativeTime } from '@/lib/utils';
import { getApplicationStageBadge } from '@/lib/utils/badge-styles';
import type { ApplicationStage } from '@splits-network/shared-types';

// ===== TYPES =====

export interface Application {
    id: string;
    job_id: string;
    company_name?: string;
    candidate_id: string;
    recruiter_id?: string;
    stage: ApplicationStage;
    accepted_by_company: boolean;
    accepted_at?: string;
    ai_reviewed: boolean;
    created_at: string;
    updated_at: string;
    candidate: {
        id: string;
        full_name: string;
        email: string;
        linkedin_url?: string;
        _masked?: boolean;
    };
    recruiter?: {
        id: string;
        name: string;
        email: string;
    };
    job: {
        id: string;
        title: string;
        company_id?: string;
        company?: {
            id: string;
            name: string;
        };
    };
    ai_review?: {
        fit_score: number;
        recommendation: 'strong_fit' | 'good_fit' | 'fair_fit' | 'poor_fit';
    };
}

interface Badge {
    class: string;
    icon: string;
    text?: string;
    tooltip?: string;
    animated?: boolean;
}

// ===== APPLICATION CARD COMPONENT =====

interface ApplicationCardProps {
    application: Application;
    canAccept?: boolean;
    isAccepting?: boolean;
    onAccept?: () => void;
    formatDate: (date: string | Date) => string;
}

// Get AI score color
function getAIScoreColor(score: number): string {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-info';
    if (score >= 40) return 'text-warning';
    return 'text-error';
}

// Get AI recommendation badge
function getAIRecommendationBadge(recommendation: string): string {
    switch (recommendation) {
        case 'strong_fit':
            return 'badge-success';
        case 'good_fit':
            return 'badge-info';
        case 'fair_fit':
            return 'badge-warning';
        case 'poor_fit':
            return 'badge-error';
        default:
            return 'badge-ghost';
    }
}

export function ApplicationCard({
    application,
    canAccept = false,
    isAccepting = false,
    onAccept,
    formatDate,
}: ApplicationCardProps) {
    const companyName = application.company_name || application.job?.company?.name || 'Unknown Company';
    const hasAIReview = application.ai_reviewed && application.ai_review;
    const isMasked = application.candidate._masked;

    // Calculate badges
    const badges: Badge[] = [];

    if (application.accepted_by_company) {
        badges.push({
            class: 'badge-success',
            icon: 'fa-check-circle',
            text: 'Accepted',
            tooltip: 'Accepted by company',
        });
    }

    if (hasAIReview) {
        badges.push({
            class: getAIRecommendationBadge(application.ai_review!.recommendation),
            icon: 'fa-robot',
            text: `AI: ${application.ai_review!.fit_score}%`,
            tooltip: `AI Fit Score: ${application.ai_review!.recommendation.replace('_', ' ')}`,
        });
    }

    if (application.stage === 'screen') {
        badges.push({
            class: 'badge-warning',
            icon: 'fa-clock',
            text: 'Awaiting Review',
            tooltip: 'Pending company review',
            animated: true,
        });
    }

    if (isMasked) {
        badges.push({
            class: 'badge-warning',
            icon: 'fa-eye-slash',
            text: 'Anonymous',
            tooltip: 'Anonymous candidate',
        });
    }
    console.log('Rendering ApplicationCard for:', application);
    return (
        <MetricCard className="group hover:shadow-lg transition-all duration-200">
            <MetricCard.Header>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex justify-between w-full items-center">
                        {/* Candidate Avatar */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="avatar avatar-placeholder shrink-0">
                                <div className="bg-base-200 text-base-content/70 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold">
                                    {isMasked ? (
                                        <i className="fa-duotone fa-regular fa-user-secret"></i>
                                    ) : (
                                        application.candidate.full_name[0].toUpperCase()
                                    )}
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors truncate">
                                    {application.candidate.full_name}
                                </h3>
                                <p className="text-sm text-base-content/60 truncate">
                                    {application.job.title}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            {/* Stage Badge */}
                            <div className={`badge ${getApplicationStageBadge(application.stage)} shrink-0`}>
                                {application.stage}
                            </div>
                        </div>
                    </div>
                </div>
            </MetricCard.Header>
            <MetricCard.Body>
                {/* Key Metric */}
                <KeyMetric
                    label="AI Fit Score"
                    value={hasAIReview ? `${application.ai_review!.fit_score}%` : '—'}
                    valueColor={hasAIReview ? getAIScoreColor(application.ai_review!.fit_score) : 'text-base-content/50'}
                    progress={hasAIReview ? application.ai_review!.fit_score : undefined}
                    progressColor={hasAIReview && application.ai_review!.fit_score >= 70 ? 'success' : hasAIReview && application.ai_review!.fit_score >= 50 ? 'info' : 'warning'}
                />
                {/* Data Rows */}
                <DataList compact>
                    <VerticalDataRow
                        icon="fa-building"
                        label="Company"
                        value={companyName}
                    />
                    <VerticalDataRow
                        icon="fa-briefcase"
                        label="Position"
                        value={application.job.title}
                    />
                    {!isMasked && (
                        <VerticalDataRow
                            icon="fa-envelope"
                            label="Email"
                            value={application.candidate.email}
                        />
                    )}
                    {application.recruiter && (
                        <VerticalDataRow
                            icon="fa-user-tie"
                            label="Recruiter"
                            value={application.recruiter.name}
                        />
                    )}
                </DataList>
                {/* Badges Row */}
                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {badges.map((badge: Badge, idx: number) => (
                            <span
                                key={idx}
                                className={`badge badge-sm ${badge.class} gap-1 ${badge.animated ? 'animate-pulse' : ''}`}
                                title={badge.tooltip}
                            >
                                <i className={`fa-duotone fa-regular ${badge.icon}`}></i>
                                {badge.text}
                            </span>
                        ))}
                    </div>
                )}
            </MetricCard.Body>
            <MetricCard.Footer>
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-base-content/50">
                        Submitted {formatRelativeTime(application.created_at)}
                    </span>
                    <div className="flex items-center gap-2">
                        {canAccept && onAccept && (
                            <span
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onAccept();
                                }}
                                className="btn btn-ghost btn-xs"
                            >
                                {isAccepting ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs"></span>
                                        Accepting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-check"></i>
                                        Accept
                                    </>
                                )}
                            </span>
                        )}
                        <span className="text-primary text-sm font-medium group-hover:underline">
                            <Link href={`/portal/applications/${application.id}`}>
                                View Details →
                            </Link>
                        </span>
                    </div>
                </div>
            </MetricCard.Footer>
        </MetricCard>
    );
}
