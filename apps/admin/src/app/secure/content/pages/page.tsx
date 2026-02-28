'use client';

import { useRouter } from 'next/navigation';
import { AdminDataTable, AdminPageHeader, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';

type ContentPage = {
    id: string;
    title: string;
    slug: string;
    status: 'published' | 'draft' | 'archived';
    author?: string;
    updated_at: string;
};

const STATUS_BADGE: Record<string, string> = {
    published: 'badge-success',
    draft: 'badge-warning',
    archived: 'badge-ghost',
};

const COLUMNS: Column<ContentPage>[] = [
    {
        key: 'title',
        label: 'Title',
        sortable: true,
        render: (p) => <span className="text-sm font-medium">{p.title}</span>,
    },
    {
        key: 'slug',
        label: 'Slug',
        render: (p) => <span className="font-mono text-sm text-base-content/60">{p.slug}</span>,
    },
    {
        key: 'status',
        label: 'Status',
        render: (p) => (
            <span className={`badge badge-sm capitalize ${STATUS_BADGE[p.status] ?? 'badge-ghost'}`}>
                {p.status}
            </span>
        ),
    },
    {
        key: 'author',
        label: 'Author',
        render: (p) => <span className="text-sm text-base-content/70">{p.author ?? '—'}</span>,
    },
    {
        key: 'updated_at',
        label: 'Updated',
        sortable: true,
        render: (p) => (
            <span className="text-sm text-base-content/60">
                {new Date(p.updated_at).toLocaleDateString()}
            </span>
        ),
    },
];

export default function ContentPagesPage() {
    const router = useRouter();
    const { data, loading, page, totalPages, setPage, sortBy, sortOrder, handleSort } =
        useStandardList<ContentPage>({
            endpoint: '/content/admin/pages',
            defaultFilters: {},
            defaultLimit: 25,
        });

    return (
        <div>
            <AdminPageHeader
                title="Content Pages"
                subtitle="Manage CMS content pages"
            />

            <div className="card bg-base-100 border border-base-200">
                <AdminDataTable
                    columns={COLUMNS}
                    data={data}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                    onRowClick={(p) => router.push(`/secure/content/pages/${p.id}`)}
                    emptyTitle="No content pages"
                    emptyDescription="No content pages have been created yet."
                />
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="join">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
