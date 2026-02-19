"use client";

/**
 * Basel editorial header for messages — based on showcase/messages/one.
 * Diagonal clip-path accent, large display heading, stat bar with
 * DaisyUI semantic tokens. No Memphis shapes or named colors.
 */

interface HeaderSectionProps {
    stats: {
        totalConversations: number;
        unreadMessages: number;
        pendingRequests: number;
        archivedConversations: number;
    };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    return (
        <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
            {/* Diagonal accent bar */}
            <div
                className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                style={{
                    clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                }}
            />

            <div className="relative z-10 container mx-auto px-6 lg:px-12">
                <div className="max-w-4xl">
                    <p className="header-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                        Communications Hub
                    </p>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="header-word inline-block opacity-0">
                            Your
                        </span>{" "}
                        <span className="header-word inline-block opacity-0 text-primary">
                            messages.
                        </span>{" "}
                        <br className="hidden md:block" />
                        <span className="header-word inline-block opacity-0">
                            All in
                        </span>{" "}
                        <span className="header-word inline-block opacity-0">
                            one place.
                        </span>
                    </h1>

                    {/* Stat bar */}
                    <div className="header-stat-bar flex flex-wrap gap-8 mt-8 opacity-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-envelope text-primary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {stats.totalConversations}
                                </div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Conversations
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-bell text-accent-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {stats.unreadMessages}
                                </div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Unread
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-hourglass-half text-secondary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {stats.pendingRequests}
                                </div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Requests
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-base-300 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-box-archive text-base-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {stats.archivedConversations}
                                </div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Archived
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
