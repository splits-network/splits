"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { AdminPageHeader, useAdminConfirm } from "../../components";
import { ButtonLoading } from "@splits-network/shared-ui";
import type { ContentPage } from "@splits-network/shared-types";
import { CreatePageModal } from "@/components/basel/admin/pages/create-page-modal";

interface PageFilters {
    app?: string;
    status?: string;
}

function getStatusBadge(status: string) {
    switch (status) {
        case "published":
            return "badge-success";
        case "draft":
            return "badge-warning";
        case "archived":
            return "badge-ghost";
        default:
            return "badge-ghost";
    }
}

function getAppBadge(app: string) {
    switch (app) {
        case "portal":
            return "badge-primary";
        case "candidate":
            return "badge-secondary";
        case "corporate":
            return "badge-accent";
        default:
            return "badge-ghost";
    }
}

export default function ContentPagesAdminPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const confirm = useAdminConfirm();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const defaultFilters = useMemo<PageFilters>(() => ({}), []);

    const {
        items: pages,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<ContentPage, PageFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set("page", String(params.page));
            queryParams.set("limit", String(params.limit));
            if (params.search) queryParams.set("search", params.search);
            if (params.filters?.app) queryParams.set("app", params.filters.app);
            if (params.filters?.status)
                queryParams.set("status", params.filters.status);
            else queryParams.set("status", "all");
            if (params.sort_by) queryParams.set("sort_by", params.sort_by);
            if (params.sort_order)
                queryParams.set("sort_order", params.sort_order);

            return await apiClient.get(`/pages?${queryParams.toString()}`);
        },
        defaultFilters,
        defaultSortBy: "updated_at",
        defaultSortOrder: "desc",
        syncToUrl: true,
    });

    async function deletePage(page: ContentPage) {
        const confirmed = await confirm({
            title: "Delete Page",
            message: `Are you sure you want to delete "${page.title}"? This action can be undone.`,
            confirmText: "Delete",
            type: "warning",
        });
        if (!confirmed) return;

        setDeletingId(page.id);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);
            await apiClient.delete(`/pages/${page.id}`);
            toast.success("Page deleted");
            refresh();
        } catch (err) {
            console.error("Failed to delete page:", err);
            toast.error("Failed to delete page");
        } finally {
            setDeletingId(null);
        }
    }

    const publishedCount = pages.filter((p) => p.status === "published").length;
    const draftCount = pages.filter((p) => p.status === "draft").length;

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Content Pages"
                subtitle="Manage CMS pages published across all apps"
                breadcrumbs={[
                    { label: "Content", href: "/portal/admin/content/pages" },
                    { label: "Pages" },
                ]}
                actions={
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <i className="fa-duotone fa-regular fa-plus mr-1"></i>
                        Create Page
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total</div>
                    <div className="stat-value text-2xl text-primary">
                        {loading ? "..." : pagination.total}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Published</div>
                    <div className="stat-value text-2xl text-success">
                        {loading ? "..." : publishedCount}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Drafts</div>
                    <div className="stat-value text-2xl text-warning">
                        {loading ? "..." : draftCount}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">This Page</div>
                    <div className="stat-value text-2xl text-secondary">
                        {loading ? "..." : pages.length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search pages..."
                />
                <select
                    className="select select-sm"
                    value={filters.app || ""}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            app: e.target.value || undefined,
                        })
                    }
                >
                    <option value="">All Apps</option>
                    <option value="portal">Portal</option>
                    <option value="candidate">Candidate</option>
                    <option value="corporate">Corporate</option>
                </select>
                <select
                    className="select select-sm"
                    value={filters.status || ""}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            status: e.target.value || undefined,
                        })
                    }
                >
                    <option value="">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <LoadingState message="Loading content pages..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : pages.length === 0 ? (
                <EmptyState
                    icon="fa-file-lines"
                    title="No pages found"
                    description={
                        search || filters.app || filters.status
                            ? "Try adjusting your search or filters"
                            : "Create your first content page to get started"
                    }
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Page</th>
                                        <th>App</th>
                                        <th>Status</th>
                                        <th>Category</th>
                                        <th>Updated</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pages.map((page) => (
                                        <tr key={page.id}>
                                            <td>
                                                <div>
                                                    <div className="font-semibold">
                                                        {page.title}
                                                    </div>
                                                    <div className="text-xs text-base-content/50">
                                                        /{page.slug}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge badge-sm ${getAppBadge(page.app)}`}
                                                >
                                                    {page.app}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge badge-sm ${getStatusBadge(page.status)}`}
                                                >
                                                    {page.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm text-base-content/70">
                                                    {page.category || "—"}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className="text-sm text-base-content/60"
                                                    suppressHydrationWarning
                                                >
                                                    {new Date(
                                                        page.updated_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/portal/admin/content/pages/${page.id}`,
                                                            )
                                                        }
                                                        className="btn btn-xs btn-ghost"
                                                        title="Edit"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-pen"></i>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deletePage(page)
                                                        }
                                                        className="btn btn-xs btn-ghost text-error"
                                                        disabled={
                                                            deletingId ===
                                                            page.id
                                                        }
                                                        title="Delete"
                                                    >
                                                        {deletingId ===
                                                        page.id ? (
                                                            <span className="loading loading-spinner loading-xs"></span>
                                                        ) : (
                                                            <i className="fa-duotone fa-regular fa-trash"></i>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && pages.length > 0 && (
                <PaginationControls pagination={pagination} setPage={setPage} />
            )}

            <CreatePageModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={(pageId) => {
                    setShowCreateModal(false);
                    router.push(`/portal/admin/content/pages/${pageId}`);
                }}
            />
        </div>
    );
}
