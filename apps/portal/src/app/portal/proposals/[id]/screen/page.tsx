import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAuthenticatedClient } from '@/lib/api-client';
import ProposalScreenClient from './components/proposal-screen-client';
import Link from 'next/link';

export default async function ProposalScreenPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
        redirect('/sign-in');
    }

    const client = createAuthenticatedClient(token);
    const { id: proposalId } = await params;

    let proposal: any = null;
    let error: string | null = null;

    try {
        // Load only the basic proposal data - client will load job, candidate, and documents
        const proposalResponse: any = await client.get(`/proposals/${proposalId}`);
        const proposalData = proposalResponse.data || proposalResponse;
        proposal = proposalData.proposal || proposalData;
    } catch (err: any) {
        console.error('Error loading proposal:', err);
        error = err.message || 'Failed to load proposal details';
    }

    if (error || !proposal) {
        return (
            <div className="space-y-6">
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <div className="alert alert-error">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{error || 'Proposal not found'}</span>
                        </div>
                        <div className="card-actions justify-start mt-4">
                            <Link href="/proposals" className="btn">
                                <i className="fa-solid fa-arrow-left"></i>
                                Back to Proposals
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <ProposalScreenClient proposalId={proposalId} initialProposal={proposal} />;
}
