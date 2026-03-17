"use client";

import type { RecruiterWithUser } from "../../types";
import { BaselSplitView } from "@splits-network/basel-ui";
import { DetailLoader } from "../shared/recruiter-detail";
import { SplitItem } from "./split-item";

export function SplitView({
    recruiters,
    onSelect,
    selectedId,
    onRefresh,
}: {
    recruiters: RecruiterWithUser[];
    onSelect: (r: RecruiterWithUser) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    return (
        <BaselSplitView
            items={recruiters}
            selectedId={selectedId}
            getItemId={(r) => r.id}
            estimatedItemHeight={90}
            renderItem={(recruiter, isSelected) => (
                <SplitItem
                    recruiter={recruiter}
                    isSelected={isSelected}
                    onSelect={() => onSelect(recruiter)}
                />
            )}
            renderDetail={(recruiter) => (
                <DetailLoader
                    recruiterId={recruiter.id}
                    onClose={() => onSelect(recruiter)}
                    onRefresh={onRefresh}
                />
            )}
            emptyIcon="fa-users"
            emptyTitle="Select a Recruiter"
            emptyDescription="Click a recruiter on the left to view their profile"
            initialListWidth={33}
            onMobileClose={() => {
                const selected = recruiters.find((r) => r.id === selectedId);
                if (selected) onSelect(selected);
            }}
        />
    );
}
