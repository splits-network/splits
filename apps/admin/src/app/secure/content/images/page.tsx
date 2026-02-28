'use client';

import { AdminPageHeader, AdminEmptyState } from '@/components/shared';

export default function ContentImagesPage() {
    return (
        <div>
            <AdminPageHeader
                title="Images"
                subtitle="Manage uploaded images and assets"
            />

            <div className="card bg-base-100 border border-base-200">
                <AdminEmptyState
                    icon="fa-images"
                    title="Image management coming soon"
                    description="Upload and manage platform images and assets once the document service is connected."
                />
            </div>
        </div>
    );
}
