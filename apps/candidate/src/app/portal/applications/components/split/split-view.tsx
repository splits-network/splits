"use client";

import type { Application } from "../../types";
import { BaselSplitView } from "@splits-network/basel-ui";
import { DetailLoader } from "../shared/application-detail";
import { SplitItem } from "./split-item";

export function SplitView({
    applications,
    onSelect,
    selectedId,
    onRefresh,
}: {
    applications: Application[];
    onSelect: (app: Application) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    return (
        <BaselSplitView
            items={applications}
            selectedId={selectedId}
            getItemId={(a) => a.id}
            estimatedItemHeight={90}
            renderItem={(app, isSelected) => (
                <SplitItem
                    app={app}
                    isSelected={isSelected}
                    onSelect={() => onSelect(app)}
                />
            )}
            renderDetail={(app) => (
                <DetailLoader
                    applicationId={app.id}
                    onClose={() => onSelect(app)}
                    onRefresh={onRefresh}
                />
            )}
            emptyIcon="fa-hand-pointer"
            emptyTitle="Select an application to view details"
            initialListWidth={40}
            onMobileClose={() => {
                const selected = applications.find((a) => a.id === selectedId);
                if (selected) onSelect(selected);
            }}
        />
    );
}
