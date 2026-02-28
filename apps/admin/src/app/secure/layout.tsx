import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { RealtimeProvider } from '@/providers/realtime-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { SecureShell } from './secure-shell';

export default async function SecureLayout({ children }: { children: React.ReactNode }) {
    const { userId, getToken } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const token = await getToken();
    if (!token) {
        redirect('/sign-in');
    }

    // Fetch user profile from admin-gateway to verify platform admin status.
    // Any error (network, non-200, non-admin) redirects to /unauthorized.
    let isAdmin = false;
    try {
        const gatewayUrl = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL || 'http://admin-gateway:3030';
        const response = await fetch(`${gatewayUrl}/admin/identity/api/v2/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
            const data = await response.json();
            isAdmin = data?.data?.is_platform_admin === true;
        }
    } catch {
        // Network or parse error — fall through to redirect below
    }

    if (!isAdmin) {
        redirect('/unauthorized');
    }

    return (
        <RealtimeProvider>
            <ToastProvider>
                <SecureShell>{children}</SecureShell>
            </ToastProvider>
        </RealtimeProvider>
    );
}
