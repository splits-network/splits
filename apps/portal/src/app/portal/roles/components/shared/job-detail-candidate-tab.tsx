"use client";

import type { Job } from "../../types";
import { MarkdownRenderer } from "@splits-network/shared-ui";

/* ─── Candidate Description Tab ─────────────────────────────────────────── */

export function CandidateDescriptionTab({ job }: { job: Job }) {
    const content = job.candidate_description || job.description;

    if (!content) {
        return (
            <div className="text-center py-12">
                <i className="fa-duotone fa-regular fa-user text-3xl text-base-content/20 mb-3 block" />
                <p className="text-sm font-semibold text-base-content/40">
                    No candidate description available
                </p>
            </div>
        );
    }

    return (
        <div className="border-l-4 border-l-success pl-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                <i className="fa-duotone fa-regular fa-globe text-success mr-1.5" />
                Candidate Description
            </h3>
            <MarkdownRenderer
                content={content}
                className="prose prose-sm max-w-none text-base-content/70 leading-relaxed"
            />
        </div>
    );
}
