'use client';

import type { CallDetail } from '@/lib/types';
import { useCallContext } from '@/hooks/use-call-context';
import { usePanelPreference } from '@/hooks/use-panel-preference';
import { ContextTab } from './context-tab';
import { ChatTab } from './chat-tab';
import { HistoryTab } from './history-tab';

interface CallSidePanelProps {
    call: CallDetail;
    accessToken?: string | null;
}

type PanelTab = 'context' | 'chat' | 'history';

const TABS: { id: PanelTab; label: string; icon: string; guestOnly?: boolean }[] = [
    { id: 'context', label: 'Context', icon: 'fa-circle-info' },
    { id: 'chat', label: 'Chat', icon: 'fa-messages' },
    { id: 'history', label: 'History', icon: 'fa-clock-rotate-left' },
];

/**
 * Collapsible side panel with Context, Chat, and History tabs.
 * Open by default on desktop, closed on mobile.
 * Magic-link guests see Chat tab only.
 */
export function CallSidePanel({ call, accessToken = null }: CallSidePanelProps) {
    const { entities, history, isLoading, isGuest } = useCallContext(call, accessToken);
    const { activeTab, isOpen, setActiveTab, toggleOpen, setOpen } = usePanelPreference(
        call.id,
        typeof window !== 'undefined' && window.innerWidth >= 1024,
    );

    // Guest users only see Chat tab
    const visibleTabs = isGuest ? TABS.filter((t) => t.id === 'chat') : TABS;
    const currentTab = isGuest ? 'chat' : activeTab;

    return (
        <>
            {/* Toggle button -- always visible at panel edge */}
            <button
                type="button"
                className="fixed right-0 top-1/2 -translate-y-1/2 z-40 btn btn-sm btn-neutral rounded-none h-12"
                onClick={toggleOpen}
                aria-label={isOpen ? 'Close side panel' : 'Open side panel'}
            >
                <i className={`fa-duotone fa-regular ${isOpen ? 'fa-chevron-right' : 'fa-sidebar'}`} />
            </button>

            {/* Backdrop on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Panel */}
            <div
                className={`fixed top-0 right-0 z-40 h-full bg-base-100 border-l-2 border-base-300 shadow-md
                    w-full sm:w-[350px] transition-transform duration-200
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 backdrop-blur-sm bg-base-100/95">
                        <h2 className="font-black text-lg text-base-content">
                            {call.title || 'Video Call'}
                        </h2>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-square rounded-none"
                            onClick={() => setOpen(false)}
                            aria-label="Close panel"
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    </div>

                    {/* Tabs */}
                    {visibleTabs.length > 1 && (
                        <div className="border-b border-base-300" role="tablist">
                            <div className="flex">
                                {visibleTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        className={`flex-1 py-2.5 text-sm font-semibold tracking-wide transition-colors rounded-none
                                            ${currentTab === tab.id
                                                ? 'text-primary border-b-2 border-primary bg-base-100'
                                                : 'text-base-content/50 hover:text-base-content'
                                            }`}
                                        onClick={() => setActiveTab(tab.id)}
                                        aria-selected={currentTab === tab.id}
                                    >
                                        <i className={`fa-duotone fa-regular ${tab.icon} mr-1.5`} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {currentTab === 'context' && (
                            <ContextTab
                                call={call}
                                entities={entities}
                                isLoading={isLoading}
                            />
                        )}
                        {currentTab === 'chat' && (
                            <ChatTab call={call} />
                        )}
                        {currentTab === 'history' && (
                            <HistoryTab
                                history={history}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
