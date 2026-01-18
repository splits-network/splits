import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import GateReviewList from '../applications/components/gate-review-list';

export const metadata = {
    title: 'Gate Reviews - Splits Network',
    description: 'Review applications pending at your gate'
};

async function determineGateType(userId: string): Promise<'candidate_recruiter' | 'company_recruiter' | 'company'> {
    try {
        // Try to fetch recruiter profile to determine role
        const recruiterRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v2/recruiters?limit=1`, {
            headers: {
                'Authorization': `Bearer ${userId}`,
                'x-clerk-user-id': userId
            },
            cache: 'no-store'
        });

        if (recruiterRes.ok) {
            const recruiterData = await recruiterRes.json();
            if (recruiterData.data && recruiterData.data.length > 0) {
                // Check if they have candidate or company assignments
                const assignmentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v2/recruiter-candidates?limit=1`, {
                    headers: {
                        'Authorization': `Bearer ${userId}`,
                        'x-clerk-user-id': userId
                    },
                    cache: 'no-store'
                });

                if (assignmentsRes.ok) {
                    const assignments = await assignmentsRes.json();
                    if (assignments.data && assignments.data.length > 0) {
                        return 'candidate_recruiter';
                    }
                }

                // Default to company recruiter for recruiters
                return 'company_recruiter';
            }
        }

        // Check if company user
        const companiesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v2/companies?limit=1`, {
            headers: {
                'Authorization': `Bearer ${userId}`,
                'x-clerk-user-id': userId
            },
            cache: 'no-store'
        });

        if (companiesRes.ok) {
            const companies = await companiesRes.json();
            if (companies.data && companies.data.length > 0) {
                return 'company';
            }
        }

        // Default to candidate_recruiter
        return 'candidate_recruiter';
    } catch (error) {
        console.error('Failed to determine gate type:', error);
        return 'candidate_recruiter'; // Safe default
    }
}

async function fetchPendingCount(userId: string, gateType: string): Promise<number> {
    try {
        const params = new URLSearchParams({
            current_gate: gateType,
            state: 'awaiting_gate_review',
            limit: '1'
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v2/candidate-role-assignments?${params}`, {
            headers: {
                'Authorization': `Bearer ${userId}`,
                'x-clerk-user-id': userId
            },
            cache: 'no-store'
        });

        if (response.ok) {
            const data = await response.json();
            return data.pagination?.total || 0;
        }

        return 0;
    } catch (error) {
        console.error('Failed to fetch pending count:', error);
        return 0;
    }
}

async function GateReviewsContent() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Determine gate type based on user role
    const gateType = await determineGateType(userId);

    // Fetch live pending count
    const pendingCount = await fetchPendingCount(userId, gateType);

    const gateLabel = gateType === 'candidate_recruiter'
        ? 'Candidate Recruiter Review'
        : gateType === 'company_recruiter'
            ? 'Company Recruiter Review'
            : 'Company Review';

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
                    <GateReviewList gateType={gateType} userId={userId} />
                </div>
            </div>
        </div>
    );
}

export default function GateReviewsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        }>
            <GateReviewsContent />
        </Suspense>
    );
}
