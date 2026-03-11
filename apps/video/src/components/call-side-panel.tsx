'use client';

import type { CallDetail } from '@/lib/types';
import { useCallContext } from '@/hooks/use-call-context';
import { usePanelPreference } from '@/hooks/use-panel-preference';
import type { PanelTab } from '@/hooks/use-panel-preference';
import { ContextTab } from './context-tab';
import { ChatTab } from './chat-tab';
import { HistoryTab } from './history-tab';
import { ParticipantsTab } from './participants-tab';

interface CallSidePanelProps {
    call: CallDetail;
    localName: string;
    accessToken?: string | null;
}

const TABS: { id: PanelTab; label: string; icon: string; guestHidden?: boolean }[] = [
    { id: 'participants', label: 'People', icon: 'fa-users' },
    { id: 'context', label: 'Context', icon: 'fa-circle-info', guestHidden: true },
    { id: 'chat', label: 'Chat', icon: 'fa-messages' },
    { id: 'history', label: 'History', icon: 'fa-clock-rotate-left', guestHidden: true },
];

/**
 * Unified side drawer with vertical binder-style tabs on the left edge.
 * Combines participants, context, chat, and history into a single panel.
 * Tab strip is always visible; content panel expands/collapses.
 */
export function CallSidePanel({ call, localName, accessToken = null }: CallSidePanelProps) {
    const { entities, history, isLoading, isGuest } = useCallContext(call, accessToken);
    const { activeTab, isOpen, selectTab, setOpen } = usePanelPreference(
        call.id,
        typeof window !== 'undefined' && window.innerWidth >= 1024,
    );

    const visibleTabs = isGuest
        ? TABS.filter((t) => !t.guestHidden)
        : TABS;

    const currentTab = isGuest && (activeTab === 'context' || activeTab === 'history')
        ? 'chat'
        : activeTab;

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <div className="flex h-full z-30 relative">
                {/* Binder tab strip — always visible */}
                <div className="w-11 bg-base-200 border-l-2 border-base-300 flex flex-col items-center pt-3 gap-1 flex-shrink-0">
                    {visibleTabs.map((tab) => {
                        const isActive = currentTab === tab.id && isOpen;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                className={`btn btn-square btn-sm rounded-none transition-colors ${
                                    isActive
                                        ? 'btn-primary'
                                        : 'btn-ghost text-base-content/50 hover:text-base-content'
                                }`}
                                onClick={() => selectTab(tab.id)}
                                aria-label={tab.label}
                                title={tab.label}
                            >
                                <i className={`fa-duotone fa-regular ${tab.icon} text-sm`} />
                            </button>
                        );
                    })}
                </div>

                {/* Content panel — expands when open */}
                {isOpen && (
                    <div className="w-[320px] bg-base-100 border-l border-base-300 flex flex-col
                        max-lg:fixed max-lg:top-0 max-lg:right-0 max-lg:h-full max-lg:z-40 max-lg:shadow-xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-100/95 flex-shrink-0">
                            <h2 className="font-black text-lg text-base-content truncate">
                                {visibleTabs.find((t) => t.id === currentTab)?.label ?? 'Panel'}
                            </h2>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm btn-square rounded-none lg:hidden"
                                onClick={() => setOpen(false)}
                                aria-label="Close panel"
                            >
                                <i className="fa-duotone fa-regular fa-xmark" />
                            </button>
                        </div>

                        {/* Tab content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {currentTab === 'participants' && (
                                <ParticipantsTab call={call} localName={localName} />
                            )}
                            {currentTab === 'context' && (
                                <ContextTab
                                    call={call}
                                    entities={entities}
                                    isLoading={isLoading}
                                />
                            )}
                            {currentTab === 'chat' && (
                                <ChatTab />
                            )}
                            {currentTab === 'history' && (
                                <HistoryTab
                                    history={history}
                                    isLoading={isLoading}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
