'use client';

import { useUserProfile } from '@/contexts';
import { redirect } from 'next/navigation';
import CompanySettingsForm from './settings-form';

interface CompanySettingsContentProps {
    company: any;
}

export default function CompanySettingsContent({ company }: CompanySettingsContentProps) {
    const { profile, isLoading, isCompanyUser } = useUserProfile();

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    if (!isCompanyUser || !profile?.organization_ids || profile.organization_ids.length === 0) {
        redirect('/portal/dashboard');
        return null;
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Company Settings</h1>
                <p className="text-base-content/70 mt-2">
                    Manage your company profile, billing, and preferences
                </p>
            </div>

            <div className="card bg-base-200 shadow mb-6">
                <div className="card-body flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-sm text-base-content/70">Company</p>
                        <p className="text-xl font-semibold">{company?.name || "Company Profile"}</p>
                        <p className="text-sm text-base-content/60">
                            Organization ID: {profile.organization_ids[0]}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <a href="/portal/company/team" className="btn btn-outline">
                            <i className="fa-duotone fa-regular fa-users"></i>
                            Manage Team
                        </a>
                        <a href="#company-settings-form" className="btn btn-primary">
                            <i className="fa-duotone fa-regular fa-gear"></i>
                            Edit Settings
                        </a>
                    </div>
                </div>
            </div>

            <CompanySettingsForm
                company={company}
                organizationId={profile.organization_ids[0]}
            />
        </div>
    );
}
