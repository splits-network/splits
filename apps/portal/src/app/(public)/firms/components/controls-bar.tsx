"use client";

import {
    BaselControlsBarShell,
    BaselResultsCount,
    BaselRefreshButton,
} from "@splits-network/basel-ui";

interface ControlsBarProps {
    resultCount: number;
    totalCount: number;
    loading: boolean;
    refresh: () => void;
}

export function ControlsBar({
    resultCount,
    totalCount,
    loading,
    refresh,
}: ControlsBarProps) {
    return (
        <BaselControlsBarShell
            statusLeft={
                <BaselResultsCount count={resultCount} total={totalCount} />
            }
            statusRight={
                <BaselRefreshButton onClick={refresh} loading={loading} />
            }
        />
    );
}
