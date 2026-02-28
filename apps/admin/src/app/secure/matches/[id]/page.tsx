'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { AdminPageHeader, AdminEmptyState, AdminErrorState, AdminLoadingState } from '@/components/shared';
import { createAuthenticatedClient } from '@/lib/api-client';
import { MatchOverview } from './components/match-overview';
import { MatchFactors, type MatchFactor } from './components/match-factors';

type MatchDetail = {
    id: string;
    candidate_name: string;
    candidate_email: string;
    job_title: string;
    company: string;
    score: number;
    status: string;
    created_at: string;
    updated_at: string;
    factors: MatchFactor[];
};

export default function MatchDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { getToken } = useAuth();
    const [match, setMatch] = useState<MatchDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const token = await getToken();
                if (!token) throw new Error('Not authenticated');
                const client = createAuthenticatedClient(token);
                const data = await client.get<{ data: MatchDetail }>(`/matching/admin/matches/${id}`);
                setMatch(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load match');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) return <AdminLoadingState />;
    if (error) return <AdminErrorState message={error} />;
    if (!match) return <AdminEmptyState icon="fa-circle-question" title="Match not found" />;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <AdminPageHeader
                title="Match Detail"
                subtitle={`Score breakdown for match #${id}`}
                actions={
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => router.back()}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left" />
                        Back
                    </button>
                }
            />

            <div className="flex flex-col gap-4">
                <MatchOverview match={match} />
                <MatchFactors factors={match.factors ?? []} />
            </div>
        </div>
    );
}
