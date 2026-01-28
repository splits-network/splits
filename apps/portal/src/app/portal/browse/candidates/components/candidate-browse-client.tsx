"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
// Placeholder imports - we will create these next
import CandidateListPanel from "./candidate-list-panel";
import CandidateDetailPanel from "./candidate-detail-panel";

function CandidateBrowseContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedCandidateId = searchParams.get("candidateId");

    const handleSelectCandidate = (id: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
            params.set("candidateId", id);
        } else {
            params.delete("candidateId");
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-base-200 rounded-xl overflow-hidden border border-base-300 shadow-sm">
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: List */}
                <div
                    className={`
                w-full md:w-96 lg:w-[420px] shrink-0 border-r border-base-300 bg-base-200 flex flex-col
                ${selectedCandidateId ? "hidden md:flex" : "flex"}
            `}
                >
                    <CandidateListPanel
                        selectedId={selectedCandidateId}
                        onSelect={handleSelectCandidate}
                    />
                </div>

                {/* Right Panel: Detail */}
                <div
                    className={`
                flex-1 bg-base-100 flex flex-col overflow-hidden
                ${!selectedCandidateId ? "hidden md:flex" : "flex"}
            `}
                >
                    <CandidateDetailPanel
                        candidateId={selectedCandidateId}
                        onClose={() => handleSelectCandidate(null)}
                    />
                </div>
            </div>
        </div>
    );
}

export default function CandidateBrowseClient() {
    return (
        <Suspense
            fallback={
                <div className="h-full flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            }
        >
            <CandidateBrowseContent />
        </Suspense>
    );
}
