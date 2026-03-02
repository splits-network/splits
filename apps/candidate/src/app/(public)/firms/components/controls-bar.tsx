"use client";

import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    type BaselViewMode,
} from "@splits-network/basel-ui";

interface ControlsBarProps {
    resultCount: number;
    totalCount: number;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    loading: boolean;
    refresh: () => void;
}

export function ControlsBar({
    resultCount,
    totalCount,
    viewMode,
    onViewModeChange,
    loading,
    refresh,
}: ControlsBarProps) {
    return (
        <BaselControlsBarShell
            statusLeft={
                <BaselResultsCount count={resultCount} total={totalCount} />
            }
            statusRight={
                <>
                    <BaselRefreshButton onClick={refresh} loading={loading} />
                    <BaselViewModeSelector
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                </>
            }
        />
    );
}
