'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { AdminPageHeader, AdminLoadingState, AdminErrorState } from '@/components/shared';
import { UserOverview } from './components/user-overview';
import { UserRoles } from './components/user-roles';

export type UserRole = {
    id: string;
    role_name: string;
    organization_id: string | null;
    company_id: string | null;
    role_entity_type: string | null;
    created_at: string;
};

export type UserDetail = {
    id: string;
    clerk_user_id: string;
    email: string;
    name: string | null;
    first_name?: string | null;
    last_name?: string | null;
    profile_image_url: string | null;
    avatar_url?: string | null;
    onboarding_status: string | null;
    onboarding_step: number | null;
    last_active_at: string | null;
    created_at: string;
    updated_at: string | null;
    roles: UserRole[];
    recruiter: {
        id: string;
        status: string;
        tagline: string | null;
        location: string | null;
        years_experience: number | null;
        marketplace_enabled: boolean;
        stripe_connect_onboarded: boolean;
        created_at: string;
    } | null;
    candidate: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        phone: string | null;
        location: string | null;
        resume_status: string | null;
        created_at: string;
    } | null;
};

type Tab = 'overview' | 'roles';

export default function UserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { getToken } = useAuth();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const fetchUser = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) { setError('Not authenticated'); setLoading(false); return; }
            const client = createAuthenticatedClient(token);
            const res = await client.get<{ data: UserDetail }>(`/identity/admin/users/${id}`);
            setUser((res as { data: UserDetail }).data);
        } catch {
            setError('Failed to load user');
        } finally {
            setLoading(false);
        }
    }, [id, getToken]);

    useEffect(() => { void fetchUser(); }, [fetchUser]);

    if (loading) return <div className="p-6"><AdminLoadingState /></div>;
    if (error || !user) return (
        <div className="p-6"><AdminErrorState message={error ?? 'User not found'} /></div>
    );

    const displayName = user.name
        || [user.first_name, user.last_name].filter(Boolean).join(' ')
        || 'Unknown User';

    return (
        <div>
            <button
                className="btn btn-ghost btn-sm gap-2 mb-3"
                onClick={() => router.push('/secure/users')}
            >
                <i className="fa-duotone fa-regular fa-arrow-left" />
                Back to Users
            </button>

            <AdminPageHeader
                title={displayName}
                subtitle={user.email}
                actions={
                    <div className="flex items-center gap-2 flex-wrap">
                        {user.roles.map(r => (
                            <span key={r.id} className="badge badge-sm badge-ghost capitalize">
                                {r.role_name.replace(/_/g, ' ')}
                            </span>
                        ))}
                    </div>
                }
            />

            <div role="tablist" className="tabs tabs-border mb-6">
                <button
                    role="tab"
                    className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <i className="fa-duotone fa-regular fa-circle-info mr-2" />
                    Overview
                </button>
                <button
                    role="tab"
                    className={`tab ${activeTab === 'roles' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('roles')}
                >
                    <i className="fa-duotone fa-regular fa-shield mr-2" />
                    Roles ({user.roles.length})
                </button>
            </div>

            {activeTab === 'overview' && <UserOverview user={user} />}
            {activeTab === 'roles' && <UserRoles user={user} onUpdate={fetchUser} />}
        </div>
    );
}
