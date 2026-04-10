'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { AdminPageHeader, AdminLoadingState, AdminErrorState } from '@/components/shared';
import { JobOverview } from './components/job-overview';
import { JobCandidates } from './components/job-candidates';
import { JobActions } from '../components/job-actions';

export type JobDetail = {
    id: string;
    title: string;
    status: string;
    commute_types: string[] | null;
    commute_type: string | null;
    job_level: string | null;
    employment_type: string | null;
    description: string | null;
    recruiter_description: string | null;
    requirements: string | null;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string | null;
    fee_percentage: number | null;
    guarantee_days: number | null;
    location: string | null;
    city: string | null;
    state: string | null;
    department: string | null;
    is_early_access: boolean;
    is_priority: boolean;
    activates_at: string | null;
    closes_at: string | null;
    company: { id: string; name: string; logo_url: string | null; industry: string | null } | null;
    stage_counts: Record<string, number>;
    created_at: string;
    updated_at: string | null;
};

type Tab = 'overview' | 'candidates';

export default function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { getToken } = useAuth();
    const [job, setJob] = useState<JobDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const fetchJob = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) { setError('Not authenticated'); setLoading(false); return; }
            const client = createAuthenticatedClient(token);
            const res = await client.get<{ data: JobDetail }>(`/ats/admin/jobs/${id}`);
            setJob((res as { data: JobDetail }).data);
        } catch {
            setError('Failed to load job');
        } finally {
            setLoading(false);
        }
    }, [id, getToken]);

    useEffect(() => { void fetchJob(); }, [fetchJob]);

    if (loading) return <div className="p-6"><AdminLoadingState /></div>;
    if (error || !job) return (
        <div className="p-6"><AdminErrorState message={error ?? 'Job not found'} /></div>
    );

    const totalApps = Object.values(job.stage_counts ?? {}).reduce((a, b) => a + b, 0);

    return (
        <div className="p-6">
            <div className="mb-1">
                <button
                    className="btn btn-ghost btn-sm gap-2 mb-3"
                    onClick={() => router.push('/secure/jobs')}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    Back to Jobs
                </button>
            </div>

            <AdminPageHeader
                title={job.title}
                subtitle={job.company?.name ?? undefined}
                actions={
                    <div className="flex items-center gap-2">
                        <span className="badge badge-lg capitalize">{job.status}</span>
                        <JobActions jobId={job.id} currentStatus={job.status} onSuccess={fetchJob} />
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
                    className={`tab ${activeTab === 'candidates' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('candidates')}
                >
                    <i className="fa-duotone fa-regular fa-person-circle-check mr-2" />
                    Candidates ({totalApps})
                </button>
            </div>

            {activeTab === 'overview' && <JobOverview job={job} onUpdate={fetchJob} />}
            {activeTab === 'candidates' && <JobCandidates jobId={job.id} stageCounts={job.stage_counts} />}
        </div>
    );
}
