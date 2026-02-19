"use client";

import type { RecruiterWithUser } from "../../types";
import { DetailLoader } from "../shared/recruiter-detail";
import { MobileDetailOverlay } from "@/components/standard-lists";
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
    const selectedRecruiter = recruiters.find((r) => r.id === selectedId);

    return (
        <div
            className="flex gap-0 border-2 border-base-300 shadow-sm"
            style={{ minHeight: 600 }}
        >
            {/* Left list */}
            <div
                className={`w-full md:w-2/5 border-r border-base-300 overflow-y-auto ${selectedId ? "hidden md:block" : "block"}`}
            >
                {recruiters.map((recruiter) => (
                    <SplitItem
                        key={recruiter.id}
                        recruiter={recruiter}
                        isSelected={selectedId === recruiter.id}
                        onSelect={() => onSelect(recruiter)}
                    />
                ))}
            </div>

            {/* Right detail */}
            <MobileDetailOverlay
                isOpen={!!selectedRecruiter}
                className="md:w-3/5 w-full bg-base-100 overflow-y-auto"
            >
                {selectedRecruiter ? (
                    <DetailLoader
                        recruiterId={selectedRecruiter.id}
                        onClose={() => onSelect(selectedRecruiter)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-users text-2xl text-primary" />
                            </div>
                            <h3 className="font-black text-xl tracking-tight mb-2">
                                Select a Recruiter
                            </h3>
                            <p className="text-sm text-base-content/50">
                                Click a recruiter on the left to view their
                                profile
                            </p>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
