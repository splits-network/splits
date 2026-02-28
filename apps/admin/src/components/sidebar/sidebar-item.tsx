'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from './nav-config';
import type { AdminCounts } from '@/hooks/use-realtime-counts';

type SidebarItemProps = {
    item: NavItem;
    counts: AdminCounts;
    isCollapsed: boolean;
};

export function SidebarItem({ item, counts, isCollapsed }: SidebarItemProps) {
    const pathname = usePathname();
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const badgeCount = item.badgeKey ? counts[item.badgeKey] : 0;

    return (
        <div
            className={isCollapsed ? 'tooltip tooltip-right' : ''}
            data-tip={isCollapsed ? item.label : undefined}
        >
            <Link
                href={item.href}
                className={[
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                    isCollapsed ? 'justify-center px-2' : '',
                    isActive
                        ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary'
                        : 'text-base-content/70 hover:bg-base-200 hover:text-base-content',
                ].join(' ')}
            >
                <i className={`fa-duotone fa-regular ${item.icon} w-4 text-center flex-shrink-0`} />
                {!isCollapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                )}
                {!isCollapsed && badgeCount > 0 && (
                    <span className="badge badge-warning badge-sm font-mono">
                        {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                )}
                {isCollapsed && badgeCount > 0 && (
                    <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 badge badge-warning badge-xs" />
                )}
            </Link>
        </div>
    );
}
