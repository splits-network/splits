'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { AdminPageHeader, AdminLoadingState, AdminErrorState } from '@/components/shared';
import { JobOverview } from './components/job-overview';
import { JobCandidates } from './components/job-candidates';

type JobDetail = {
    id: string;
    title: string;
    status: string;
    commute_type: string | null;
    job_level: string | null;
    description: string | null;
    requirements: string | null;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string | null;
    location: string | null;
    city: string | null;
    state: string | null;
    company: { id: string; name: string; logo_url: string | null; industry: string | null } | null;
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

    useEffect(() => {
        async function fetchJob() {
            try {
                const token = await getToken();
                if (!token) { setError('Not authenticated'); setLoading(false); return; }
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: JobDetail }>(`/admin/ats/admin/jobs/${id}`);
                setJob((res as { data: JobDetail }).data);
            } catch {
                setError('Failed to load job');
            } finally {
                setLoading(false);
            }
        }
        void fetchJob();
    }, [id, getToken]);

    if (loading) return <div className="p-6"><AdminLoadingState /></div>;
    if (error || !job) return (
        <div className="p-6">
            <AdminErrorState message={error ?? 'Job not found'} />
        </div>
    );

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
                    <span className="badge badge-lg capitalize">{job.status}</span>
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
                    Candidates
                </button>
            </div>

            {activeTab === 'overview' && <JobOverview job={job} />}
            {activeTab === 'candidates' && <JobCandidates jobId={job.id} />}
        </div>
    );
}
