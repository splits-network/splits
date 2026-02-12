'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { RecruiterCard } from './recruiter-card';
import TerminateRecruiterModal from './terminate-recruiter-modal';

interface RecruiterRelationship {
    id: string;
    recruiter_name: string;
    recruiter_email: string;
    recruiter_bio?: string;
    recruiter_status: string;
    relationship_status: string;
    status: string;  // Overall status: 'active' | 'expired' | 'terminated'
    valid_until?: string;
    created_at: string;
    days_until_expiry?: number;
    relationship_start_date: string;
    relationship_end_date: string;
    consent_given?: boolean;
}

interface MyRecruitersResponse {
    active: RecruiterRelationship[];
    expired: RecruiterRelationship[];
    terminated: RecruiterRelationship[];
}

export function MyRecruitersSection() {
    const { getToken } = useAuth();
    const [recruiters, setRecruiters] = useState<MyRecruitersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHistorical, setShowHistorical] = useState(false);
    const [terminateRelationship, setTerminateRelationship] = useState<RecruiterRelationship | null>(null);

    const fetchRecruiters = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) {
                setError('Please sign in to view recruiter relationships');
                return;
            }

            const client = createAuthenticatedClient(token);
            const response = await client.get('/recruiter-candidates');
            const allRelationships = response.data || [];

            // Group relationships by status
            const grouped: MyRecruitersResponse = {
                active: [],
                expired: [],
                terminated: []
            };

            allRelationships.forEach((rel: RecruiterRelationship) => {
                if (rel.status === 'active') {
                    grouped.active.push(rel);
                } else if (rel.status === 'expired') {
                    grouped.expired.push(rel);
                } else if (rel.status === 'terminated') {
                    grouped.terminated.push(rel);
                }
            });

            setRecruiters(grouped);
        } catch (err: any) {
            console.error('Failed to fetch recruiters:', err);
            setError(err.message || 'Failed to load recruiter relationships');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecruiters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title text-lg">
                        <i className="fa-duotone fa-regular fa-user-tie"></i>
                        My Recruiters
                    </h2>
                    <div className="flex items-center justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title text-lg">
                        <i className="fa-duotone fa-regular fa-user-tie"></i>
                        My Recruiters
                    </h2>
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    const hasHistorical = recruiters && (recruiters.expired.length > 0 || recruiters.terminated.length > 0);

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <h2 className="card-title text-lg">
                    <i className="fa-duotone fa-regular fa-user-tie"></i>
                    My Recruiters
                </h2>

                {/* Active Relationships */}
                {recruiters && recruiters.active.length > 0 ? (
                    <div className="space-y-3 mt-4">
                        {recruiters.active.map((rel) => (
                            <RecruiterCard
                                key={rel.id}
                                relationship={rel}
                                onTerminate={(r) => setTerminateRelationship(r)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="alert mt-4">
                        <i className="fa-duotone fa-regular fa-info-circle"></i>
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold">No active recruiter relationships</span>
                            <span className="text-sm">
                                Recruiters will invite you to establish a relationship when they start representing you for job opportunities.
                            </span>
                        </div>
                    </div>
                )}

                {/* Historical Relationships (Collapsible) */}
                {hasHistorical && (
                    <div className="mt-6">
                        <button
                            onClick={() => setShowHistorical(!showHistorical)}
                            className="btn btn-ghost btn-sm w-full justify-between"
                        >
                            <span>
                                <i className={`fa-duotone fa-regular fa-chevron-${showHistorical ? 'down' : 'right'} mr-2`}></i>
                                Past Relationships ({recruiters.expired.length + recruiters.terminated.length})
                            </span>
                        </button>

                        {showHistorical && (
                            <div className="mt-4 space-y-3">
                                {/* Expired Relationships */}
                                {recruiters.expired.length > 0 && (
                                    <>
                                        <h3 className="text-sm font-semibold text-base-content/70 mt-4 mb-2">
                                            Expired
                                        </h3>
                                        {recruiters.expired.map((rel) => (
                                            <RecruiterCard
                                                key={rel.id}
                                                relationship={rel}
                                                showActions={false}
                                            />
                                        ))}
                                    </>
                                )}

                                {/* Terminated Relationships */}
                                {recruiters.terminated.length > 0 && (
                                    <>
                                        <h3 className="text-sm font-semibold text-base-content/70 mt-4 mb-2">
                                            Terminated
                                        </h3>
                                        {recruiters.terminated.map((rel) => (
                                            <RecruiterCard
                                                key={rel.id}
                                                relationship={rel}
                                                showActions={false}
                                            />
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Help Text */}
                <div className="mt-6 pt-4 border-t border-base-300">
                    <p className="text-sm text-base-content/60">
                        <i className="fa-duotone fa-regular fa-lightbulb mr-2"></i>
                        Recruiter relationships last 12 months and can be renewed. Contact your recruiter if you have questions.
                    </p>
                </div>

                {/* Terminate Modal */}
                {terminateRelationship && (
                    <TerminateRecruiterModal
                        isOpen={!!terminateRelationship}
                        onClose={() => setTerminateRelationship(null)}
                        onSuccess={() => {
                            setTerminateRelationship(null);
                            fetchRecruiters();
                        }}
                        relationship={terminateRelationship}
                    />
                )}
            </div>
        </div>
    );
}
