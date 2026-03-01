"use client";

import { useState } from "react";
import { BaselArticleRenderer } from "@splits-network/basel-ui";
import type { ContentBlock } from "@splits-network/shared-types";

interface LivePreviewPaneProps {
    blocks: ContentBlock[];
}

export function LivePreviewPane({ blocks }: LivePreviewPaneProps) {
    const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

    if (blocks.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-base-200 border border-base-300 min-h-[400px]">
                <div className="text-center text-base-content/40">
                    <i className="fa-duotone fa-regular fa-file-dashed-line text-4xl mb-3 block"></i>
                    <p className="text-sm font-medium">No blocks yet</p>
                    <p className="text-xs mt-1">Add a block from the panel to see a live preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-base-200 border border-base-300 min-h-[400px]">
            {/* Preview toolbar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-base-300 bg-base-100">
                <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mr-2">
                    Preview
                </span>
                <button
                    type="button"
                    onClick={() => setViewMode("desktop")}
                    className={`btn btn-xs ${viewMode === "desktop" ? "btn-primary" : "btn-ghost"}`}
                    title="Desktop"
                >
                    <i className="fa-duotone fa-regular fa-desktop"></i>
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode("mobile")}
                    className={`btn btn-xs ${viewMode === "mobile" ? "btn-primary" : "btn-ghost"}`}
                    title="Mobile"
                >
                    <i className="fa-duotone fa-regular fa-mobile"></i>
                </button>
            </div>

            {/* Preview content — override opacity-0 since GSAP animations are skipped in editor */}
            <div className="flex-1 overflow-y-auto p-4">
                <div
                    className={`bg-base-100 shadow mx-auto transition-all ${
                        viewMode === "mobile" ? "max-w-[375px]" : "w-full"
                    }`}
                >
                    <BaselArticleRenderer blocks={blocks} className="[&_*]:!opacity-100" />
                </div>
            </div>
        </div>
    );
}
