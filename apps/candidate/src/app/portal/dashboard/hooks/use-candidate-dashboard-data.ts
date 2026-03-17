'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import type { ApiResponse } from '@splits-network/shared-api-client';
import type { EnrichedMatch } from '@splits-network/shared-types';

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
    expired_at?: string | null;
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
    recruiter_user_id: string | null;
    status: string;
    relationship_start_date: string;
    relationship_end_date: string;
    days_until_expiry?: number;
}

export interface PendingInvitation {
    id: string;
    recruiter_name: string;
    recruiter_email: string;
    invitation_token: string;
    invitation_expires_at: string;
    invited_at: string;
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
    const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
    const [topMatches, setTopMatches] = useState<EnrichedMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            // Fetch applications, recruiter relationships, and top matches in parallel
            const [appsResult, recruitersResult, matchesResult] = await Promise.allSettled([
                client.get<ApiResponse<Application[]>>('/applications/views/listing', {
                    params: { limit: 100 },
                }),
                client.get<ApiResponse<ActiveRecruiter[]>>('/recruiter-candidates/views/list-for-candidate'),
                client.get<{ data: EnrichedMatch[] }>('/matches', {
                    params: { limit: 5, status: 'active' },
                }),
            ]);

            // Process applications
            const allApps = appsResult.status === 'fulfilled'
                ? (appsResult.value.data || [])
                : [];

            setApplications(allApps);

            // Compute stats
            const terminalStages = ['rejected', 'withdrawn', 'hired'];
            const activeApplications = allApps.filter(app =>
                !terminalStages.includes(app.stage) &&
                !app.expired_at &&
                app.stage !== 'draft' &&
                app.job?.status !== 'closed' && app.job?.status !== 'filled'
            ).length;

            // Response rate: % of submitted apps that got a company response
            // Pre-submission stages don't count as "submitted to company"
            const preSubmissionStages = ['draft', 'ai_review', 'gpt_review', 'ai_failed', 'ai_reviewed', 'recruiter_request', 'recruiter_proposed', 'recruiter_review'];
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
                    (rel: any) => rel.consent_given && rel.status === 'active'
                );
                newStats.active_relationships = active.length;
                setActiveRecruiters(active);

                // Pending invitations: has token, no consent, not declined
                const pending: PendingInvitation[] = relationships
                    .filter(
                        (rel: any) => rel.invitation_token && !rel.consent_given && !rel.declined_at
                    )
                    .map((rel: any) => ({
                        id: rel.id,
                        recruiter_name: rel.recruiter_name || rel.recruiter_email || 'Unknown',
                        recruiter_email: rel.recruiter_email || '',
                        invitation_token: rel.invitation_token,
                        invitation_expires_at: rel.invitation_expires_at || '',
                        invited_at: rel.created_at || '',
                    }));
                setPendingInvitations(pending);
            }

            // Process top matches
            if (matchesResult.status === 'fulfilled') {
                setTopMatches(matchesResult.value.data || []);
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

    return { stats, applications, activeRecruiters, pendingInvitations, topMatches, loading, error, refresh };
}
