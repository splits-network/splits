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
    onSelect: (a: Application) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    return (
        <BaselSplitView
            items={applications}
            selectedId={selectedId}
            getItemId={(a) => a.id}
            estimatedItemHeight={90}
            renderItem={(application, isSelected) => (
                <SplitItem
                    application={application}
                    isSelected={isSelected}
                    onSelect={() => onSelect(application)}
                />
            )}
            renderDetail={(application) => (
                <DetailLoader
                    applicationId={application.id}
                    onClose={() => onSelect(application)}
                    onRefresh={onRefresh}
                />
            )}
            emptyIcon="fa-hand-pointer"
            emptyTitle="Select an application"
            emptyDescription="Click an application on the left to view details"
            initialListWidth={38}
            mobileBreakpoint="lg"
            onMobileClose={() => {
                const selected = applications.find((a) => a.id === selectedId);
                if (selected) onSelect(selected);
            }}
        />
    );
}
