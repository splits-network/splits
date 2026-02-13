"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ShortcutItem {
    href: string;
    label: string;
    shortcut: string; // Single key letter, e.g. "R"
}

/**
 * Global keyboard shortcut handler for portal navigation.
 * - Alt+<key> navigates to the matching route
 * - Bare "?" key (outside inputs) toggles the help overlay
 */
export function useKeyboardShortcuts(
    items: ShortcutItem[],
    onHelpToggle: () => void,
) {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();
            const isEditable =
                tagName === "input" ||
                tagName === "textarea" ||
                tagName === "select" ||
                target.isContentEditable;

            // Bare "?" key — toggle help overlay (only outside inputs)
            if (
                e.key === "?" &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.altKey &&
                !isEditable
            ) {
                e.preventDefault();
                onHelpToggle();
                return;
            }

            // Alt+<key> — navigate
            if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                const pressedKey = e.key.toUpperCase();
                const match = items.find((item) => item.shortcut === pressedKey);
                if (match) {
                    e.preventDefault();
                    router.push(match.href);
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [items, onHelpToggle, router]);
}
