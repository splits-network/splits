'use client';

import { UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@splits-network/basel-ui';
import { Breadcrumbs } from './breadcrumbs';

type AdminHeaderProps = {
    onMobileMenuToggle: () => void;
};

export function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-4 bg-base-200 border-b border-base-300 px-4">
            {/* Mobile hamburger */}
            <button
                type="button"
                onClick={onMobileMenuToggle}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-base-300 transition-colors"
                aria-label="Open menu"
            >
                <i className="fa-duotone fa-regular fa-bars text-base-content/60" />
            </button>

            {/* Branding */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <i className="fa-duotone fa-regular fa-shield-halved text-primary" />
                <span className="font-black text-sm tracking-tight hidden sm:block">Splits Admin</span>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-base-300" />

            {/* Breadcrumbs */}
            <div className="flex-1 min-w-0">
                <Breadcrumbs />
            </div>

            {/* Theme toggle */}
            <ThemeToggle size="sm" />

            {/* User button */}
            <div className="flex-shrink-0">
                <UserButton />
            </div>
        </header>
    );
}
