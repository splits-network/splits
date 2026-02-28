'use client';

import { AdminPageHeader } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';
import { ChatTable, type ChatMessage } from './components/chat-table';

const STATUS_OPTIONS = ['all', 'pending', 'reviewed', 'removed', 'cleared'] as const;

export default function ChatModerationPage() {
    const { items, loading, sortBy, sortOrder, handleSort, filters, setFilter } =
        useStandardList<ChatMessage, { status: string }>({
            endpoint: '/chat/admin/flagged',
            defaultSortBy: 'flagged_at',
            defaultSortOrder: 'desc',
            defaultFilters: { status: 'pending' },
            syncToUrl: true,
        });

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Chat Moderation"
                subtitle="Review and moderate flagged messages"
            />

            <div className="flex gap-3 mb-4">
                <select
                    className="select select-sm select-bordered"
                    value={filters.status}
                    onChange={(e) => setFilter('status', e.target.value)}
                >
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {s === 'all'
                                ? 'All Statuses'
                                : s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-0">
                    <ChatTable
                        data={items}
                        loading={loading}
                        sortField={sortBy}
                        sortDir={sortOrder}
                        onSort={handleSort}
                    />
                </div>
            </div>
        </div>
    );
}
