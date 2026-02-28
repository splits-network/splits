'use client';

import { usePathname } from 'next/navigation';
import type { NavSection } from './nav-config';
import type { AdminCounts } from '@/hooks/use-realtime-counts';
import { SidebarItem } from './sidebar-item';

type SidebarSectionProps = {
    section: NavSection;
    isOpen: boolean;
    onToggle: () => void;
    counts: AdminCounts;
    isCollapsed: boolean;
    filterText: string;
};

export function SidebarSection({
    section,
    isOpen,
    onToggle,
    counts,
    isCollapsed,
    filterText,
}: SidebarSectionProps) {
    const pathname = usePathname();

    const filteredItems = filterText
        ? section.items.filter(
              (item) =>
                  item.label.toLowerCase().includes(filterText.toLowerCase()) ||
                  item.keywords?.some((k) => k.toLowerCase().includes(filterText.toLowerCase())),
          )
        : section.items;

    if (filterText && filteredItems.length === 0) return null;

    const sectionBadgeCount = section.items.reduce((sum, item) => {
        return sum + (item.badgeKey ? counts[item.badgeKey] : 0);
    }, 0);

    const isActiveSection = section.items.some(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );

    if (isCollapsed) {
        return (
            <div className="flex flex-col items-center py-1">
                <div
                    className="tooltip tooltip-right"
                    data-tip={section.title}
                >
                    <div className="relative p-2">
                        <i
                            className={`fa-duotone fa-regular ${section.icon} text-base ${isActiveSection ? 'text-primary' : 'text-base-content/40'}`}
                        />
                        {sectionBadgeCount > 0 && (
                            <span className="absolute top-0 right-0 badge badge-warning badge-xs" />
                        )}
                    </div>
                </div>
                <div className="divider my-0 mx-2" />
            </div>
        );
    }

    return (
        <div className="mb-1">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/40 hover:text-base-content/60 transition-colors"
            >
                <i className={`fa-duotone fa-regular ${section.icon} text-xs`} />
                <span className="flex-1 text-left">{section.title}</span>
                {sectionBadgeCount > 0 && (
                    <span className="badge badge-warning badge-xs font-mono">
                        {sectionBadgeCount > 99 ? '99+' : sectionBadgeCount}
                    </span>
                )}
                <i
                    className={`fa-duotone fa-regular fa-chevron-down text-xs transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
                />
            </button>

            <div
                className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="flex flex-col gap-0.5 pb-1">
                    {filteredItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            item={item}
                            counts={counts}
                            isCollapsed={false}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
