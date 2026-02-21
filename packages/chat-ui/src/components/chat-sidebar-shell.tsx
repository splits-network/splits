"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useChatSidebar } from "../context/chat-sidebar-context";
import { ChatSidebarHeader } from "./chat-sidebar-header";
import { ChatSidebarList } from "./chat-sidebar-list";
import { ChatSidebarThread } from "./chat-sidebar-thread";

export interface ChatSidebarShellProps {
    /** Render prop for the thread panel — each app provides its own ThreadPanel */
    threadRenderer: (conversationId: string) => ReactNode;
    /** Path to the full messages page (for "Open Full" link) */
    messagesPagePath?: string;
    /** Current user ID for conversation list */
    currentUserId: string | null;
}

const SIDEBAR_WIDTH = 420;
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return isMobile;
}

export function ChatSidebarShell({
    threadRenderer,
    messagesPagePath = "/portal/messages",
    currentUserId,
}: ChatSidebarShellProps) {
    const { isOpen, isMinimized, view, activeConversationId, close } = useChatSidebar();

    const isMobile = useIsMobile();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Escape key to close
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, close]);

    // GSAP animation for desktop sidebar
    useGSAP(
        () => {
            if (isMobile || !sidebarRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                sidebarRef.current.style.width = isOpen
                    ? `${SIDEBAR_WIDTH}px`
                    : "0px";
                sidebarRef.current.style.opacity = isOpen ? "1" : "0";
                return;
            }

            if (isOpen) {
                gsap.fromTo(
                    sidebarRef.current,
                    { width: 0, opacity: 0 },
                    {
                        width: SIDEBAR_WIDTH,
                        opacity: 1,
                        duration: 0.35,
                        ease: "power3.out",
                    },
                );
            } else {
                gsap.to(sidebarRef.current, {
                    width: 0,
                    opacity: 0,
                    duration: 0.25,
                    ease: "power3.in",
                });
            }
        },
        { dependencies: [isOpen, isMobile], scope: sidebarRef },
    );

    // GSAP animation for mobile overlay
    useGSAP(
        () => {
            if (!isMobile || !overlayRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                overlayRef.current.style.transform = isOpen
                    ? "translateX(0)"
                    : "translateX(100%)";
                return;
            }

            if (isOpen) {
                gsap.fromTo(
                    overlayRef.current,
                    { x: "100%" },
                    { x: "0%", duration: 0.3, ease: "power3.out" },
                );
            } else {
                gsap.to(overlayRef.current, {
                    x: "100%",
                    duration: 0.2,
                    ease: "power3.in",
                });
            }
        },
        { dependencies: [isOpen, isMobile], scope: overlayRef },
    );

    const sidebarContent = (
        <div className="flex flex-col h-full bg-base-100 border-l-4 border-primary">
            <ChatSidebarHeader messagesPagePath={messagesPagePath} />
            {!isMinimized && (
                <div className="flex-1 min-h-0 overflow-hidden">
                    {view === "list" && (
                        <ChatSidebarList currentUserId={currentUserId} />
                    )}
                    {view === "thread" && activeConversationId && (
                        <ChatSidebarThread
                            conversationId={activeConversationId}
                            messagesPagePath={messagesPagePath}
                        >
                            {threadRenderer(activeConversationId)}
                        </ChatSidebarThread>
                    )}
                </div>
            )}
        </div>
    );

    // Mobile: portal to body as fullscreen overlay
    if (isMobile && mounted) {
        return createPortal(
            <div
                ref={overlayRef}
                className="fixed inset-0 z-[999] bg-base-100"
                style={{ transform: isOpen ? undefined : "translateX(100%)" }}
            >
                {sidebarContent}
            </div>,
            document.body,
        );
    }

    // Desktop: fixed panel pinned to the right edge of the viewport
    return (
        <div
            ref={sidebarRef}
            className={`fixed bottom-0 right-0 z-[998] overflow-hidden shadow-md hidden md:block ${
                isMinimized ? "" : "h-screen"
            }`}
            style={{
                width: isOpen ? SIDEBAR_WIDTH : 0,
                opacity: isOpen ? 1 : 0,
            }}
        >
            <div className={isMinimized ? "" : "h-full"} style={{ width: SIDEBAR_WIDTH }}>
                {isOpen && sidebarContent}
            </div>
        </div>
    );
}
