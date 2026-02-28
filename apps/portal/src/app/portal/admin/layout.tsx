import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAuthenticatedClient } from '@/lib/api-client';
import { AdminSidebar } from './components/admin-sidebar';
import { AdminLayoutClient } from './components/admin-layout-client';

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
    const token = await getToken();
    if (!token) {
        redirect('/sign-in');
    }

    let isAdmin = false;
    try {
        const apiClient = createAuthenticatedClient(token);
        const profileResponse: any = await apiClient.get('/users/me');
        isAdmin = profileResponse.data?.is_platform_admin === true;
    } catch (error) {
        // Log but don't throw - we'll redirect below if not admin
        console.error('Failed to check admin access:', error);
    }

    if (!isAdmin) {
        redirect('/portal/dashboard');
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            <AdminSidebar />
            <main className="flex-1 p-6 overflow-auto bg-base-100">
                <AdminLayoutClient>{children}</AdminLayoutClient>
            </main>
        </div>
    );
}
