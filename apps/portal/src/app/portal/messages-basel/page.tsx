"use client";

/**
 * Basel Messages Page — matches showcase/messages/one design.
 * Route: /portal/messages-basel
 *
 * Structure: Editorial header -> split-screen (with inline search/filters) -> footer accent.
 * DaisyUI semantic tokens only. No Memphis. No shared-ui imports.
 */

import { ErrorState } from "@/hooks/use-standard-list";
import { FilterProvider, useFilter } from "@/app/portal/messages/contexts/filter-context";
import { BaselAnimator } from "./basel-animator";
import { HeaderSection } from "@/components/basel/messages/header-section";
import SplitView from "@/components/basel/messages/split-view";

export default function MessagesBaselPage() {
    return (
        <FilterProvider>
            <MessagesBaselContent />
        </FilterProvider>
    );
}

function MessagesBaselContent() {
    const {
        data,
        error,
        refresh,
        requestCount,
    } = useFilter();

    const stats = {
        totalConversations: data.length,
        unreadMessages: data.reduce(
            (sum, row) => sum + (row.participant?.unread_count || 0),
            0,
        ),
        pendingRequests: requestCount,
        archivedConversations: data.filter((row) => !!row.participant.archived_at)
            .length,
    };

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <BaselAnimator>
            <HeaderSection stats={stats} />

            <section className="bg-base-100">
                <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
                    <div className="listings-content opacity-0">
                        <SplitView />
                    </div>
                </div>
            </section>

            {/* ═══ Footer Accent — Editorial style (from showcase) ═══ */}
            <section className="bg-neutral text-neutral-content py-8">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-comments text-primary-content" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">
                                    Splits Network Messaging
                                </p>
                                <p className="text-xs opacity-50">
                                    Secure, real-time communication across the
                                    entire recruiting ecosystem
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 text-xs opacity-50">
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-lock" />
                                End-to-end encrypted
                            </span>
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-bolt" />
                                Real-time delivery
                            </span>
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-shield-check" />
                                GDPR compliant
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </BaselAnimator>
    );
}
