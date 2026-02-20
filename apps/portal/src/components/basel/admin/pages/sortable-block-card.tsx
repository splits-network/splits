"use client";

import type { ContentBlock, ContentBlockType } from "@splits-network/shared-types";
import { SortableItemWrapper } from "../shared/sortable-item-wrapper";

interface SortableBlockCardProps {
    id: string;
    block: ContentBlock;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}

const BLOCK_META: Record<ContentBlockType, { icon: string; label: string }> = {
    "hero": { icon: "fa-rocket-launch", label: "Hero" },
    "full-bleed-image": { icon: "fa-image-landscape", label: "Full Bleed Image" },
    "article-body": { icon: "fa-paragraph", label: "Article Body" },
    "split-editorial": { icon: "fa-columns-3", label: "Split Editorial" },
    "pull-quote": { icon: "fa-quote-left", label: "Pull Quote" },
    "stats-bar": { icon: "fa-chart-simple", label: "Stats Bar" },
    "inline-image": { icon: "fa-image", label: "Inline Image" },
    "cta": { icon: "fa-bullhorn", label: "Call to Action" },
    "feature-grid": { icon: "fa-grid-2", label: "Feature Grid" },
    "timeline": { icon: "fa-timeline", label: "Timeline" },
    "faq": { icon: "fa-circle-question", label: "FAQ" },
    "benefits-cards": { icon: "fa-cards-blank", label: "Benefits Cards" },
};

function getBlockSummary(block: ContentBlock): string {
    switch (block.type) {
        case "hero":
            return block.kicker || block.subtitle || "Hero section";
        case "full-bleed-image":
            return block.caption || block.imageAlt || "Image";
        case "article-body":
            return block.heading;
        case "split-editorial":
            return block.heading;
        case "pull-quote":
            return block.quote.length > 50 ? block.quote.slice(0, 50) + "..." : block.quote;
        case "stats-bar":
            return `${block.stats.length} stat${block.stats.length !== 1 ? "s" : ""}`;
        case "inline-image":
            return block.caption || block.imageAlt || "Image";
        case "cta":
            return block.heading;
        case "feature-grid":
            return block.heading || `${block.items.length} feature${block.items.length !== 1 ? "s" : ""}`;
        case "timeline":
            return block.heading || `${block.steps.length} step${block.steps.length !== 1 ? "s" : ""}`;
        case "faq":
            return block.heading || `${block.items.length} FAQ${block.items.length !== 1 ? "s" : ""}`;
        case "benefits-cards":
            return block.heading || `${block.cards.length} card${block.cards.length !== 1 ? "s" : ""}`;
        default:
            return (block as unknown as { type: string }).type;
    }
}

export function SortableBlockCard({ id, block, index, onEdit, onDelete }: SortableBlockCardProps) {
    const meta = BLOCK_META[block.type] || { icon: "fa-cube", label: block.type };
    const summary = getBlockSummary(block);

    return (
        <SortableItemWrapper id={id}>
            {({ dragHandleProps }) => (
                <div className="flex items-center gap-3 bg-base-100 border border-base-300 p-3 group hover:border-primary/30 transition-colors">
                    {/* Drag handle */}
                    <button
                        type="button"
                        ref={dragHandleProps.ref}
                        {...dragHandleProps.listeners}
                        {...dragHandleProps.attributes}
                        className="cursor-grab active:cursor-grabbing text-base-content/30 hover:text-base-content/60 transition-colors"
                        tabIndex={-1}
                    >
                        <i className="fa-duotone fa-regular fa-grip-dots-vertical"></i>
                    </button>

                    {/* Block info */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-7 h-7 flex items-center justify-center bg-primary/10 text-primary text-xs flex-shrink-0">
                            <i className={`fa-duotone fa-regular ${meta.icon}`}></i>
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                                {meta.label}
                            </div>
                            <div className="text-sm text-base-content/70 truncate">
                                {summary}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            type="button"
                            onClick={onEdit}
                            className="btn btn-ghost btn-xs"
                            title="Edit block"
                        >
                            <i className="fa-duotone fa-regular fa-pen"></i>
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="btn btn-ghost btn-xs text-error"
                            title="Remove block"
                        >
                            <i className="fa-duotone fa-regular fa-trash-can"></i>
                        </button>
                    </div>

                    {/* Index badge */}
                    <span className="text-[10px] font-mono text-base-content/20">
                        {index + 1}
                    </span>
                </div>
            )}
        </SortableItemWrapper>
    );
}
