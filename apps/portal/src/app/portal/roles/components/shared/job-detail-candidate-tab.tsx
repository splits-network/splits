"use client";

import type { Job } from "../../types";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import { BaselEmptyState } from "@splits-network/basel-ui";

/* ─── Candidate Description Tab ─────────────────────────────────────────── */

export function CandidateDescriptionTab({ job }: { job: Job }) {
    const content = job.candidate_description || job.description;

    if (!content) {
        return (
            <BaselEmptyState
                icon="fa-duotone fa-regular fa-user"
                title="No Description"
                description="No candidate description has been added to this role yet."
            />
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
