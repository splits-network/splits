'use client';

import { AdminPageHeader, AdminEmptyState } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';
import { useAdminToast } from '@/hooks/use-admin-toast';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { RuleTable, type AutomationRule } from './components/rule-table';

export default function AutomationPage() {
    const { getToken } = useAuth();
    const { success, error } = useAdminToast();
    const { items, loading, sortBy: sortField, sortOrder: sortDir, handleSort: setSort, refetch } = useStandardList<AutomationRule>({
        endpoint: '/admin/automation/admin/rules',
        defaultSortBy: 'name',
        defaultSortOrder: 'asc',
        syncToUrl: true,
    });

    async function handleToggle(rule: AutomationRule) {
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = createAuthenticatedClient(token);
            await client.patch(`/admin/automation/admin/rules/${rule.id}`, {
                is_active: !rule.is_active,
            });
            success(`Rule "${rule.name}" ${rule.is_active ? 'disabled' : 'enabled'}`);
            refetch();
        } catch {
            error('Failed to update rule status');
        }
    }

    if (!loading && items.length === 0) {
        return (
            <div className="p-6">
                <AdminPageHeader
                    title="Automation"
                    subtitle="Manage platform automation rules and triggers"
                />
                <AdminEmptyState
                    icon="fa-robot"
                    title="No automation rules"
                    description="Automation rules will appear here once configured in the system."
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Automation"
                subtitle="Manage platform automation rules and triggers"
            />

            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-0">
                    <RuleTable
                        data={items}
                        loading={loading}
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={setSort}
                        onToggle={handleToggle}
                    />
                </div>
            </div>
        </div>
    );
}
