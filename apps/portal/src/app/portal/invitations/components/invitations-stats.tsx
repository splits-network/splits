import { auth } from '@clerk/nextjs/server';
import { createAuthenticatedClient } from '@/lib/api-client';
import { StatCard, StatCardGrid } from '@/components/ui/cards';
import { InvitationsTrendsChart } from '@/components/charts/invitations-trends-chart';

interface RecruiterCandidate {
    id: string;
    consent_given: boolean;
    declined_at: string | null;
}

async function getInvitationStats() {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
        return { total: 0, pending: 0, accepted: 0, declined: 0 };
    }

    try {
        const client = createAuthenticatedClient(token);

        // Fetch all invitations for stats
        const response = await client.get('/recruiter-candidates', {
            params: { limit: 1000 }
        });

        const invitations: RecruiterCandidate[] = response.data || [];
        const pending = invitations.filter(i => !i.consent_given && !i.declined_at).length;
        const accepted = invitations.filter(i => i.consent_given).length;
        const declined = invitations.filter(i => i.declined_at != null).length;

        return {
            total: response.pagination?.total || invitations.length,
            pending,
            accepted,
            declined
        };
    } catch (error) {
        console.error('Failed to fetch invitation stats:', error);
        return { total: 0, pending: 0, accepted: 0, declined: 0 };
    }
}

export default async function InvitationsStats() {
    const stats = await getInvitationStats();

    return (
        <div className='card bg-base-200'>
            <StatCardGrid className='m-2 shadow-lg'>
                <StatCard
                    title="Total Invitations"
                    value={stats.total}
                    icon="fa-duotone fa-regular fa-envelopes"
                    description="Total candidate invitations"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon="fa-duotone fa-regular fa-hourglass-half"
                    color="info"
                    description="Awaiting response"
                />
                <StatCard
                    title="Accepted"
                    value={stats.accepted}
                    icon="fa-duotone fa-regular fa-check"
                    color="success"
                    description="Candidates joined"
                />
                <StatCard
                    title="Declined"
                    value={stats.declined}
                    icon="fa-duotone fa-regular fa-xmark"
                    color="error"
                    description="Not interested"
                />
            </StatCardGrid>
            <div className='p-4 pt-0'>
                <InvitationsTrendsChart />
            </div>
        </div>
    );
}
