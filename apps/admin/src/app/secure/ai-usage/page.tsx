'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/shared';
import { UsageDashboard } from './components/usage-dashboard';
import { ModelConfigTable } from './components/model-config-table';
import { UsageLogTable } from './components/usage-log-table';

type Tab = 'dashboard' | 'config' | 'logs';

const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Usage Dashboard', icon: 'fa-chart-mixed' },
    { id: 'config', label: 'Model Config', icon: 'fa-sliders' },
    { id: 'logs', label: 'Usage Log', icon: 'fa-list-timeline' },
];

export default function AiUsagePage() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    return (
        <div>
            <AdminPageHeader
                title="AI Models & Usage"
                subtitle="Configure AI providers per operation and track usage costs"
            />

            <div role="tablist" className="tabs tabs-border mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        type="button"
                        className={`tab gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <i className={`fa-duotone fa-regular ${tab.icon}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'dashboard' && <UsageDashboard />}
            {activeTab === 'config' && <ModelConfigTable />}
            {activeTab === 'logs' && <UsageLogTable />}
        </div>
    );
}
