"use client";

import { lazy, Suspense } from "react";
import type { ContentBlock, ContentBlockType } from "@splits-network/shared-types";
import {
    BaselModal,
    BaselModalHeader,
} from "@splits-network/basel-ui";

// Lazy-load all block forms to keep the initial bundle lean
const HeroBlockForm = lazy(() => import("../block-forms/hero-block-form").then((m) => ({ default: m.HeroBlockForm })));
const FullBleedImageBlockForm = lazy(() => import("../block-forms/full-bleed-image-block-form").then((m) => ({ default: m.FullBleedImageBlockForm })));
const ArticleBodyBlockForm = lazy(() => import("../block-forms/article-body-block-form").then((m) => ({ default: m.ArticleBodyBlockForm })));
const SplitEditorialBlockForm = lazy(() => import("../block-forms/split-editorial-block-form").then((m) => ({ default: m.SplitEditorialBlockForm })));
const PullQuoteBlockForm = lazy(() => import("../block-forms/pull-quote-block-form").then((m) => ({ default: m.PullQuoteBlockForm })));
const StatsBarBlockForm = lazy(() => import("../block-forms/stats-bar-block-form").then((m) => ({ default: m.StatsBarBlockForm })));
const InlineImageBlockForm = lazy(() => import("../block-forms/inline-image-block-form").then((m) => ({ default: m.InlineImageBlockForm })));
const CtaBlockForm = lazy(() => import("../block-forms/cta-block-form").then((m) => ({ default: m.CtaBlockForm })));
const FeatureGridBlockForm = lazy(() => import("../block-forms/feature-grid-block-form").then((m) => ({ default: m.FeatureGridBlockForm })));
const TimelineBlockForm = lazy(() => import("../block-forms/timeline-block-form").then((m) => ({ default: m.TimelineBlockForm })));
const FaqBlockForm = lazy(() => import("../block-forms/faq-block-form").then((m) => ({ default: m.FaqBlockForm })));
const BenefitsCardsBlockForm = lazy(() => import("../block-forms/benefits-cards-block-form").then((m) => ({ default: m.BenefitsCardsBlockForm })));

const BLOCK_LABELS: Record<ContentBlockType, { icon: string; label: string }> = {
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

interface BlockFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    blockType: ContentBlockType;
    block: ContentBlock | null;
    onSave: (block: ContentBlock) => void;
}

export function BlockFormModal({ isOpen, onClose, blockType, block, onSave }: BlockFormModalProps) {
    const meta = BLOCK_LABELS[blockType] || { icon: "fa-cube", label: blockType };
    const isEditing = block !== null;

    function renderForm() {
        const props = { block: block as any, onSave: onSave as any };

        switch (blockType) {
            case "hero": return <HeroBlockForm {...props} />;
            case "full-bleed-image": return <FullBleedImageBlockForm {...props} />;
            case "article-body": return <ArticleBodyBlockForm {...props} />;
            case "split-editorial": return <SplitEditorialBlockForm {...props} />;
            case "pull-quote": return <PullQuoteBlockForm {...props} />;
            case "stats-bar": return <StatsBarBlockForm {...props} />;
            case "inline-image": return <InlineImageBlockForm {...props} />;
            case "cta": return <CtaBlockForm {...props} />;
            case "feature-grid": return <FeatureGridBlockForm {...props} />;
            case "timeline": return <TimelineBlockForm {...props} />;
            case "faq": return <FaqBlockForm {...props} />;
            case "benefits-cards": return <BenefitsCardsBlockForm {...props} />;
            default: return <p className="text-error">Unknown block type: {blockType}</p>;
        }
    }

    return (
        <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <BaselModalHeader
                title={`${isEditing ? "Edit" : "Add"} ${meta.label}`}
                icon={meta.icon}
                iconColor="primary"
                onClose={onClose}
            />
            <div className="p-6 overflow-y-auto max-h-[70vh]">
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center py-12">
                            <span className="loading loading-spinner loading-md text-primary"></span>
                        </div>
                    }
                >
                    {renderForm()}
                </Suspense>
            </div>
        </BaselModal>
    );
}
