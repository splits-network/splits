import { Metadata } from 'next';
import { Suspense } from 'react';
import InvitationsPageClient from './components/invitations-client';
import InvitationsStats from './components/invitations-stats';

export const metadata: Metadata = {
    title: 'Candidate Invitations | Splits Network',
    description: 'Track and manage your candidate invitations',
};

function StatsLoading() {
    return (
        <div className='card bg-base-200'>
            <div className='p-8 flex items-center justify-center'>
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        </div>
    );
}

export default function InvitationsPage() {
    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="w-full md:flex-1 md:mr-4 space-y-6">
                <Suspense fallback={<StatsLoading />}>
                    <InvitationsStats />
                </Suspense>
                <InvitationsPageClient />
            </div>
        </div>
    );
}
