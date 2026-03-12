'use client';

import type { SupportConversation } from '../page';

type SupportQueueProps = {
    conversations: SupportConversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    loading: boolean;
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
};

function formatTime(dateStr: string | null) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

function statusBadge(status: string) {
    const map: Record<string, string> = {
        open: 'badge-warning',
        waiting_on_visitor: 'badge-info',
        waiting_on_admin: 'badge-error',
        resolved: 'badge-success',
        closed: 'badge-neutral',
    };
    return map[status] ?? 'badge-ghost';
}

function categoryIcon(category: string | null) {
    const map: Record<string, string> = {
        question: 'fa-circle-question',
        issue: 'fa-triangle-exclamation',
        error: 'fa-bug',
        feedback: 'fa-lightbulb',
    };
    return category ? map[category] ?? 'fa-message' : 'fa-message';
}

export function SupportQueue({
    conversations,
    activeId,
    onSelect,
    loading,
    statusFilter,
    onStatusFilterChange,
}: SupportQueueProps) {
    return (
        <div className="w-80 border-r border-base-300 flex flex-col bg-base-100 min-h-0">
            {/* Filter */}
            <div className="p-3 border-b border-base-300">
                <select
                    className="select select-sm w-full"
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                >
                    <option value="">All</option>
                    <option value="open">Open</option>
                    <option value="waiting_on_admin">Waiting on Admin</option>
                    <option value="waiting_on_visitor">Waiting on Visitor</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <span className="loading loading-spinner loading-sm" />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center p-6 text-base-content/40">
                        <p className="text-sm">No conversations</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            key={conv.id}
                            type="button"
                            onClick={() => onSelect(conv.id)}
                            className={`w-full text-left p-3 border-b border-base-300 hover:bg-base-200 transition-colors ${
                                activeId === conv.id ? 'bg-base-200' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <i className={`fa-duotone fa-regular ${categoryIcon(conv.category)} text-sm text-primary`} />
                                        <span className="text-sm font-semibold truncate">
                                            {conv.subject || conv.visitor_name || conv.visitor_email || `Session ${conv.visitor_session_id.slice(0, 8)}`}
                                        </span>
                                    </div>
                                    {conv.last_message_preview && (
                                        <p className="text-sm text-base-content/50 truncate">
                                            {conv.last_message_preview}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`badge badge-sm ${statusBadge(conv.status)}`}>
                                            {conv.status.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-sm text-base-content/30">{conv.source_app}</span>
                                    </div>
                                </div>
                                <span className="text-sm text-base-content/30 flex-shrink-0">
                                    {formatTime(conv.last_message_at || conv.created_at)}
                                </span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
