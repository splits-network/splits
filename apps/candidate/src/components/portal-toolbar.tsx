"use client";

import { usePageTitle } from "@/contexts/page-title-context";

export function PortalToolbar() {
    const { title, subtitle, children: titleChildren } = usePageTitle();

    if (!title && !titleChildren) return null;

    return (
        <div className="sticky top-[68px] z-40">
            <div className="flex flex-wrap items-center gap-3 px-6 py-2 border-b border-base-300 bg-base-100">
                {/* Title on the left */}
                {title && (
                    <div className="flex flex-col gap-0 mr-auto min-w-0">
                        <h1 className="text-lg font-semibold truncate">
                            {title}
                        </h1>
                        {subtitle && (
                            <span className="text-xs text-base-content/60 truncate">
                                {subtitle}
                            </span>
                        )}
                    </div>
                )}

                {/* Toolbar children on the right */}
                {titleChildren && (
                    <div className="flex flex-wrap items-center gap-2">
                        {titleChildren}
                    </div>
                )}
            </div>
        </div>
    );
}
