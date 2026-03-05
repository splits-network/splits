"use client";

import type { Job } from "../../types";
import { MarkdownRenderer } from "@splits-network/shared-ui";

/* ─── Candidate Description Tab ─────────────────────────────────────────── */

export function CandidateDescriptionTab({ job }: { job: Job }) {
    const content = job.candidate_description || job.description;

    if (!content) {
        return (
            <div className="text-center py-12 text-base-content/40">
                <i className="fa-duotone fa-regular fa-user text-3xl mb-3 block" />
                <p className="text-sm font-semibold">
                    No candidate description available
                </p>
            </div>
        );
    }

    return (
        <div className="border-l-4 border-l-primary pl-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                Candidate Description
            </h3>
            <MarkdownRenderer
                content={content}
                className="prose prose-sm max-w-none text-base-content/70 leading-relaxed"
            />
        </div>
    );
}
