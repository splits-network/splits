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
    const { data, loading, sortBy, sortOrder, handleSort, refresh } = useStandardList<AutomationRule>({
        endpoint: '/automation/admin/rules',
        defaultSortBy: 'name',
        defaultSortOrder: 'asc',
        syncToUrl: true,
    });

    async function handleToggle(rule: AutomationRule) {
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = createAuthenticatedClient(token);
            await client.patch(`/automation/admin/rules/${rule.id}`, {
                is_active: !rule.is_active,
            });
            success(`Rule "${rule.name}" ${rule.is_active ? 'disabled' : 'enabled'}`);
            refresh();
        } catch {
            error('Failed to update rule status');
        }
    }

    if (!loading && data.length === 0) {
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
                        data={data}
                        loading={loading}
                        sortField={sortBy}
                        sortDir={sortOrder}
                        onSort={handleSort}
                        onToggle={handleToggle}
                    />
                </div>
            </div>
        </div>
    );
}
