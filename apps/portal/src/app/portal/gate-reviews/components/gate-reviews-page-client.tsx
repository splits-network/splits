'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useUserProfile } from '@/contexts';
import { apiClient, createAuthenticatedClient } from '@/lib/api-client';
import GateReviewList from './gate-review-list';

type GateType = 'candidate_recruiter' | 'company_recruiter' | 'company';

export default function GateReviewsPageClient() {
    const { getToken } = useAuth();
    const { isRecruiter, isCompanyUser } = useUserProfile();
    const [gateType, setGateType] = useState<GateType>('candidate_recruiter');
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const determineGateType = async () => {
            try {
                setLoading(true);
                const token = await getToken();
                if (!token) throw new Error('Not authenticated');

                const client = createAuthenticatedClient(token);

                // Try to fetch recruiter profile
                if (isRecruiter) {
                    try {
                        const recruiterRes = await client.get('/recruiters', {
                            params: { limit: 1 }
                        });

                        if (recruiterRes.data?.length > 0) {
                            // Check if they have candidate assignments
                            try {
                                const assignmentsRes = await client.get('/recruiter-candidates', {
                                    params: { limit: 1 }
                                });

                                if (assignmentsRes.data?.length > 0) {
                                    setGateType('candidate_recruiter');
                                    return;
                                }
                            } catch (err) {
                                // No assignments, continue
                            }

                            // Default to company recruiter for recruiters
                            setGateType('company_recruiter');
                            return;
                        }
                    } catch (err) {
                        // Not a recruiter, check company
                    }
                }

                // Check if company user
                if (isCompanyUser) {
                    try {
                        const companiesRes = await client.get('/companies', {
                            params: { limit: 1 }
                        });

                        if (companiesRes.data?.length > 0) {
                            setGateType('company');
                            return;
                        }
                    } catch (err) {
                        // Not a company user
                    }
                }

                // Default to candidate_recruiter
                setGateType('candidate_recruiter');
            } catch (error) {
                console.error('Failed to determine gate type:', error);
                setGateType('candidate_recruiter'); // Safe default
            } finally {
                setLoading(false);
            }
        };
        determineGateType();
    }, [isRecruiter, isCompanyUser]);

    useEffect(() => {
        const fetchPendingCount = async () => {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            try {
                console.log('Fetching pending count for gate type:', gateType);
                const response = await client.get('/candidate-role-assignments', {
                    params: {
                        current_gate: gateType,
                        state: 'submitted',
                        limit: 1
                    }
                });

                setPendingCount(response.pagination?.total || 0);
            } catch (error) {
                console.error('Failed to fetch pending count:', error);
                setPendingCount(0);
            }
        };

        if (!loading && gateType) {
            fetchPendingCount();
        }
    }, [loading, gateType]);

    const gateLabel = gateType === 'candidate_recruiter'
        ? 'Candidate Recruiter Review'
        : gateType === 'company_recruiter'
            ? 'Company Recruiter Review'
            : 'Company Review';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gate Reviews</h1>
                    <p className="text-base-content/60 mt-2">
                        {gateLabel} - Review applications pending at your gate
                    </p>
                </div>

                <div className="stats shadow">
                    <div className="stat">
                        <div className="stat-title">Pending Reviews</div>
                        <div className="stat-value text-primary">{pendingCount}</div>
                        <div className="stat-desc">Applications awaiting action</div>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <GateReviewList gateType={gateType} />
                </div>
            </div>
        </div>
    );
}
