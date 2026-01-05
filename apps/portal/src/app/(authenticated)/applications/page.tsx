import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import ApplicationsListClient from './components/applications-list-client2';
import { createAuthenticatedClient } from '@/lib/api-client';

interface MembershipSummary {
    role: string;
    organization_id: string | null;
}

async function getPrimaryMembership(token: string): Promise<MembershipSummary | null> {
    try {
        const client = createAuthenticatedClient(token);
        const response: any = await client.get('/users', { params: { limit: 1 } });
        const profile = response?.data?.[0] || response?.data || response;
        if (profile?.memberships?.length) {
            return profile.memberships[0];
        }
    } catch (error) {
        console.error('Failed to resolve user membership for applications page:', error);
    }
    return null;
}

export default async function ApplicationsPage() {
    const { getToken } = await auth();
    const token = await getToken();

    const membership = token ? await getPrimaryMembership(token) : null;
    const userRole = membership?.role ?? null;
    const organizationId = membership?.organization_id ?? null;

    const isRecruiter = userRole === 'recruiter';
    const isPlatformAdmin = userRole === 'platform_admin';
    const canSubmitCandidate = isRecruiter || isPlatformAdmin;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Applications</h1>
                    <p className="text-base-content/70 mt-1">
                        Monitor every candidate submission across stages and personas.
                    </p>
                </div>
                {(canSubmitCandidate || isRecruiter) && (
                    <div className="flex flex-wrap gap-3">
                        {isRecruiter && (
                            <Link href="/applications/pending" className="btn btn-ghost gap-2">
                                <i className="fa-solid fa-inbox"></i>
                                Pending Reviews
                            </Link>
                        )}
                        {canSubmitCandidate && (
                            <Link href="/roles" className="btn btn-primary gap-2">
                                <i className="fa-solid fa-user-plus"></i>
                                Submit Candidate
                            </Link>
                        )}
                    </div>
                )}
            </div>

            <ApplicationsListClient
                initialUserRole={userRole}
                initialOrganizationId={organizationId}
            />
        </div>
    );
}
