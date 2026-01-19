import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import TeamManagementContent from './components/team-content';
import { ApiClient } from '@/lib/api-client';

export default async function CompanyTeamPage() {
    const { userId, getToken } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const token = await getToken();
    if (!token) {
        redirect('/sign-in');
    }

    // Fetch user profile
    const apiClient = new ApiClient(token);
    const profileResponse: any = await apiClient.get('/users/me');
    const profile = profileResponse.data || {};
    const roles: string[] = Array.isArray(profile.roles) ? profile.roles : [];

    if (!roles.includes('company_admin')) {
        redirect('/portal/dashboard');
    }

    const organizationId = Array.isArray(profile.organization_ids)
        ? profile.organization_ids[0]
        : null;

    if (!organizationId) {
        redirect('/portal/dashboard');
    }

    return (
        <div className="container mx-auto py-6 px-4 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Team Management</h1>
                <p className="text-base-content/70 mt-2">
                    Manage your company's team members and their roles
                </p>
            </div>

            <TeamManagementContent organizationId={organizationId} />
        </div>
    );
}
