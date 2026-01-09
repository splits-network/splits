'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { createAuthenticatedClient } from '@/lib/api-client';

interface ActionableProposalsWidgetProps {
    compact?: boolean;
}

interface PendingApplication {
    id: string;
    candidate?: { full_name?: string };
    candidate_id?: string;
    job?: { title?: string; company?: { name?: string }; location?: string };
    document_count?: number;
    pre_screen_answer_count?: number;
    created_at?: string;
}

/**
 * Dashboard widget showing applications recruiters still need to review/submit.
 * These map to the legacy "pending applications" queue in the ATS service.
 */
export default function ActionableProposalsWidget({ compact = true }: ActionableProposalsWidgetProps) {
    const { getToken } = useAuth();
    const [applications, setApplications] = useState<PendingApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const apiClient = createAuthenticatedClient(token);
            const response: any = await apiClient.get('/applications', {
                params: {
                    stage: 'screen',
                    limit: compact ? 5 : undefined,
                    sort_by: 'created_at',
                    sort_order: 'desc'
                }
            });
            const list = Array.isArray(response?.data)
                ? response.data
                : response?.data?.data || response?.data || [];

            setApplications(list);
        } catch (err) {
            console.error('Error fetching pending applications:', err);
            setError(err instanceof Error ? err.message : 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                <span>{error}</span>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="alert alert-info">
                <i className="fa-duotone fa-regular fa-circle-check"></i>
                <div>
                    <h3 className="font-bold">All caught up!</h3>
                    <p className="text-sm">No applications awaiting your review right now.</p>
                </div>
            </div>
        );
    }

    const visibleApplications = applications.slice(0, compact ? 5 : applications.length);

    return (
        <div className="space-y-3">
            {visibleApplications.map((application) => {
                const submittedAt = application.created_at
                    ? new Date(application.created_at).toLocaleDateString()
                    : null;
                const hasDocuments = (application.document_count ?? 0) > 0;
                const hasQuestions = (application.pre_screen_answer_count ?? 0) > 0;

                return (
                    <Link
                        key={application.id}
                        href={`/portal/applications/${application.id}/review`}
                        className="block card bg-base-100 shadow hover:shadow transition-all border border-base-300"
                    >
                        <div className="card-body p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="grow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <i className="fa-duotone fa-regular fa-user text-primary"></i>
                                        <span className="badge badge-sm badge-info">Awaiting Review</span>
                                    </div>

                                    <h3 className="font-semibold text-base mb-1">
                                        {application.candidate?.full_name || 'Unknown Candidate'}
                                    </h3>

                                    <div className="text-sm text-base-content/70">
                                        <p className="font-medium">
                                            <i className="fa-duotone fa-regular fa-briefcase mr-2 text-primary"></i>
                                            {application.job?.title || 'Unknown Role'}
                                        </p>
                                        {application.job?.company?.name && (
                                            <p className="text-xs mt-1 text-base-content/60">
                                                <i className="fa-duotone fa-regular fa-building mr-1"></i>
                                                {application.job.company.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-sm text-primary font-medium mt-2">
                                        <i className="fa-duotone fa-regular fa-arrow-right mr-1"></i>
                                        Review details & submit to company
                                    </div>

                                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-base-content/60">
                                        {submittedAt && (
                                            <span>
                                                <i className="fa-duotone fa-regular fa-calendar mr-1"></i>
                                                Submitted {submittedAt}
                                            </span>
                                        )}
                                        {hasDocuments && (
                                            <span>
                                                <i className="fa-duotone fa-regular fa-file mr-1"></i>
                                                {application.document_count} document
                                                {application.document_count !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {hasQuestions && (
                                            <span>
                                                <i className="fa-duotone fa-regular fa-clipboard-question mr-1"></i>
                                                {application.pre_screen_answer_count} question
                                                {application.pre_screen_answer_count !== 1 ? 's' : ''} answered
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-base-content/60 mb-2">
                                        <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                        Pending submission
                                    </p>
                                    <span className="badge badge-outline">Step 2 of 3</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}

            <div className="text-center pt-2">
                <Link href="/portal/applications/pending" className="text-sm text-primary hover:underline">
                    View all pending reviews
                </Link>
            </div>
        </div>
    );
}
