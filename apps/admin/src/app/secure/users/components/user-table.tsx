'use client';

import { useRouter } from 'next/navigation';
import { AdminDataTable, AdminPageHeader, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';

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
                        <span className="text-xs font-bold">{name.charAt(0).toUpperCase()}</span>
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
        sortable: false,
        render: (user) => <UserCell user={user} />,
    },
    {
        key: 'email',
        label: 'Email',
        sortable: true,
        render: (user) => <span className="text-sm text-base-content/70">{user.email}</span>,
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
                {new Date(user.created_at).toLocaleDateString()}
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

export function UserTable() {
    const router = useRouter();
    const {
        items,
        loading,
        filters,
        total,
        totalPages,
        page,
        setFilter,
        setPage,
        sortBy,
        sortOrder,
        handleSort,
    } = useStandardList<AdminUser>({
        endpoint: '/admin/identity/admin/users',
        defaultFilters: { search: '' },
        defaultLimit: 25,
    });

    return (
        <div>
            <AdminPageHeader
                title="Users"
                subtitle={`${total} total users`}
            />

            <div className="flex items-center gap-3 mb-4">
                <label className="input input-sm flex items-center gap-2 flex-1 max-w-sm">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="grow"
                        value={filters.search ?? ''}
                        onChange={(e) => setFilter('search', e.target.value)}
                    />
                </label>
            </div>

            <div className="card bg-base-100 border border-base-200">
                <AdminDataTable
                    columns={COLUMNS}
                    data={items}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                    onRowClick={(user) => router.push(`/secure/users/${user.id}`)}
                    emptyTitle="No users found"
                    emptyDescription="No users match your search."
                />
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="join">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
