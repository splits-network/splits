'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRealtimeCounts } from '@/hooks/use-realtime-counts';
import { NAV_SECTIONS } from './nav-config';
import { SidebarSection } from './sidebar-section';
import { SidebarSearch } from './sidebar-search';

const COLLAPSED_KEY = 'admin-sidebar-collapsed';
const SECTIONS_KEY = 'admin-sidebar-sections';

function getInitialCollapsed(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
}

function getInitialOpenSections(pathname: string): Record<string, boolean> {
    if (typeof window === 'undefined') {
        return Object.fromEntries(NAV_SECTIONS.map((s) => [s.id, true]));
    }
    try {
        const stored = localStorage.getItem(SECTIONS_KEY);
        if (stored) return JSON.parse(stored) as Record<string, boolean>;
    } catch {
        // fallback below
    }
    // Auto-open section containing active route
    const result: Record<string, boolean> = {};
    for (const section of NAV_SECTIONS) {
        result[section.id] = section.items.some(
            (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
        );
    }
    return result;
}

export function AdminSidebar() {
    const pathname = usePathname();
    const { counts } = useRealtimeCounts();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const [filterText, setFilterText] = useState('');
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage after mount
    useEffect(() => {
        setIsCollapsed(getInitialCollapsed());
        setOpenSections(getInitialOpenSections(pathname));
        setHydrated(true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-expand section for active route when pathname changes
    useEffect(() => {
        if (!hydrated) return;
        const activeSection = NAV_SECTIONS.find((s) =>
            s.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)),
        );
        if (activeSection && !openSections[activeSection.id]) {
            setOpenSections((prev) => {
                const next = { ...prev, [activeSection.id]: true };
                localStorage.setItem(SECTIONS_KEY, JSON.stringify(next));
                return next;
            });
        }
    }, [pathname, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

    function toggleCollapsed() {
        setIsCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(COLLAPSED_KEY, String(next));
            return next;
        });
    }

    function toggleSection(id: string) {
        setOpenSections((prev) => {
            const next = { ...prev, [id]: !prev[id] };
            localStorage.setItem(SECTIONS_KEY, JSON.stringify(next));
            return next;
        });
    }

    return (
        <aside
            className={[
                'relative flex flex-col bg-base-100 border-r border-base-300 h-full transition-all duration-300 flex-shrink-0',
                isCollapsed ? 'w-16' : 'w-60',
            ].join(' ')}
        >
            {/* Collapse toggle button */}
            <button
                type="button"
                onClick={toggleCollapsed}
                className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-base-300 border border-base-200 shadow-sm hover:bg-base-200 transition-colors"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <i
                    className={`fa-duotone fa-regular fa-chevron-left text-xs text-base-content/60 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Search */}
            <div className={`pt-4 ${isCollapsed ? 'px-3' : 'px-3'}`}>
                <SidebarSearch
                    value={filterText}
                    onChange={setFilterText}
                    isCollapsed={isCollapsed}
                    onExpandSidebar={() => {
                        if (isCollapsed) {
                            setIsCollapsed(false);
                            localStorage.setItem(COLLAPSED_KEY, 'false');
                        }
                    }}
                />
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2">
                {NAV_SECTIONS.map((section) => (
                    <SidebarSection
                        key={section.id}
                        section={section}
                        isOpen={openSections[section.id] ?? true}
                        onToggle={() => toggleSection(section.id)}
                        counts={counts}
                        isCollapsed={isCollapsed}
                        filterText={filterText}
                    />
                ))}
            </nav>
        </aside>
    );
}
