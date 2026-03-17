"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
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
    /** Initial list panel width as percentage (default: 33) */
    initialListWidth?: number;
    /** Minimum list panel width as percentage (default: 20) */
    minListWidth?: number;
    /** Maximum list panel width as percentage (default: 50) */
    maxListWidth?: number;
    /** Responsive breakpoint for showing both panels (default: "md") */
    mobileBreakpoint?: "md" | "lg";
    /** Additional class on the outer container */
    className?: string;
    /** Called when the user closes the mobile detail overlay */
    onMobileClose?: () => void;
}

/* ── Breakpoint pixel values ──────────────────────────────────── */

const BP_PX = { md: 768, lg: 1024 } as const;

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
    initialListWidth = 33,
    minListWidth = 20,
    maxListWidth = 50,
    mobileBreakpoint = "md",
    className,
    onMobileClose,
}: BaselSplitViewProps<T>) {
    const selectedItem =
        items.find((item) => getItemId(item) === selectedId) ?? null;

    /* ── Resizable panel state ────────────────────────────────── */

    const [listWidthPct, setListWidthPct] = useState(initialListWidth);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleDragStart = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            isDragging.current = true;

            const startX =
                "touches" in e ? e.touches[0].clientX : e.clientX;
            const container = containerRef.current;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            const containerWidth = containerRect.width;

            const onMove = (ev: MouseEvent | TouchEvent) => {
                const clientX =
                    "touches" in ev
                        ? ev.touches[0].clientX
                        : (ev as MouseEvent).clientX;
                const relX = clientX - containerRect.left;
                const pct = Math.min(
                    maxListWidth,
                    Math.max(minListWidth, (relX / containerWidth) * 100),
                );
                setListWidthPct(pct);
            };

            const onUp = () => {
                isDragging.current = false;
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
                document.removeEventListener("touchmove", onMove);
                document.removeEventListener("touchend", onUp);
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
            };

            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
            document.addEventListener("touchmove", onMove);
            document.addEventListener("touchend", onUp);
        },
        [maxListWidth, minListWidth],
    );

    /* ── Virtual scrolling ────────────────────────────────────── */

    const listScrollRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => listScrollRef.current,
        estimateSize: () => estimatedItemHeight,
        overscan: 5,
    });

    /* ── Mobile portal ────────────────────────────────────────── */

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const bp = mobileBreakpoint;
    const bpHide = bp === "md" ? "hidden md:flex" : "hidden lg:flex";
    const bpShow = bp === "md" ? "md:hidden" : "lg:hidden";
    const bpBlock = bp === "md" ? "hidden md:block" : "hidden lg:block";
    const bpListHide =
        bp === "md" ? "hidden md:flex" : "hidden lg:flex";

    const mobileOverlay =
        selectedItem && mounted
            ? createPortal(
                  <div
                      className={`fixed inset-0 z-50 flex flex-col bg-base-100 ${bpShow}`}
                  >
                      {/* Back button */}
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
                ref={containerRef}
                className={`flex h-full min-h-0 overflow-hidden border-2 border-base-300 ${className ?? ""}`}
            >
                {/* ── List panel ──────────────────────────────── */}
                <div
                    className={`flex flex-col overflow-hidden ${
                        selectedId ? bpListHide : "flex"
                    }`}
                    style={{ width: `${listWidthPct}%`, flexShrink: 0 }}
                >
                    {/* Optional list header */}
                    {listHeader && (
                        <div className="border-b border-base-300 flex-shrink-0">
                            {listHeader}
                        </div>
                    )}

                    {/* Virtualized list */}
                    <div
                        ref={listScrollRef}
                        className="flex-1 overflow-y-auto"
                    >
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
                                        {renderItem(
                                            item,
                                            selectedId === id,
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Optional list footer (pagination) */}
                    {listFooter && (
                        <div className="border-t border-base-300 flex-shrink-0">
                            {listFooter}
                        </div>
                    )}
                </div>

                {/* ── Resize handle ───────────────────────────── */}
                <div
                    className={`${bpBlock} w-[5px] flex-shrink-0 bg-base-300 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors relative group`}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    role="separator"
                    aria-orientation="vertical"
                    aria-valuenow={Math.round(listWidthPct)}
                    aria-valuemin={minListWidth}
                    aria-valuemax={maxListWidth}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowLeft") {
                            setListWidthPct((w) =>
                                Math.max(minListWidth, w - 1),
                            );
                        } else if (e.key === "ArrowRight") {
                            setListWidthPct((w) =>
                                Math.min(maxListWidth, w + 1),
                            );
                        }
                    }}
                >
                    {/* Visual grip dots */}
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-1 h-1 bg-base-content/30" />
                            <div className="w-1 h-1 bg-base-content/30" />
                            <div className="w-1 h-1 bg-base-content/30" />
                        </div>
                    </div>
                </div>

                {/* ── Detail panel ────────────────────────────── */}
                <div
                    className={`${bpHide} flex-col flex-1 min-w-0 overflow-hidden`}
                >
                    <div className="flex-1 overflow-y-auto bg-base-100">
                        {selectedItem
                            ? renderDetail(selectedItem)
                            : emptyState}
                    </div>
                </div>
            </div>
        </>
    );
}
