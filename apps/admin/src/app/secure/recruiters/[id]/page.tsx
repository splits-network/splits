'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { AdminPageHeader, AdminLoadingState, AdminErrorState } from '@/components/shared';
import { RecruiterOverview } from './components/recruiter-overview';
import { RecruiterCompanies } from './components/recruiter-companies';
import { RecruiterActions } from './components/recruiter-detail-actions';

export type RecruiterDetail = {
    id: string;
    user_id: string;
    status: 'pending' | 'active' | 'suspended' | 'inactive';
    bio: string | null;
    tagline: string | null;
    location: string | null;
    phone: string | null;
    years_experience: number | null;
    industries: string[] | null;
    specialties: string[] | null;
    marketplace_enabled: boolean;
    marketplace_visibility: string | null;
    candidate_recruiter: boolean;
    company_recruiter: boolean;
    stripe_connect_onboarded: boolean;
    stripe_connect_onboarded_at: string | null;
    slug: string | null;
    created_at: string;
    updated_at: string | null;
    user: {
        id: string;
        name: string | null;
        email: string;
        avatar_url: string | null;
        created_at: string;
    } | null;
    reputation: {
        reputation_score: number;
        total_submissions: number;
        total_hires: number;
        hire_rate: number;
        total_placements: number;
        completed_placements: number;
        failed_placements: number;
        completion_rate: number;
        avg_response_time_hours: number;
        proposals_accepted: number;
        proposals_declined: number;
        last_calculated_at: string | null;
    } | null;
    firm_membership: {
        id: string;
        role: string;
        firm: { id: string; name: string; slug: string | null; status: string } | null;
    } | null;
    companies: Array<{
        id: string;
        status: string;
        relationship_type: string;
        company: { id: string; name: string; logo_url: string | null } | null;
        created_at: string;
    }>;
    candidate_count: number;
};

type Tab = 'overview' | 'companies';

export default function RecruiterDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { getToken } = useAuth();
    const [recruiter, setRecruiter] = useState<RecruiterDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const fetchRecruiter = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) { setError('Not authenticated'); setLoading(false); return; }
            const client = createAuthenticatedClient(token);
            const res = await client.get<{ data: RecruiterDetail }>(`/network/admin/recruiters/${id}`);
            setRecruiter((res as { data: RecruiterDetail }).data);
        } catch {
            setError('Failed to load recruiter');
        } finally {
            setLoading(false);
        }
    }, [id, getToken]);

    useEffect(() => { void fetchRecruiter(); }, [fetchRecruiter]);

    if (loading) return <div className="p-6"><AdminLoadingState /></div>;
    if (error || !recruiter) return (
        <div className="p-6"><AdminErrorState message={error ?? 'Recruiter not found'} /></div>
    );

    const name = recruiter.user?.name ?? 'Unknown Recruiter';

    const STATUS_BADGE: Record<string, string> = {
        active: 'badge-success',
        pending: 'badge-warning',
        suspended: 'badge-error',
        inactive: 'badge-ghost',
    };

    return (
        <div>
            <button
                className="btn btn-ghost btn-sm gap-2 mb-3"
                onClick={() => router.push('/secure/recruiters')}
            >
                <i className="fa-duotone fa-regular fa-arrow-left" />
                Back to Recruiters
            </button>

            <AdminPageHeader
                title={name}
                subtitle={recruiter.user?.email ?? undefined}
                actions={
                    <div className="flex items-center gap-2">
                        <span className={`badge badge-lg capitalize ${STATUS_BADGE[recruiter.status] ?? 'badge-ghost'}`}>
                            {recruiter.status}
                        </span>
                        <RecruiterActions
                            recruiterId={recruiter.id}
                            currentStatus={recruiter.status}
                            onSuccess={fetchRecruiter}
                        />
                    </div>
                }
            />

            <div role="tablist" className="tabs tabs-border mb-6">
                <button
                    role="tab"
                    className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <i className="fa-duotone fa-regular fa-circle-info mr-2" />
                    Overview
                </button>
                <button
                    role="tab"
                    className={`tab ${activeTab === 'companies' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('companies')}
                >
                    <i className="fa-duotone fa-regular fa-building mr-2" />
                    Companies ({recruiter.companies.length})
                </button>
            </div>

            {activeTab === 'overview' && (
                <RecruiterOverview recruiter={recruiter} onUpdate={fetchRecruiter} />
            )}
            {activeTab === 'companies' && (
                <RecruiterCompanies companies={recruiter.companies} />
            )}
        </div>
    );
}
