'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { AdminPageHeader, AdminLoadingState, AdminErrorState } from '@/components/shared';
import { ApplicationOverview } from './components/application-overview';
import { ApplicationStageActions } from './components/application-stage-actions';

export type ApplicationNote = {
    id: string;
    note_type: string;
    visibility: string;
    body: string;
    author_name: string | null;
    created_at: string;
};

export type ApplicationDetail = {
    id: string;
    job_id: string;
    candidate_id: string;
    candidate_recruiter_id: string | null;
    stage: string;
    application_source: string | null;
    ai_reviewed: boolean;
    notes: string | null;
    recruiter_notes: string | null;
    candidate_notes: string | null;
    internal_notes: string | null;
    cover_letter: string | null;
    salary: number | null;
    candidate_name: string | null;
    candidate_email: string | null;
    job_title: string | null;
    company_name: string | null;
    submitted_at: string | null;
    accepted_at: string | null;
    hired_at: string | null;
    created_at: string;
    updated_at: string | null;
    job: {
        id: string;
        title: string;
        status: string;
        company: { id: string; name: string } | null;
    } | null;
    candidate: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        phone: string | null;
        location: string | null;
        resume_status: string | null;
    } | null;
    notes_list: ApplicationNote[];
};

const STAGE_BADGE: Record<string, string> = {
    draft: 'badge-ghost', ai_review: 'badge-info', gpt_review: 'badge-info',
    ai_reviewed: 'badge-info', ai_failed: 'badge-error',
    recruiter_request: 'badge-warning', recruiter_proposed: 'badge-warning',
    recruiter_review: 'badge-warning', screen: 'badge-warning',
    submitted: 'badge-info', company_review: 'badge-accent',
    company_feedback: 'badge-accent', interview: 'badge-warning',
    offer: 'badge-primary', hired: 'badge-success',
    rejected: 'badge-error', withdrawn: 'badge-ghost', expired: 'badge-ghost',
};

export default function ApplicationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { getToken } = useAuth();
    const [app, setApp] = useState<ApplicationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApp = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) { setError('Not authenticated'); setLoading(false); return; }
            const client = createAuthenticatedClient(token);
            const res = await client.get<{ data: any }>(`/ats/admin/applications/${id}`);
            const d = (res as { data: any }).data;
            // Map 'notes' array from backend (application_notes) to notes_list to avoid collision with the text notes field
            setApp({ ...d, notes_list: d.notes ?? [] });
        } catch {
            setError('Failed to load application');
        } finally {
            setLoading(false);
        }
    }, [id, getToken]);

    useEffect(() => { void fetchApp(); }, [fetchApp]);

    if (loading) return <div className="p-6"><AdminLoadingState /></div>;
    if (error || !app) return (
        <div className="p-6"><AdminErrorState message={error ?? 'Application not found'} /></div>
    );

    const candidateName = app.candidate
        ? [app.candidate.first_name, app.candidate.last_name].filter(Boolean).join(' ')
        : app.candidate_name ?? 'Unknown Candidate';

    const jobTitle = app.job?.title ?? app.job_title ?? 'Unknown Job';

    return (
        <div>
            <button
                className="btn btn-ghost btn-sm gap-2 mb-3"
                onClick={() => router.push('/secure/applications')}
            >
                <i className="fa-duotone fa-regular fa-arrow-left" />
                Back to Applications
            </button>

            <AdminPageHeader
                title={candidateName}
                subtitle={`Applied to ${jobTitle}`}
                actions={
                    <div className="flex items-center gap-2">
                        <span className={`badge badge-lg capitalize ${STAGE_BADGE[app.stage] ?? 'badge-ghost'}`}>
                            {app.stage.replace(/_/g, ' ')}
                        </span>
                        <ApplicationStageActions
                            applicationId={app.id}
                            currentStage={app.stage}
                            onSuccess={fetchApp}
                        />
                    </div>
                }
            />

            <ApplicationOverview app={app} />
        </div>
    );
}
