import Link from "next/link";

export type DocBreadcrumb = {
    label: string;
    href?: string;
};

export function DocPageHeader({
    title,
    description,
    roles,
    breadcrumbs,
    lastUpdated,
}: {
    title: string;
    description: string;
    roles: string[];
    breadcrumbs: DocBreadcrumb[];
    lastUpdated: string;
}) {
    return (
        <header className="space-y-4">
            <nav className="text-sm breadcrumbs">
                <ul>
                    {breadcrumbs.map((crumb, index) => (
                        <li key={`${crumb.label}-${index}`}>
                            {crumb.href ? (
                                <Link href={crumb.href}>{crumb.label}</Link>
                            ) : (
                                <span>{crumb.label}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-semibold text-base-content">
                    {title}
                </h1>
                <p className="text-base text-base-content/70 max-w-3xl">
                    {description}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    {roles.map((role) => (
                        <span
                            key={role}
                            className="badge badge-outline badge-sm"
                        >
                            {role}
                        </span>
                    ))}
                    <span className="text-xs text-base-content/50">
                        Last updated {lastUpdated}
                    </span>
                </div>
            </div>
        </header>
    );
}
