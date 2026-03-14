"use client";

import { useEffect, useRef } from "react";
import { useDrawer } from "@/contexts";
import type { Candidate } from "../../types";
import { DetailLoader } from "../shared/candidate-detail";
import { GridCard } from "./grid-card";

export function GridView({
    candidates,
    onSelect,
    selectedId,
    onRefresh,
    onUpdateItem,
}: {
    candidates: Candidate[];
    onSelect: (c: Candidate) => void;
    selectedId: string | null;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Candidate>) => void;
}) {
    const selectedCandidate =
        candidates.find((c) => c.id === selectedId) ?? null;
    const { open, close, isOpen } = useDrawer();
    const wasOpen = useRef(false);

    useEffect(() => {
        if (wasOpen.current && !isOpen && selectedCandidate) {
            onSelect(selectedCandidate);
        }
        wasOpen.current = isOpen;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (selectedCandidate) {
            open(
                <DetailLoader
                    candidateId={selectedCandidate.id}
                    onClose={() => onSelect(selectedCandidate)}
                    onRefresh={onRefresh}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCandidate?.id]);

    return (
        <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
            {candidates.map((candidate) => (
                <GridCard
                    key={candidate.id}
                    candidate={candidate}
                    isSelected={selectedId === candidate.id}
                    onSelect={() => onSelect(candidate)}
                    onRefresh={onRefresh}
                    onUpdateItem={onUpdateItem}
                />
            ))}
        </div>
    );
}
