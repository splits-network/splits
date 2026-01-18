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
        const profileResponse: any = await apiClient.get('/users/me');

        if (!profileResponse.data?.is_platform_admin) {
            // Not an admin, redirect to dashboard
            redirect('/portal/dashboard');
        }
    } catch (error) {
        console.error('Failed to check admin access:', error);
        redirect('/portal/dashboard');
    }

    return <>{children}</>;
}
