"use client";

import { useState, useRef } from "react";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import type { SmartResumeProfile } from "./types";
import {
    ResumeActionDialogs,
    type ResumeActionDialogsHandle,
} from "./resume-action-dialogs";

interface SmartResumeHeaderProps {
    profile: SmartResumeProfile | null;
    candidateId: string | null;
    onUpdateProfile: (updates: Partial<SmartResumeProfile>) => Promise<void>;
    onImportComplete: () => Promise<void>;
    onGenerateResume: (jobId: string) => Promise<any>;
}

export function SmartResumeHeader({
    profile,
    candidateId,
    onUpdateProfile,
    onImportComplete,
    onGenerateResume,
}: SmartResumeHeaderProps) {
    const [headline, setHeadline] = useState(profile?.headline || "");
    const [summary, setSummary] = useState(profile?.professional_summary || "");
    const dialogsRef = useRef<ResumeActionDialogsHandle>(null);

    const debouncedSaveHeadline = useDebouncedCallback(
        (value: string) => onUpdateProfile({ headline: value }),
        1000,
    );

    const debouncedSaveSummary = useDebouncedCallback(
        (value: string) => onUpdateProfile({ professional_summary: value }),
        1000,
    );

    return (
        <section className="border-b border-base-300 bg-base-100">
            <div className="container mx-auto p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                                Smart Resume
                            </h1>
                            <button
                                type="button"
                                className="btn btn-secondary btn-soft"
                                onClick={() => dialogsRef.current?.openParse()}
                            >
                                <i className="fa-duotone fa-regular fa-file-import" />
                                Upload Resume
                            </button>
                        </div>
                        <input
                            type="text"
                            className="input w-full text-2xl font-black tracking-tight bg-transparent border-none p-0 focus:outline-none placeholder:text-base-content/20"
                            placeholder="Your professional headline"
                            value={headline}
                            onChange={(e) => {
                                setHeadline(e.target.value);
                                debouncedSaveHeadline(e.target.value);
                            }}
                        />
                        <textarea
                            className="textarea w-full h-auto mt-3 bg-transparent border-none p-0 text-sm text-base-content/70 resize-none focus:outline-none placeholder:text-base-content/20"
                            placeholder="Write a brief professional summary..."
                            rows={5}
                            value={summary}
                            onChange={(e) => {
                                setSummary(e.target.value);
                                debouncedSaveSummary(e.target.value);
                            }}
                        />
                    </div>

                    <div className="flex gap-2 shrink-0">
                        {/* <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => dialogsRef.current?.openGenerate()}
                        >
                            <i className="fa-duotone fa-regular fa-wand-magic-sparkles" />
                            Generate Resume
                        </button> */}
                    </div>
                </div>
            </div>

            <ResumeActionDialogs
                ref={dialogsRef}
                candidateId={candidateId}
                onImportComplete={onImportComplete}
                onGenerateResume={onGenerateResume}
            />
        </section>
    );
}
