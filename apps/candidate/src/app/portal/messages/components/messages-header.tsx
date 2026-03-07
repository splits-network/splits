"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

interface MessagesHeaderProps {
    conversationCount: number;
    unreadCount: number;
}

export function MessagesHeader({
    conversationCount,
    unreadCount,
}: MessagesHeaderProps) {
    const headerRef = useRef<HTMLElement>(null);
    useScrollReveal(headerRef);

    return (
        <section
            ref={headerRef}
            className="relative bg-neutral text-neutral-content py-16 lg:py-20"
        >
            <div
                className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                style={{
                    clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                }}
            />
            <div className="relative container mx-auto px-6 lg:px-12">
                <div className="max-w-4xl">
                    <p className="scroll-reveal fade-up text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                        Communications Hub
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="scroll-reveal fade-up inline-block">
                            Your
                        </span>{" "}
                        <span className="scroll-reveal fade-up inline-block text-primary">
                            messages.
                        </span>
                    </h1>

                    <div className="scroll-reveal fade-up flex flex-wrap gap-8 mt-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-envelope text-primary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {conversationCount}
                                </div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Conversations
                                </div>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-accent flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-bell text-accent-content" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black">
                                        {unreadCount}
                                    </div>
                                    <div className="text-xs uppercase tracking-wider opacity-60">
                                        Unread
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
