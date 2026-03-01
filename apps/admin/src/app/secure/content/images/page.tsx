'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useAdminToast } from '@/hooks/use-admin-toast';
import { useStandardList } from '@/hooks/use-standard-list';
import { AdminPageHeader } from '@/components/shared';
import {
    PaginationControls,
    SearchInput,
    EmptyState,
    StandardListLoadingState,
    ErrorState,
} from '@splits-network/shared-hooks';
import type { ContentImage } from '@splits-network/shared-types';
import { UploadImageModal } from './components/upload-image-modal';
import { ImageDetailModal } from './components/image-detail-modal';

interface ImageFilters {
    tags?: string;
    mime_type?: string;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ContentImagesAdminPage() {
    const { getToken } = useAuth();
    const toast = useAdminToast();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ContentImage | null>(null);

    const defaultFilters = useMemo<ImageFilters>(() => ({}), []);

    const {
        items: images,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<ContentImage, ImageFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set('page', String(params.page));
            queryParams.set('limit', String(params.limit));
            if (params.search) queryParams.set('search', params.search);
            if (params.filters?.tags) queryParams.set('tags', params.filters.tags);
            if (params.filters?.mime_type)
                queryParams.set('mime_type', params.filters.mime_type);
            if (params.sort_by) queryParams.set('sort_by', params.sort_by);
            if (params.sort_order) queryParams.set('sort_order', params.sort_order);

            return await apiClient.get(
                `/content/admin/content-images?${queryParams.toString()}`,
            );
        },
        defaultFilters,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        syncToUrl: true,
    });

    function handleCopyUrl(image: ContentImage, e: React.MouseEvent) {
        e.stopPropagation();
        navigator.clipboard.writeText(image.public_url);
        toast.success('URL copied to clipboard');
    }

    const totalSize = images.reduce((sum, img) => sum + img.file_size, 0);

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Content Images"
                subtitle="Upload and manage images for CMS page content"
                actions={
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowUploadModal(true)}
                    >
                        <i className="fa-duotone fa-regular fa-cloud-arrow-up mr-1"></i>
                        Upload Image
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total Images</div>
                    <div className="stat-value text-2xl text-primary">
                        {loading ? '...' : pagination.total}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">This Page</div>
                    <div className="stat-value text-2xl text-secondary">
                        {loading ? '...' : images.length}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Page Size</div>
                    <div className="stat-value text-2xl text-accent">
                        {loading ? '...' : formatFileSize(totalSize)}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search images..."
                />
                <select
                    className="select select-sm"
                    value={filters.mime_type || ''}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            mime_type: e.target.value || undefined,
                        })
                    }
                >
                    <option value="">All Types</option>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                    <option value="image/svg+xml">SVG</option>
                </select>
            </div>

            {/* Image Grid */}
            {loading ? (
                <StandardListLoadingState message="Loading images..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : images.length === 0 ? (
                <EmptyState
                    icon="fa-image"
                    title="No images found"
                    description={
                        search || filters.mime_type || filters.tags
                            ? 'Try adjusting your search or filters'
                            : 'Upload your first image to get started'
                    }
                />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {images.map((image) => (
                        <div
                            key={image.id}
                            className="card bg-base-100 shadow hover:shadow-md transition-shadow cursor-pointer group"
                            onClick={() => setSelectedImage(image)}
                        >
                            <figure className="aspect-square bg-base-200 overflow-hidden relative">
                                <img
                                    src={image.public_url}
                                    alt={image.alt_text || image.filename}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                {/* Hover overlay with copy button */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <button
                                        className="btn btn-sm btn-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleCopyUrl(image, e)}
                                        title="Copy URL"
                                    >
                                        <i className="fa-duotone fa-regular fa-copy mr-1"></i>
                                        Copy URL
                                    </button>
                                </div>
                            </figure>
                            <div className="card-body p-3">
                                <p
                                    className="text-sm font-medium truncate"
                                    title={image.filename}
                                >
                                    {image.filename}
                                </p>
                                <div className="flex items-center justify-between text-base-content/50">
                                    <span className="text-sm">
                                        {formatFileSize(image.file_size)}
                                    </span>
                                    <span className="text-sm" suppressHydrationWarning>
                                        {new Date(image.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {image.tags && image.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {image.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="badge badge-ghost badge-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {image.tags.length > 3 && (
                                            <span className="badge badge-ghost badge-sm">
                                                +{image.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && !error && images.length > 0 && (
                <PaginationControls pagination={pagination} setPage={setPage} />
            )}

            <UploadImageModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUploaded={() => {
                    setShowUploadModal(false);
                    refresh();
                }}
            />

            <ImageDetailModal
                image={selectedImage}
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                onUpdated={() => {
                    setSelectedImage(null);
                    refresh();
                }}
                onDeleted={() => {
                    setSelectedImage(null);
                    refresh();
                }}
            />
        </div>
    );
}
