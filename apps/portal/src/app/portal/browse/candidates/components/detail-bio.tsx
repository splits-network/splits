"use client";

import { Candidate } from "./types";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export default function DetailBio({ candidate }: { candidate: Candidate }) {
    // Prioritize rich bio from marketplace profile → then standard bio → then legacy description
    const bioText =
        candidate.marketplace_profile?.bio_rich ||
        candidate.bio ||
        candidate.description;

    return (
        <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <i className="fa-duotone fa-regular fa-address-card text-primary"></i>
                About
            </h3>
            <div className="text-base-content/80 bg-base-200/50 p-4 rounded-lg border border-base-200">
                {bioText ? (
                    <MarkdownRenderer content={bioText} />
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-60">
                        <i className="fa-duotone fa-regular fa-pen-field text-4xl mb-2"></i>
                        <p className="italic">No biography provided.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
