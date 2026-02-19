'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@splits-network/memphis-ui';
import { PageTitle } from '@/components/page-title';
import CandidateDashboard from './components/candidate-dashboard';
import { MemphisTrendSelector } from './components/primitives';

export default function DashboardPage() {
    const { user } = useUser();
    const [trendPeriod, setTrendPeriod] = useState(6);

    return (
        <>
            <PageTitle
                title={`Welcome back, ${user?.firstName || 'there'}!`}
                subtitle="Here's an overview of your job search"
            >
                <MemphisTrendSelector
                    value={trendPeriod}
                    onChange={setTrendPeriod}
                />
                <div className="hidden lg:block w-px h-6 bg-dark/20" />
                <Link href="/public/jobs" className="inline-flex">
                    <Button color="coral" variant="solid" size="xs">
                        <i className="fa-duotone fa-regular fa-search w-3.5"></i>
                        Browse Jobs
                    </Button>
                </Link>
                <Link href="/portal/profile" className="inline-flex">
                    <Button color="dark" variant="ghost" size="xs">
                        <i className="fa-duotone fa-regular fa-user w-3.5"></i>
                        My Profile
                    </Button>
                </Link>
                <Link href="/portal/documents" className="inline-flex">
                    <Button color="dark" variant="ghost" size="xs">
                        <i className="fa-duotone fa-regular fa-file-lines w-3.5"></i>
                        Documents
                    </Button>
                </Link>
            </PageTitle>
            <CandidateDashboard
                trendPeriod={trendPeriod}
                onTrendPeriodChange={setTrendPeriod}
            />
        </>
    );
}
