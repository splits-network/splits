"use client";

import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselRefreshButton,
    type BaselViewMode,
} from "@splits-network/basel-ui";

interface ControlsBarProps {
    showing: number;
    total: number;
    searchInput: string;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    loading?: boolean;
    refresh?: () => void;
}

export function ControlsBar({
    showing,
    total,
    searchInput,
    viewMode,
    onViewModeChange,
    loading,
    refresh,
}: ControlsBarProps) {
    return (
        <BaselControlsBarShell
            statusLeft={
                <>
                    <span className="text-sm uppercase tracking-wider text-base-content/40 font-bold">
                        {loading ? (
                            <span className="loading loading-dots loading-xs" />
                        ) : (
                            `${showing} of ${total} recruiters`
                        )}
                    </span>
                    {searchInput && (
                        <span className="text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 bg-primary/10 text-primary rounded-none">
                            Filtered: &ldquo;{searchInput}&rdquo;
                        </span>
                    )}
                </>
            }
            statusRight={
                <>
                    {refresh && (
                        <BaselRefreshButton onClick={refresh} loading={loading ?? false} />
                    )}
                    <BaselViewModeSelector
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                </>
            }
        />
    );
}
