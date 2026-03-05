"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { GridCard } from "../../../candidates/components/grid/grid-card";
import type { Candidate } from "../../../candidates/types";

interface Props {
    candidateId: string;
    candidateName: string;
}

export function MatchCandidatePopup({ candidateId, candidateName }: Props) {
    const { getToken } = useAuth();
    const [open, setOpen] = useState(false);
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    // Fetch candidate on first open
    useEffect(() => {
        if (!open || candidate) return;
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: Candidate }>(
                    `/candidates/${candidateId}`,
                    { params: { include: "skills" } },
                );
                if (!cancelled) setCandidate(res.data as unknown as Candidate);
            } catch {
                // Gracefully handle errors
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, candidateId]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (
                popupRef.current && !popupRef.current.contains(e.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open]);

    const getPosition = useCallback(() => {
        if (!triggerRef.current) return { top: 0, left: 0 };
        const rect = triggerRef.current.getBoundingClientRect();
        const popupWidth = Math.min(420, window.innerWidth * 0.9);
        let left = rect.left;
        // Keep popup within viewport
        if (left + popupWidth > window.innerWidth - 8) {
            left = window.innerWidth - popupWidth - 8;
        }
        if (left < 8) left = 8;
        return { top: rect.bottom + 4, left };
    }, []);

    const pos = open ? getPosition() : { top: 0, left: 0 };

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className="group/popup inline-flex items-center gap-1.5 font-bold text-sm cursor-pointer hover:text-primary transition-colors text-left"
                onClick={(e) => { e.stopPropagation(); setOpen(prev => !prev); }}
            >
                {candidateName}
                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-xs text-base-content/30 group-hover/popup:text-primary transition-colors" />
            </button>

            {open && createPortal(
                <div
                    ref={popupRef}
                    className="fixed z-[9999] bg-base-100 shadow-2xl border border-base-300 w-[min(420px,90vw)] max-h-[70vh] overflow-y-auto"
                    style={{ top: pos.top, left: pos.left }}
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <span className="loading loading-spinner loading-md text-primary" />
                        </div>
                    ) : candidate ? (
                        <GridCard
                            candidate={candidate}
                            isSelected={false}
                            onSelect={() => setOpen(false)}
                        />
                    ) : (
                        <div className="p-6 text-center text-sm text-base-content/40">
                            Could not load candidate
                        </div>
                    )}
                </div>,
                document.body,
            )}
        </>
    );
}
