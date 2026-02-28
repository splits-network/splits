'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { AdminPageHeader, AdminLoadingState, AdminErrorState } from '@/components/shared';

type ContentPage = {
    id: string;
    title: string;
    slug: string;
    status: 'published' | 'draft' | 'archived';
    author?: string;
    content?: string;
    meta_description?: string;
    updated_at: string;
    created_at: string;
};

const STATUS_BADGE: Record<string, string> = {
    published: 'badge-success',
    draft: 'badge-warning',
    archived: 'badge-ghost',
};

export default function ContentPageDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { getToken } = useAuth();
    const [page, setPage] = useState<ContentPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const token = await getToken();
                const gatewayUrl = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL ?? 'http://admin-gateway:3030';
                const res = await fetch(`${gatewayUrl}/api/v2/content/admin/pages/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Failed to load page: ${res.status}`);
                const json = await res.json();
                setPage(json.data ?? json);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load page');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) return <AdminLoadingState />;
    if (error) return <AdminErrorState message={error} />;
    if (!page) return null;

    return (
        <div>
            <AdminPageHeader
                title={page.title}
                subtitle={`/${page.slug}`}
                actions={
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => router.push('/secure/content/pages')}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left" />
                        Back
                    </button>
                }
            />

            <div className="flex items-center gap-2 mb-6">
                <span className={`badge badge-sm capitalize ${STATUS_BADGE[page.status] ?? 'badge-ghost'}`}>
                    {page.status}
                </span>
                {page.author && (
                    <span className="text-sm text-base-content/60">by {page.author}</span>
                )}
                <span className="text-sm text-base-content/40">
                    Updated {new Date(page.updated_at).toLocaleDateString()}
                </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-base">Content</h2>
                            {page.content ? (
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: page.content }}
                                />
                            ) : (
                                <p className="text-sm text-base-content/50">No content available.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-base">Metadata</h2>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <p className="font-medium text-base-content/60">Slug</p>
                                    <p className="font-mono">{page.slug}</p>
                                </div>
                                {page.meta_description && (
                                    <div>
                                        <p className="font-medium text-base-content/60">Meta Description</p>
                                        <p className="text-base-content/80">{page.meta_description}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-base-content/60">Created</p>
                                    <p>{new Date(page.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
