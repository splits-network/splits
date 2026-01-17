import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { AuthenticatedLayoutClient } from './layout-client';
import { ServiceStatusBanner } from '@/components/service-status-banner';

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    return (
        <AuthenticatedLayoutClient>
            <div className="drawer lg:drawer-open">
                <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <Sidebar />
                <div className="drawer-content flex flex-col">
                    <ServiceStatusBanner />
                    <main className="p-6">
                        {children}
                    </main>
                </div>
                {/* <div className='absolute top-0 left-0 inset-0 bg-linear-to-r from-primary/20 from-20% to-base-300 -z-100'></div> */}
            </div>
        </AuthenticatedLayoutClient>
    );
}
