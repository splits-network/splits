'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useStandardList } from '@/hooks/use-standard-list';
import { AdminPageHeader, AdminStatsBanner, AdminDataTable, type Column } from '@/components/shared';
import { createAuthenticatedClient } from '@/lib/api-client';

type AdminUser = {
    id: string;
    clerk_user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
    roles: string[] | null;
    created_at: string;
    last_active_at: string | null;
};

function RolesBadges({ roles }: { roles: string[] | null }) {
    if (!roles || roles.length === 0) {
        return <span className="text-base-content/40 text-sm">—</span>;
    }
    return (
        <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
                <span key={role} className="badge badge-ghost badge-sm capitalize">
                    {role.replace(/_/g, ' ')}
                </span>
            ))}
        </div>
    );
}

function UserCell({ user }: { user: AdminUser }) {
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown';
    return (
        <div className="flex items-center gap-3">
            <div className="avatar placeholder">
                <div className="w-8 rounded-full bg-base-300 text-base-content/60">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={name} />
                    ) : (
                        <span className="text-sm font-bold">{name.charAt(0).toUpperCase()}</span>
                    )}
                </div>
            </div>
            <span className="font-medium text-sm">{name}</span>
        </div>
    );
}

const COLUMNS: Column<AdminUser>[] = [
    {
        key: 'name',
        label: 'Name',
        render: (user) => <UserCell user={user} />,
    },
    {
        key: 'email',
        label: 'Email',
        sortable: true,
        render: (user) => <span className="text-sm text-base-content/70">{user.email ?? '—'}</span>,
    },
    {
        key: 'roles',
        label: 'Roles',
        render: (user) => <RolesBadges roles={user.roles} />,
    },
    {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        render: (user) => (
            <span className="text-sm text-base-content/60">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
            </span>
        ),
    },
    {
        key: 'last_active_at',
        label: 'Last Active',
        sortable: true,
        render: (user) =>
            user.last_active_at ? (
                <span className="text-sm text-base-content/60">
                    {new Date(user.last_active_at).toLocaleDateString()}
                </span>
            ) : (
                <span className="text-base-content/40 text-sm">Never</span>
            ),
    },
];

export default function UsersPage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [countsLoading, setCountsLoading] = useState(true);

    useEffect(() => {
        async function fetchCounts() {
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get('/identity/admin/counts');
                setCounts(res.data);
            } catch {
                // silently fail — stats are non-critical
            } finally {
                setCountsLoading(false);
            }
        }
        fetchCounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { data, loading, total, totalPages, page, goToPage, sortBy, sortOrder, handleSort, searchInput, setSearchInput } =
        useStandardList<AdminUser>({
            endpoint: '/identity/admin/users',
            defaultFilters: { search: '' },
            defaultLimit: 25,
        });

    const stats = [
        { label: 'Total Users', value: counts.users ?? 0, icon: 'fa-duotone fa-regular fa-users', color: 'primary' as const },
        { label: 'Admins', value: counts.admins ?? 0, icon: 'fa-duotone fa-regular fa-shield', color: 'warning' as const },
    ];

    return (
        <div>
            <AdminPageHeader
                title="Users"
                subtitle={`${total} total user${total !== 1 ? 's' : ''}`}
            />

            <AdminStatsBanner stats={stats} loading={countsLoading} />

            <div className="flex items-center gap-3 mb-4">
                <label className="input input-sm flex items-center gap-2 flex-1 max-w-sm">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="grow"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </label>
            </div>

            <div className="card bg-base-100 shadow-sm">
                <AdminDataTable
                    columns={COLUMNS}
                    data={data}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                    onRowClick={(user) => router.push(`/secure/users/${user.id}`)}
                    emptyTitle="No users found"
                    emptyDescription="No users match your search."
                />

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-base-200">
                        <span className="text-sm text-base-content/60">
                            Page {page} of {totalPages}
                        </span>
                        <div className="join">
                            <button
                                type="button"
                                className="join-item btn btn-sm"
                                disabled={page <= 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-left" />
                            </button>
                            <button
                                type="button"
                                className="join-item btn btn-sm"
                                disabled={page >= totalPages}
                                onClick={() => goToPage(page + 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-right" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
