"use client";

import type { ContentBlockType } from "@splits-network/shared-types";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
} from "@splits-network/basel-ui";

interface BlockPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: ContentBlockType) => void;
}

const BLOCK_OPTIONS: { type: ContentBlockType; icon: string; label: string; desc: string }[] = [
    { type: "hero", icon: "fa-rocket-launch", label: "Hero", desc: "Full-width intro with headline and buttons" },
    { type: "article-body", icon: "fa-paragraph", label: "Article Body", desc: "Text section with heading and paragraphs" },
    { type: "split-editorial", icon: "fa-columns-3", label: "Split Editorial", desc: "Side-by-side text and image" },
    { type: "feature-grid", icon: "fa-grid-2", label: "Feature Grid", desc: "Grid of feature cards" },
    { type: "cta", icon: "fa-bullhorn", label: "Call to Action", desc: "Action section with buttons" },
    { type: "faq", icon: "fa-circle-question", label: "FAQ", desc: "Questions and answers" },
    { type: "timeline", icon: "fa-timeline", label: "Timeline", desc: "Step-by-step process" },
    { type: "benefits-cards", icon: "fa-cards-blank", label: "Benefits Cards", desc: "Highlighted benefit cards" },
    { type: "stats-bar", icon: "fa-chart-simple", label: "Stats Bar", desc: "Row of key metrics" },
    { type: "pull-quote", icon: "fa-quote-left", label: "Pull Quote", desc: "Highlighted quotation" },
    { type: "full-bleed-image", icon: "fa-image-landscape", label: "Full Bleed Image", desc: "Edge-to-edge image with optional overlay" },
    { type: "inline-image", icon: "fa-image", label: "Inline Image", desc: "Captioned image within content" },
];

export function BlockPickerModal({ isOpen, onClose, onSelect }: BlockPickerModalProps) {
    return (
        <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <BaselModalHeader
                title="Add Block"
                icon="fa-layer-plus"
                iconColor="primary"
                onClose={onClose}
            />
            <BaselModalBody>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BLOCK_OPTIONS.map((opt) => (
                        <button
                            key={opt.type}
                            type="button"
                            onClick={() => onSelect(opt.type)}
                            className="flex flex-col items-center gap-2 p-4 border border-base-300 bg-base-100 hover:border-primary hover:bg-primary/5 transition-all group text-center"
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-content transition-all">
                                <i className={`fa-duotone fa-regular ${opt.icon} text-lg`}></i>
                            </div>
                            <div>
                                <div className="text-sm font-semibold">{opt.label}</div>
                                <div className="text-xs text-base-content/50 mt-0.5">{opt.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </BaselModalBody>
        </BaselModal>
    );
}
