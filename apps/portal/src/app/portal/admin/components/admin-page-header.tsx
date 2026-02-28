"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface Breadcrumb {
    label: string;
    href?: string;
}

interface AdminPageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: Breadcrumb[];
    actions?: ReactNode;
    badge?: ReactNode;
}

export function AdminPageHeader({
    title,
    subtitle,
    breadcrumbs,
    actions,
    badge,
}: AdminPageHeaderProps) {
    return (
        <div className="mb-6">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="text-sm breadcrumbs mb-2">
                    <ul>
                        <li>
                            <Link
                                href="/portal/admin"
                                className="text-base-content/60 hover:text-primary"
                            >
                                <i className="fa-duotone fa-regular fa-gauge-high mr-1.5"></i>
                                Admin
                            </Link>
                        </li>
                        {breadcrumbs.map((crumb, index) => (
                            <li key={index}>
                                {crumb.href ? (
                                    <Link
                                        href={crumb.href}
                                        className="text-base-content/60 hover:text-primary"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-base-content">{crumb.label}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
                        {badge}
                    </div>
                    {subtitle && (
                        <p className="text-base-content/70 mt-1">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
