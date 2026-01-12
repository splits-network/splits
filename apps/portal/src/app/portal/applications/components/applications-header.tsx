'use client';

import Link from 'next/link';
import { useUserProfile } from '@/contexts';

export default function ApplicationsHeader() {
    const { isAdmin, profile, isRecruiter, isCompanyUser } = useUserProfile();

    // Determine if user can submit candidates
    const canSubmitCandidate = isAdmin || isRecruiter || profile?.roles?.includes('company_admin') || profile?.roles?.includes('hiring_manager');

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <h1 className="text-3xl font-bold">Applications</h1>
                <p className="text-base-content/70 mt-1">
                    Monitor every candidate submission across stages and personas
                </p>
            </div>
            <div className="flex flex-wrap gap-3">
                <Link href="/portal/applications/pending" className="btn btn-ghost gap-2">
                    <i className="fa-duotone fa-regular fa-inbox"></i>
                    Pending Reviews
                </Link>
                {canSubmitCandidate && (
                    <Link href="/portal/roles" className="btn btn-primary gap-2">
                        <i className="fa-duotone fa-regular fa-user-plus"></i>
                        Submit Candidate
                    </Link>
                )}
            </div>
        </div>
    );
}
