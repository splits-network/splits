import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAuthenticatedClient } from '@/lib/api-client';
import CompanySettingsContent from './components/company-settings-content';

export default async function CompanySettingsPage() {
    const { getToken } = await auth();

    const token = await getToken();
    if (!token) {
        redirect('/sign-in');
    }

    const client = createAuthenticatedClient(token);

    // Fetch user profile to get organization_ids
    let company = null;
    try {
        const profileResponse: any = await client.get('/users/me');
        const profile = profileResponse?.data;

        // Fetch company details if user has organization
        if (profile?.organization_ids && profile.organization_ids.length > 0) {
            const companiesResponse: any = await client.get('/companies');
            const companies = companiesResponse?.data || [];
            company = companies.find((c: any) => c.identity_organization_id === profile.organization_ids[0]) || null;
        }
    } catch (error) {
        console.error('[Company Settings] Failed to fetch data:', error);
    }

    return <CompanySettingsContent company={company} />;
}
