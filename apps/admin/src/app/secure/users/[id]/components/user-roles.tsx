'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminApiClient } from '@/lib/api-client';
import { AdminConfirmModal } from '@/components/shared';
import { useAdminToast } from '@/hooks/use-admin-toast';
import type { UserDetail, UserRole } from '../page';

const AVAILABLE_ROLES = [
    { value: 'platform_admin', label: 'Platform Admin' },
    { value: 'company_admin', label: 'Company Admin' },
    { value: 'hiring_manager', label: 'Hiring Manager' },
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'candidate', label: 'Candidate' },
];

const ROLE_BADGE: Record<string, string> = {
    platform_admin: 'badge-error',
    company_admin: 'badge-warning',
    hiring_manager: 'badge-info',
    recruiter: 'badge-primary',
    candidate: 'badge-success',
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type Props = {
    user: UserDetail;
    onUpdate: () => void;
};

export function UserRoles({ user, onUpdate }: Props) {
    const { getToken } = useAuth();
    const toast = useAdminToast();
    const [addingRole, setAddingRole] = useState('');
    const [saving, setSaving] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<UserRole | null>(null);
    const [removing, setRemoving] = useState(false);

    const existingRoleNames = new Set(user.roles.map(r => r.role_name));
    const availableToAdd = AVAILABLE_ROLES.filter(r => !existingRoleNames.has(r.value));

    async function handleAddRole() {
        if (!addingRole) return;
        setSaving(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = new AdminApiClient(token);
            await client.post(`/identity/admin/users/${user.id}/roles`, { role_name: addingRole });
            toast.success(`Role "${addingRole.replace(/_/g, ' ')}" added`);
            setAddingRole('');
            onUpdate();
        } catch {
            toast.error('Failed to add role');
        } finally {
            setSaving(false);
        }
    }

    async function handleRemoveRole() {
        if (!removeTarget) return;
        setRemoving(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = new AdminApiClient(token);
            await client.delete(`/identity/admin/users/${user.id}/roles/${removeTarget.id}`);
            toast.success(`Role "${removeTarget.role_name.replace(/_/g, ' ')}" removed`);
            setRemoveTarget(null);
            onUpdate();
        } catch {
            toast.error('Failed to remove role');
        } finally {
            setRemoving(false);
        }
    }

    return (
        <div className="space-y-4">
            {/* Add role */}
            <div className="card bg-base-100 border border-base-200">
                <div className="card-body">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">Add Role</h3>
                    {availableToAdd.length > 0 ? (
                        <div className="flex items-center gap-2">
                            <select
                                className="select select-sm flex-1"
                                value={addingRole}
                                onChange={(e) => setAddingRole(e.target.value)}
                            >
                                <option value="">Select a role...</option>
                                {availableToAdd.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                disabled={!addingRole || saving}
                                onClick={handleAddRole}
                            >
                                {saving && <span className="loading loading-spinner loading-xs" />}
                                Add
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-base-content/40">User has all available roles assigned.</p>
                    )}
                </div>
            </div>

            {/* Current roles */}
            <div className="card bg-base-100 border border-base-200">
                <div className="card-body">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">
                        Current Roles ({user.roles.length})
                    </h3>
                    {user.roles.length === 0 ? (
                        <p className="text-sm text-base-content/40">No roles assigned.</p>
                    ) : (
                        <div className="space-y-2">
                            {user.roles.map((role) => (
                                <div
                                    key={role.id}
                                    className="flex items-center justify-between py-2 border-b border-base-200 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`badge badge-sm capitalize ${ROLE_BADGE[role.role_name] ?? 'badge-ghost'}`}>
                                            {role.role_name.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-xs text-base-content/40">
                                            since {formatDate(role.created_at)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-xs btn-ghost text-error"
                                        onClick={() => setRemoveTarget(role)}
                                    >
                                        <i className="fa-duotone fa-regular fa-trash" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {removeTarget && (
                <AdminConfirmModal
                    isOpen={!!removeTarget}
                    onClose={() => setRemoveTarget(null)}
                    onConfirm={handleRemoveRole}
                    title="Remove Role"
                    message={`Remove the "${removeTarget.role_name.replace(/_/g, ' ')}" role from this user?`}
                    confirmLabel="Remove"
                    confirmVariant="error"
                    loading={removing}
                />
            )}
        </div>
    );
}
