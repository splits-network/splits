"use client";

import { useEffect, useRef, useMemo } from "react";
import { useDrawer } from "@/contexts";
import type { Application } from "../../types";
import { DetailLoader } from "../shared/application-detail";
import { BoardCard } from "./board-card";
import { getStageDisplay } from "@splits-network/basel-ui";

/**
 * Board columns group related stages for a recruiter-centric pipeline view.
 * Each column has a key (display name), the stages it contains, and a sort order.
 */
const BOARD_COLUMNS: Array<{
    key: string;
    label: string;
    stages: string[];
    icon: string;
}> = [
    {
        key: "submitted",
        label: "Submitted",
        stages: ["submitted", "screen"],
        icon: "fa-paper-plane",
    },
    {
        key: "review",
        label: "Review",
        stages: [
            "company_review",
            "recruiter_review",
            "company_feedback",
            "recruiter_request",
            "recruiter_proposed",
        ],
        icon: "fa-building",
    },
    {
        key: "interview",
        label: "Interview",
        stages: ["interview"],
        icon: "fa-calendar",
    },
    {
        key: "offer",
        label: "Offer",
        stages: ["offer"],
        icon: "fa-handshake",
    },
    {
        key: "hired",
        label: "Hired",
        stages: ["hired"],
        icon: "fa-circle-check",
    },
    {
        key: "other",
        label: "Pipeline",
        stages: [
            "draft",
            "ai_review",
            "gpt_review",
            "ai_reviewed",
            "ai_failed",
        ],
        icon: "fa-robot",
    },
    {
        key: "closed",
        label: "Closed",
        stages: ["rejected", "withdrawn", "expired"],
        icon: "fa-circle-xmark",
    },
];

/** Map every known stage to its column key for O(1) lookups. */
const STAGE_TO_COLUMN = new Map<string, string>();
for (const col of BOARD_COLUMNS) {
    for (const stage of col.stages) {
        STAGE_TO_COLUMN.set(stage, col.key);
    }
}

/** Color class for the column header indicator dot. */
function columnColor(key: string): string {
    switch (key) {
        case "submitted":
            return "bg-primary";
        case "review":
            return "bg-accent";
        case "interview":
            return "bg-success";
        case "offer":
            return "bg-secondary";
        case "hired":
            return "bg-success";
        case "other":
            return "bg-info";
        case "closed":
            return "bg-error";
        default:
            return "bg-base-content/30";
    }
}

export function BoardView({
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
    const selectedApplication =
        applications.find((a) => a.id === selectedId) ?? null;
    const { open, close, isOpen } = useDrawer();
    const wasOpen = useRef(false);

    useEffect(() => {
        if (wasOpen.current && !isOpen && selectedApplication) {
            onSelect(selectedApplication);
        }
        wasOpen.current = isOpen;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (selectedApplication) {
            open(
                <DetailLoader
                    applicationId={selectedApplication.id}
                    onClose={() => onSelect(selectedApplication)}
                    onRefresh={onRefresh}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedApplication?.id]);

    /** Group applications by column key. */
    const columns = useMemo(() => {
        const grouped = new Map<string, Application[]>();
        for (const col of BOARD_COLUMNS) {
            grouped.set(col.key, []);
        }
        for (const app of applications) {
            const colKey = STAGE_TO_COLUMN.get(app.stage) ?? "other";
            const list = grouped.get(colKey);
            if (list) list.push(app);
            else grouped.set(colKey, [app]);
        }
        return grouped;
    }, [applications]);

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-18rem)] min-h-[500px]">
            {BOARD_COLUMNS.map((col) => {
                const items = columns.get(col.key) ?? [];

                // Hide empty secondary columns
                if (
                    items.length === 0 &&
                    (col.key === "other" || col.key === "closed")
                ) {
                    return null;
                }

                return (
                    <div
                        key={col.key}
                        className="flex flex-col shrink-0 w-72 xl:w-80"
                    >
                        {/* Column header */}
                        <div className="flex items-center gap-2 px-2 pb-3">
                            <div
                                className={`w-2 h-2 shrink-0 ${columnColor(col.key)}`}
                            />
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/50">
                                {col.label}
                            </span>
                            <span className="text-xs font-bold text-base-content/30">
                                {items.length}
                            </span>
                        </div>

                        {/* Cards */}
                        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                            {items.length === 0 ? (
                                <div className="flex items-center justify-center h-24 border border-dashed border-base-300 text-xs text-base-content/30">
                                    No applications
                                </div>
                            ) : (
                                items.map((app) => (
                                    <BoardCard
                                        key={app.id}
                                        application={app}
                                        isSelected={selectedId === app.id}
                                        onSelect={() => onSelect(app)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
