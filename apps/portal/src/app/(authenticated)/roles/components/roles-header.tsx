'use client';

import Link from 'next/link';
import { useUserProfile } from '@/contexts';

export default function RolesHeader() {
    const { isAdmin, profile } = useUserProfile();

    // Check if user can create roles (company_admin or platform_admin)
    const canCreateRole = isAdmin || profile?.roles?.includes('company_admin');

    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">Roles</h1>
                <p className="text-base-content/70 mt-1">
                    Browse and manage roles you're assigned to
                </p>
            </div>
            {canCreateRole && (
                <Link href="/roles/new" className="btn btn-primary gap-2">
                    <i className="fa-solid fa-plus"></i>
                    Create New Role
                </Link>
            )}
        </div>
    );
}
