'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import type { ApiResponse } from '@splits-network/shared-api-client';

export interface CandidateStats {
    applications: number;
    activeApplications: number;
    responseRate: number;
    interviews: number;
    offers: number;
    active_relationships: number;
}

export interface Application {
    id: string;
    stage: string;
    created_at: string;
    updated_at?: string;
    job?: {
        title?: string;
        status?: string;
        company?: {
            name?: string;
        };
    };
    recruiter?: {
        user?: {
            id?: string;
        };
    };
}

export interface ActiveRecruiter {
    id: string;
    recruiter_name: string;
    recruiter_email: string;
    status: string;
    relationship_start_date: string;
    relationship_end_date: string;
    days_until_expiry?: number;
}

const DEFAULT_STATS: CandidateStats = {
    applications: 0,
    activeApplications: 0,
    responseRate: 0,
    interviews: 0,
    offers: 0,
    active_relationships: 0,
};

export function useCandidateDashboardData() {
    const { getToken } = useAuth();
    const [stats, setStats] = useState<CandidateStats>(DEFAULT_STATS);
    const [applications, setApplications] = useState<Application[]>([]);
    const [activeRecruiters, setActiveRecruiters] = useState<ActiveRecruiter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            // Fetch applications and recruiter relationships in parallel
            const [appsResult, recruitersResult] = await Promise.allSettled([
                client.get<ApiResponse<Application[]>>('/applications', {
                    params: { include: 'job,company,recruiter' },
                }),
                client.get<ApiResponse<ActiveRecruiter[]>>('/recruiter-candidates'),
            ]);

            // Process applications
            const allApps = appsResult.status === 'fulfilled'
                ? (appsResult.value.data || [])
                : [];

            setApplications(allApps);

            // Compute stats
            const terminalStages = ['rejected', 'withdrawn', 'hired', 'expired'];
            const activeApplications = allApps.filter(app =>
                !terminalStages.includes(app.stage) &&
                app.stage !== 'draft' &&
                app.job?.status !== 'closed' && app.job?.status !== 'filled'
            ).length;

            // Response rate: % of submitted apps that got a company response
            // Pre-submission stages don't count as "submitted to company"
            const preSubmissionStages = ['draft', 'ai_review', 'ai_reviewed', 'recruiter_request', 'recruiter_proposed', 'recruiter_review'];
            const submittedToCompany = allApps.filter(a => !preSubmissionStages.includes(a.stage));
            const gotResponse = submittedToCompany.filter(a =>
                !['submitted', 'company_review'].includes(a.stage)
            );
            const responseRate = submittedToCompany.length > 0
                ? Math.round((gotResponse.length / submittedToCompany.length) * 100)
                : 0;

            const newStats: CandidateStats = {
                applications: allApps.length,
                activeApplications,
                responseRate,
                interviews: allApps.filter(
                    app => app.stage === 'interview' || app.stage === 'final_interview'
                ).length,
                offers: allApps.filter(app => app.stage === 'offer').length,
                active_relationships: 0,
            };

            if (recruitersResult.status === 'fulfilled') {
                const relationships = recruitersResult.value.data || [];
                const active = relationships.filter(
                    (rel: any) => rel.status === 'active'
                );
                newStats.active_relationships = active.length;
                setActiveRecruiters(active);
            }

            setStats(newStats);
        } catch (err: any) {
            console.error('[CandidateDashboard] Failed to load:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { stats, applications, activeRecruiters, loading, error, refresh };
}
