"use client";

import { useEffect, useRef } from "react";
import { useDrawer } from "@/contexts";
import type { RecruiterWithUser } from "../../types";
import { DetailLoader } from "../shared/recruiter-detail";
import { GridCard } from "./grid-card";

export function GridView({
    recruiters,
    onSelectAction,
    selectedId,
    onRefreshAction,
}: {
    recruiters: RecruiterWithUser[];
    onSelectAction: (r: RecruiterWithUser) => void;
    selectedId: string | null;
    onRefreshAction?: () => void;
}) {
    const selectedRecruiter = recruiters.find((r) => r.id === selectedId);
    const { open, close, isOpen } = useDrawer();
    const wasOpen = useRef(false);

    useEffect(() => {
        if (wasOpen.current && !isOpen && selectedRecruiter) {
            onSelectAction(selectedRecruiter);
        }
        wasOpen.current = isOpen;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (selectedRecruiter) {
            open(
                <DetailLoader
                    recruiterId={selectedRecruiter.id}
                    onClose={() => onSelectAction(selectedRecruiter)}
                    onRefresh={onRefreshAction}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRecruiter?.id]);

    return (
        <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
            {recruiters.map((recruiter) => (
                <GridCard
                    key={recruiter.id}
                    recruiter={recruiter}
                    isSelected={selectedId === recruiter.id}
                    onSelect={() => onSelectAction(recruiter)}
                    onRefresh={onRefreshAction}
                />
            ))}
        </div>
    );
}
