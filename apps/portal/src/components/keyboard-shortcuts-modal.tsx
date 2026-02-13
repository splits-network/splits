"use client";

import { useEffect, useRef } from "react";

interface ShortcutDisplayItem {
    label: string;
    shortcut: string;
    section?: string;
}

interface KeyboardShortcutsModalProps {
    open: boolean;
    onClose: () => void;
    items: ShortcutDisplayItem[];
}

export function KeyboardShortcutsModal({
    open,
    onClose,
    items,
}: KeyboardShortcutsModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    // Group items by section
    const grouped = items.reduce<Record<string, ShortcutDisplayItem[]>>(
        (acc, item) => {
            const section = item.section || "other";
            if (!acc[section]) acc[section] = [];
            acc[section].push(item);
            return acc;
        },
        {},
    );

    const sectionLabels: Record<string, string> = {
        main: "Main",
        management: "Management",
        settings: "Settings",
    };

    const sectionOrder = ["main", "management", "settings"];

    const isMac =
        typeof navigator !== "undefined" &&
        /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
    const modifierLabel = isMac ? "Opt" : "Alt";

    return (
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={onClose}
        >
            <div className="modal-box max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                    Keyboard Shortcuts
                </h3>

                {sectionOrder.map((section) => {
                    const sectionItems = grouped[section];
                    if (!sectionItems?.length) return null;
                    return (
                        <div key={section} className="mb-4">
                            <div className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">
                                {sectionLabels[section] || section}
                            </div>
                            <div className="flex flex-col gap-1">
                                {sectionItems.map((item) => (
                                    <div
                                        key={item.shortcut}
                                        className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-base-200/50"
                                    >
                                        <span className="text-sm text-base-content/80">
                                            {item.label}
                                        </span>
                                        <kbd className="kbd kbd-sm">
                                            {modifierLabel}+{item.shortcut}
                                        </kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Global shortcuts */}
                <div className="mb-2">
                    <div className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">
                        Global
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-base-200/50">
                            <span className="text-sm text-base-content/80">
                                Search
                            </span>
                            <kbd className="kbd kbd-sm">
                                {isMac ? "Cmd" : "Ctrl"}+K
                            </kbd>
                        </div>
                        <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-base-200/50">
                            <span className="text-sm text-base-content/80">
                                Show shortcuts
                            </span>
                            <kbd className="kbd kbd-sm">?</kbd>
                        </div>
                    </div>
                </div>

                <div className="modal-action">
                    <button
                        type="button"
                        className="btn btn-sm"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit">close</button>
            </form>
        </dialog>
    );
}
