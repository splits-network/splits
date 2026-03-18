"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useVirtualizer } from "@tanstack/react-virtual";

/* ── Types ────────────────────────────────────────────────────── */

export interface BaselSplitViewProps<T> {
    /** Array of items to display in the list panel */
    items: T[];
    /** Currently selected item ID (null = nothing selected) */
    selectedId: string | null;
    /** Extract a unique ID from an item */
    getItemId: (item: T) => string;
    /** Estimated height of each list item in px (for virtual scrolling) */
    estimatedItemHeight?: number;
    /** Render a single list item */
    renderItem: (item: T, isSelected: boolean) => ReactNode;
    /** Render the detail panel for the selected item */
    renderDetail: (item: T) => ReactNode;
    /** Custom empty state when nothing is selected */
    renderEmpty?: () => ReactNode;
    /** FontAwesome icon class for default empty state */
    emptyIcon?: string;
    /** Title for default empty state */
    emptyTitle?: string;
    /** Description for default empty state */
    emptyDescription?: string;
    /** Optional header inside the list panel (search, filters) */
    listHeader?: ReactNode;
    /** Optional footer pinned at bottom of list panel (pagination) */
    listFooter?: ReactNode;
    /** Additional class on the outer container */
    className?: string;
    /** Called when the user closes the mobile detail overlay */
    onMobileClose?: () => void;
}

/* ── Component ────────────────────────────────────────────────── */

export function BaselSplitView<T>({
    items,
    selectedId,
    getItemId,
    estimatedItemHeight = 100,
    renderItem,
    renderDetail,
    renderEmpty,
    emptyIcon = "fa-hand-pointer",
    emptyTitle = "Select an item",
    emptyDescription = "Click an item on the left to view details",
    listHeader,
    listFooter,
    className,
    onMobileClose,
}: BaselSplitViewProps<T>) {
    const selectedItem =
        items.find((item) => getItemId(item) === selectedId) ?? null;

    /* ── Virtual scrolling ────────────────────────────────────── */

    const listScrollRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => listScrollRef.current,
        estimateSize: () => estimatedItemHeight,
        overscan: 5,
    });

    /* ── Mobile overlay ───────────────────────────────────────── */

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const mobileOverlay =
        selectedItem && mounted
            ? createPortal(
                  <div className="fixed inset-0 z-50 flex flex-col bg-base-100 md:hidden">
                      <div className="border-b-2 border-base-300 px-4 py-2 flex items-center">
                          <button
                              onClick={onMobileClose}
                              className="btn btn-sm btn-ghost gap-1"
                              style={{ borderRadius: 0 }}
                          >
                              <i className="fa-duotone fa-regular fa-arrow-left" />
                              Back
                          </button>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                          {renderDetail(selectedItem)}
                      </div>
                  </div>,
                  document.body,
              )
            : null;

    /* ── Empty state ──────────────────────────────────────────── */

    const emptyState = renderEmpty ? (
        renderEmpty()
    ) : (
        <div className="h-full flex items-center justify-center p-12">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 flex items-center justify-center">
                    <i
                        className={`fa-duotone fa-regular ${emptyIcon} text-2xl text-primary`}
                    />
                </div>
                <h3 className="font-black text-xl tracking-tight mb-2">
                    {emptyTitle}
                </h3>
                <p className="text-sm text-base-content/50">
                    {emptyDescription}
                </p>
            </div>
        </div>
    );

    /* ── Render ────────────────────────────────────────────────── */

    return (
        <>
            {mobileOverlay}

            <div
                className={`flex h-full min-h-0 overflow-hidden border-2 border-base-300 ${className ?? ""}`}
            >
                {/* ── List panel: full-width mobile, 1/3 desktop ── */}
                <div className="flex w-full md:w-1/3 flex-col overflow-hidden flex-shrink-0 md:border-r-2 md:border-base-300">
                    {listHeader && (
                        <div className="border-b border-base-300 flex-shrink-0">
                            {listHeader}
                        </div>
                    )}

                    <div ref={listScrollRef} className="flex-1 overflow-y-auto">
                        <div
                            style={{
                                height: virtualizer.getTotalSize(),
                                width: "100%",
                                position: "relative",
                            }}
                        >
                            {virtualizer.getVirtualItems().map((vRow) => {
                                const item = items[vRow.index];
                                const id = getItemId(item);
                                return (
                                    <div
                                        key={id}
                                        data-index={vRow.index}
                                        ref={virtualizer.measureElement}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            transform: `translateY(${vRow.start}px)`,
                                        }}
                                    >
                                        {renderItem(item, selectedId === id)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {listFooter && (
                        <div className="border-t border-base-300 flex-shrink-0">
                            {listFooter}
                        </div>
                    )}
                </div>

                {/* ── Detail panel: hidden mobile, 2/3 desktop ── */}
                <div className="hidden md:flex flex-col flex-1 min-w-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto bg-base-100">
                        {selectedItem ? renderDetail(selectedItem) : emptyState}
                    </div>
                </div>
            </div>
        </>
    );
}
