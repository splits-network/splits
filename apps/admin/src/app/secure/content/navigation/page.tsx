'use client';

import { AdminPageHeader, AdminEmptyState } from '@/components/shared';

export default function ContentNavigationPage() {
    return (
        <div>
            <AdminPageHeader
                title="Navigation"
                subtitle="Manage site navigation menus"
            />

            <div className="card bg-base-100 border border-base-200">
                <AdminEmptyState
                    icon="fa-sitemap"
                    title="Navigation management coming soon"
                    description="Site navigation configuration will be available here once the content API is ready."
                />
            </div>
        </div>
    );
}
