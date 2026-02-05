'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { createAuthenticatedClient } from '@/lib/api-client';
import { ContentCard } from '@/components/ui';
import { LoadingState } from '@splits-network/shared-ui';

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
    stage?: string;
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
        return <LoadingState size="md" fullHeight={false} />;
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
        <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>Candidate</th>
                        <th>Role</th>
                        <th className="text-right">Stage</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {visibleApplications.map((application) => {
                        const submittedAt = application.created_at
                            ? new Date(application.created_at).toLocaleDateString()
                            : null;
                        const hasDocuments = (application.document_count ?? 0) > 0;
                        const hasQuestions = (application.pre_screen_answer_count ?? 0) > 0;

                        return (
                            <tr key={application.id} className="hover:bg-base-200/50 transition-colors">
                                <td>
                                    {application.candidate?.full_name || 'Unknown Candidate'}
                                </td>
                                <td>
                                    <div>
                                        <div className="font-medium">
                                            {application.job?.title || 'Unknown Role'}
                                        </div>
                                        {application.job?.company?.name && (
                                            <div className="text-xs text-base-content/60">
                                                {application.job.company.name}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="text-right">
                                    <span className="badge badge-sm badge-info">{application.stage}</span>
                                </td>
                                <td>
                                    {submittedAt || 'N/A'}
                                </td>
                                <td>
                                    <Link
                                        href={`/portal/applications/${application.id}`}
                                        className="btn btn-sm btn-ghost"
                                    >
                                        <i className="fa-duotone fa-regular fa-arrow-right mr-1"></i>
                                        Review & Submit
                                    </Link>
                                </td>
                            </tr>

                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
