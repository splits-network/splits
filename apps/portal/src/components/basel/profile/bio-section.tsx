"use client";

import { useMarketplaceSettings } from "./marketplace-context";
import { BaselStatusPill } from "@splits-network/basel-ui";
import { MarkdownEditor } from "@splits-network/shared-ui";

export function BioSection() {
    const { settings, updateBioRich, loading } = useMarketplaceSettings();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black tracking-tight mb-1">
                        Bio & Content
                    </h2>
                    <p className="text-base text-base-content/50">
                        Share your story, achievements, and what makes you
                        unique. Supports Markdown formatting.
                    </p>
                </div>
                <BaselStatusPill color="accent">
                    <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                    Boost +10%
                </BaselStatusPill>
            </div>

            <div className="bg-base-200 border border-base-300 border-l-4 border-l-accent p-6 mb-6">
                <p className="text-sm font-semibold text-base-content/60 mb-1">
                    Writing tips
                </p>
                <p className="text-sm text-base-content/40">
                    Use <strong>bold</strong>, <em>italic</em>, and bullet
                    points to make your bio engaging. A detailed bio can
                    increase your profile visibility by 10%.
                </p>
            </div>

            <MarkdownEditor
                label="Your Story"
                showCount
                value={settings.marketplace_profile?.bio_rich || ""}
                onChange={updateBioRich}
                placeholder={`Tell candidates about yourself...\n\nExample:\n- **15+ years** in tech recruitment\n- Specialized in C-level placements\n- Former software engineer, understands technical roles deeply\n- Track record: 50+ successful placements at top startups`}
                helperText="This will appear prominently on your marketplace profile."
                height={300}
            />
        </div>
    );
}
