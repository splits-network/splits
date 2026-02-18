"use client";

import type { RecruiterWithUser } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
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
    const selectedAc = selectedRecruiter ? accentAt(recruiters.indexOf(selectedRecruiter)) : ACCENT[0];

    return (
        <div className="flex gap-0 border-4 border-dark" style={{ minHeight: 600 }}>
            {/* Left list */}
            <div className={`w-full md:w-2/5 border-r-4 border-dark overflow-y-auto ${selectedId ? "hidden md:block" : "block"}`}>
                {recruiters.map((recruiter, idx) => (
                    <SplitItem
                        key={recruiter.id}
                        recruiter={recruiter}
                        accent={accentAt(idx)}
                        isSelected={selectedId === recruiter.id}
                        onSelect={() => onSelect(recruiter)}
                    />
                ))}
            </div>

            {/* Right detail */}
            <MobileDetailOverlay
                isOpen={!!selectedRecruiter}
                className="md:w-3/5 w-full bg-white overflow-y-auto"
            >
                {selectedRecruiter ? (
                    <DetailLoader
                        recruiterId={selectedRecruiter.id}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedRecruiter)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-yellow" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-dark">
                                Select a Recruiter
                            </h3>
                            <p className="text-sm text-dark/50">
                                Click a recruiter on the left to view their profile
                            </p>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
