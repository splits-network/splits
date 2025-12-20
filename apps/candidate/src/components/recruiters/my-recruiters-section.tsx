'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getMyRecruiters, MyRecruitersResponse } from '@/lib/api';
import { RecruiterCard } from './recruiter-card';

export function MyRecruitersSection() {
    const { getToken } = useAuth();
    const [recruiters, setRecruiters] = useState<MyRecruitersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHistorical, setShowHistorical] = useState(false);

    useEffect(() => {
        async function fetchRecruiters() {
            try {
                setLoading(true);
                setError(null);
                const token = await getToken();
                if (!token) {
                    throw new Error('Not authenticated');
                }
                const data = await getMyRecruiters(token);
                setRecruiters(data);
            } catch (err: any) {
                console.error('Failed to fetch recruiters:', err);
                setError(err.message || 'Failed to load recruiter relationships');
            } finally {
                setLoading(false);
            }
        }

        fetchRecruiters();
    }, [getToken]);

    if (loading) {
        return (
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title text-lg">
                        <i className="fa-solid fa-user-tie"></i>
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
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title text-lg">
                        <i className="fa-solid fa-user-tie"></i>
                        My Recruiters
                    </h2>
                    <div className="alert alert-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    const hasHistorical = recruiters && (recruiters.expired.length > 0 || recruiters.terminated.length > 0);

    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
                <h2 className="card-title text-lg">
                    <i className="fa-solid fa-user-tie"></i>
                    My Recruiters
                </h2>

                {/* Active Relationships */}
                {recruiters && recruiters.active.length > 0 ? (
                    <div className="space-y-3 mt-4">
                        {recruiters.active.map((rel) => (
                            <RecruiterCard key={rel.id} relationship={rel} />
                        ))}
                    </div>
                ) : (
                    <div className="alert mt-4">
                        <i className="fa-solid fa-info-circle"></i>
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
                                <i className={`fa-solid fa-chevron-${showHistorical ? 'down' : 'right'} mr-2`}></i>
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
                        <i className="fa-solid fa-lightbulb mr-2"></i>
                        Recruiter relationships last 12 months and can be renewed. Contact your recruiter if you have questions.
                    </p>
                </div>
            </div>
        </div>
    );
}
