'use client';

import { useMemo } from 'react';
import { StatCard, StatCardGrid } from '@/components/ui/cards';
import type { ApplicationStage } from '@splits-network/shared-types';

interface Application {
    id: string;
    stage: ApplicationStage;
    accepted_by_company: boolean;
    ai_reviewed: boolean;
}

interface ApplicationsStatsProps {
    applications: Application[];
    total: number;
    isAdmin: boolean;
    isRecruiter: boolean;
    isCompanyUser: boolean;
}

const personaDescriptor = (isAdmin: boolean, isRecruiter: boolean, isCompanyUser: boolean) => {
    if (isAdmin) return 'System-wide';
    if (isRecruiter) return 'Assigned to you';
    if (isCompanyUser) return 'In your company';
    return 'Your activity';
};

export default function ApplicationsStats({
    applications,
    total,
    isAdmin,
    isRecruiter,
    isCompanyUser,
}: ApplicationsStatsProps) {
    const stats = useMemo(() => {
        const awaitingReviewStages = new Set(['submitted', 'screen', 'interview']);

        return applications.reduce(
            (acc, application) => {
                if (awaitingReviewStages.has(application.stage)) {
                    acc.awaitingReview += 1;
                }
                if (application.stage === 'ai_review' && !application.ai_reviewed) {
                    acc.aiPending += 1;
                }
                if (application.accepted_by_company) {
                    acc.acceptedByCompany += 1;
                }
                return acc;
            },
            { awaitingReview: 0, aiPending: 0, acceptedByCompany: 0 },
        );
    }, [applications]);

    return (
        <StatCardGrid className="m-2 shadow-lg">
            <StatCard
                title="Total Applications"
                value={total}
                icon="fa-folder-open"
                color="primary"
                description={personaDescriptor(isAdmin, isRecruiter, isCompanyUser)}
            />
            <StatCard
                title="Awaiting Review"
                value={stats.awaitingReview}
                icon="fa-hourglass-half"
                color="warning"
                description="Need action"
            />
            <StatCard
                title="AI Reviews Pending"
                value={stats.aiPending}
                icon="fa-robot"
                color="info"
                description="Queued for AI triage"
            />
            <StatCard
                title="Accepted by Company"
                value={stats.acceptedByCompany}
                icon="fa-circle-check"
                color="success"
                description="Greenlit offers"
            />
        </StatCardGrid>
    );
}
