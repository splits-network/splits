import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAuthenticatedClient } from '@/lib/api-client';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId, getToken } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Get the user's profile to check if they're an admin
    try {
        const token = await getToken();
        if (!token) {
            redirect('/sign-in');
        }

        const apiClient = createAuthenticatedClient(token);
        const profileResponse: any = await apiClient.get('/users', { params: { limit: 1 } });
        const profile = profileResponse?.data || profileResponse || {};
        const roles: string[] = Array.isArray(profile.roles) ? profile.roles : [];

        // Check if user has platform_admin role
        const isAdmin = Boolean(profile.is_platform_admin || roles.includes('platform_admin'));

        if (!isAdmin) {
            // Not an admin, redirect to dashboard
            redirect('/portal/dashboard');
        }
    } catch (error) {
        console.error('Failed to check admin access:', error);
        redirect('/portal/dashboard');
    }

    return <>{children}</>;
}
