import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getContentPagesByType, getContentTags } from "@/lib/content";
import type { ContentPageType } from "@splits-network/shared-types";

export const revalidate = 300;

const VALID_TYPES = ['blog', 'article', 'help', 'partner', 'press', 'legal', 'page'] as const;

const TYPE_LABELS: Record<string, string> = {
    blog: 'Blog',
    article: 'Articles',
    help: 'Help Center',
    partner: 'Partner Spotlights',
    press: 'Press Releases',
    legal: 'Legal',
    page: 'Pages',
};

interface PageProps {
    params: Promise<{ type: string }>;
    searchParams: Promise<{ tag?: string; page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { type } = await params;
    if (!VALID_TYPES.includes(type as any)) return {};
    const label = TYPE_LABELS[type] || type;
    return {
        title: `${label} | Splits Network`,
        description: `Browse ${label.toLowerCase()} from Splits Network.`,
    };
}

export default async function CmsTypePage({ params, searchParams }: PageProps) {
    const { type } = await params;
    if (!VALID_TYPES.includes(type as any)) notFound();

    const { tag, page: pageParam } = await searchParams;
    const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

    const [{ data: pages, pagination }, tags] = await Promise.all([
        getContentPagesByType(type as ContentPageType, { tag, page: currentPage, limit: 12 }),
        getContentTags(),
    ]);

    const label = TYPE_LABELS[type] || type;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold mb-2">{label}</h1>
            <p className="text-base-content/60 mb-8">
                Browse {label.toLowerCase()} from Splits Network.
            </p>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                    <Link href={`/cms/${type}`} className={`badge badge-lg ${!tag ? 'badge-primary' : 'badge-ghost'}`}>
                        All
                    </Link>
                    {tags.map((t) => (
                        <Link key={t.id} href={`/cms/${type}?tag=${t.slug}`} className={`badge badge-lg ${tag === t.slug ? 'badge-primary' : 'badge-ghost'}`}>
                            {t.name}
                        </Link>
                    ))}
                </div>
            )}

            {pages.length === 0 ? (
                <p className="text-base-content/50 text-center py-12">No {label.toLowerCase()} found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pages.map((page) => (
                        <Link key={page.id} href={`/cms/${type}/${page.slug}`} className="card bg-base-100 border border-base-300 hover:border-primary transition-colors">
                            <div className="card-body">
                                <h2 className="card-title text-lg">{page.title}</h2>
                                {page.description && <p className="text-sm text-base-content/60 line-clamp-3">{page.description}</p>}
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {page.tags?.map((t) => <span key={t.id} className="badge badge-sm badge-ghost">{t.name}</span>)}
                                </div>
                                {page.published_at && (
                                    <p className="text-sm text-base-content/40 mt-2" suppressHydrationWarning>
                                        {new Date(page.published_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {pagination.total_pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
                        <Link key={p} href={`/cms/${type}?${new URLSearchParams({ ...(tag ? { tag } : {}), page: String(p) })}`} className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-ghost'}`}>
                            {p}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
