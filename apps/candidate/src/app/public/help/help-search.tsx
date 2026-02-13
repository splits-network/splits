"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";

interface HelpSearchFilterProps {
    children: ReactNode;
}

export function HelpSearchFilter({ children }: HelpSearchFilterProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const [noResults, setNoResults] = useState(false);

    const applyFilter = useCallback((query: string) => {
        setSearchQuery(query);

        if (!containerRef.current) return;

        const categories = containerRef.current.querySelectorAll<HTMLElement>(
            "[data-faq-category]",
        );
        const items =
            containerRef.current.querySelectorAll<HTMLElement>(
                "[data-faq-item]",
            );

        const lowerQuery = query.toLowerCase();

        if (!query) {
            // Show everything
            categories.forEach((cat) => (cat.style.display = ""));
            items.forEach((item) => (item.style.display = ""));
            setNoResults(false);
            return;
        }

        let totalVisible = 0;

        categories.forEach((category) => {
            const categoryItems = category.querySelectorAll<HTMLElement>(
                "[data-faq-item]",
            );
            let categoryVisible = 0;

            categoryItems.forEach((item) => {
                const text = item.getAttribute("data-faq-item") || "";
                if (text.toLowerCase().includes(lowerQuery)) {
                    item.style.display = "";
                    categoryVisible++;
                } else {
                    item.style.display = "none";
                }
            });

            category.style.display = categoryVisible > 0 ? "" : "none";
            totalVisible += categoryVisible;
        });

        setNoResults(totalVisible === 0);
    }, []);

    return (
        <div>
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
                <fieldset className="fieldset">
                    <div className="relative">
                        <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50"></i>
                        <input
                            type="text"
                            className="input w-full pl-12 pr-4"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => applyFilter(e.target.value)}
                        />
                    </div>
                </fieldset>
            </div>

            {/* Server-rendered content with client-side filtering */}
            <div ref={containerRef}>{children}</div>

            {/* No Results Message */}
            {noResults && (
                <div className="text-center py-12">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-6xl text-base-content/20 mb-4"></i>
                    <h3 className="text-2xl font-bold mb-2">
                        No results found
                    </h3>
                    <p className="text-base-content/60 mb-6">
                        We couldn&apos;t find any answers matching &quot;{searchQuery}&quot;
                    </p>
                    <button
                        onClick={() => applyFilter("")}
                        className="btn btn-primary"
                    >
                        Clear Search
                    </button>
                </div>
            )}
        </div>
    );
}
