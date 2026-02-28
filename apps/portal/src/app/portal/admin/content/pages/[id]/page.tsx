"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { AdminPageHeader, useAdminConfirm } from "../../../components";
import { ButtonLoading } from "@splits-network/shared-ui";
import { LoadingState } from "@splits-network/shared-ui";
import type {
    ContentPage,
    ContentBlock,
    ContentBlockType,
} from "@splits-network/shared-types";
import { BlockPanel } from "@/components/basel/admin/pages/block-panel";
import { LivePreviewPane } from "@/components/basel/admin/pages/live-preview-pane";
import {
    PageSettingsModal,
    type PageMetaForm,
} from "@/components/basel/admin/pages/page-settings-modal";
import { BlockPickerModal } from "@/components/basel/admin/pages/block-picker-modal";
import { BlockFormModal } from "@/components/basel/admin/pages/block-form-modal";

interface PageEditorProps {
    params: Promise<{ id: string }>;
}

export default function PageEditorPage({ params }: PageEditorProps) {
    const { id } = use(params);
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const confirm = useAdminConfirm();

    // Page state
    const [page, setPage] = useState<ContentPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);

    // Draft state
    const [draftBlocks, setDraftBlocks] = useState<ContentBlock[]>([]);
    const [blockIds, setBlockIds] = useState<string[]>([]);
    const [pageMeta, setPageMeta] = useState<PageMetaForm>({
        title: "",
        slug: "",
        description: "",
        og_image: "",
        category: "",
        author: "",
        read_time: "",
        app: "portal",
    });
    const [isDirty, setIsDirty] = useState(false);

    // Modal state
    const [showSettings, setShowSettings] = useState(false);
    const [showBlockPicker, setShowBlockPicker] = useState(false);
    const [editingBlock, setEditingBlock] = useState<{
        index: number;
        block: ContentBlock;
        blockType: ContentBlockType;
    } | null>(null);
    const [creatingBlockType, setCreatingBlockType] =
        useState<ContentBlockType | null>(null);

    // Load page
    const loadPage = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);
            const result = await apiClient.get(`/pages/${id}`);
            const p = result.data as ContentPage;
            setPage(p);
            setDraftBlocks(p.blocks || []);
            setBlockIds((p.blocks || []).map(() => crypto.randomUUID()));
            setPageMeta({
                title: p.title || "",
                slug: p.slug || "",
                description: p.description || "",
                og_image: p.og_image || "",
                category: p.category || "",
                author: p.author || "",
                read_time: p.read_time || "",
                app: p.app,
            });
            setIsDirty(false);
        } catch (err) {
            console.error("Failed to load page:", err);
            toast.error("Failed to load page");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    // Block operations
    const handleBlocksChange = useCallback(
        (blocks: ContentBlock[], ids: string[]) => {
            setDraftBlocks(blocks);
            setBlockIds(ids);
            setIsDirty(true);
        },
        [],
    );

    const handleAddBlock = useCallback((type: ContentBlockType) => {
        setShowBlockPicker(false);
        setCreatingBlockType(type);
    }, []);

    const handleBlockCreated = useCallback((block: ContentBlock) => {
        setDraftBlocks((prev) => [...prev, block]);
        setBlockIds((prev) => [...prev, crypto.randomUUID()]);
        setCreatingBlockType(null);
        setIsDirty(true);
    }, []);

    const handleBlockEdited = useCallback(
        (block: ContentBlock) => {
            if (!editingBlock) return;
            setDraftBlocks((prev) => {
                const updated = [...prev];
                updated[editingBlock.index] = block;
                return updated;
            });
            setEditingBlock(null);
            setIsDirty(true);
        },
        [editingBlock],
    );

    const handleDeleteBlock = useCallback(
        async (index: number) => {
            const confirmed = await confirm({
                title: "Remove Block",
                message: "Are you sure you want to remove this block?",
                confirmText: "Remove",
                type: "warning",
            });
            if (!confirmed) return;

            setDraftBlocks((prev) => prev.filter((_, i) => i !== index));
            setBlockIds((prev) => prev.filter((_, i) => i !== index));
            setIsDirty(true);
        },
        [confirm],
    );

    const handleEditBlock = useCallback(
        (index: number) => {
            const block = draftBlocks[index];
            if (block) {
                setEditingBlock({
                    index,
                    block,
                    blockType: block.type as ContentBlockType,
                });
            }
        },
        [draftBlocks],
    );

    // Meta change
    const handleMetaChange = useCallback((meta: PageMetaForm) => {
        setPageMeta(meta);
        setIsDirty(true);
    }, []);

    // Save
    async function handleSave() {
        setSaving(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            await apiClient.patch(`/pages/${id}`, {
                title: pageMeta.title,
                slug: pageMeta.slug,
                description: pageMeta.description || undefined,
                og_image: pageMeta.og_image || undefined,
                category: pageMeta.category || undefined,
                author: pageMeta.author || undefined,
                read_time: pageMeta.read_time || undefined,
                blocks: draftBlocks,
            });

            toast.success("Draft saved");
            setIsDirty(false);
            setPage((prev) =>
                prev ? { ...prev, blocks: draftBlocks, ...pageMeta } : prev,
            );
        } catch (err) {
            console.error("Failed to save:", err);
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    }

    // Publish / Unpublish
    async function handlePublishToggle() {
        if (!page) return;
        const isPublishing = page.status !== "published";

        if (isPublishing && draftBlocks.length === 0) {
            toast.error("Add at least one block before publishing");
            return;
        }

        setPublishing(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            await apiClient.patch(`/pages/${id}`, {
                status: isPublishing ? "published" : "draft",
                ...(isPublishing
                    ? { published_at: new Date().toISOString() }
                    : {}),
                blocks: draftBlocks,
                title: pageMeta.title,
                slug: pageMeta.slug,
                description: pageMeta.description || undefined,
                og_image: pageMeta.og_image || undefined,
                category: pageMeta.category || undefined,
                author: pageMeta.author || undefined,
                read_time: pageMeta.read_time || undefined,
            });

            toast.success(isPublishing ? "Page published" : "Page unpublished");
            setIsDirty(false);
            await loadPage();
        } catch (err) {
            console.error("Failed to update status:", err);
            toast.error("Failed to update status");
        } finally {
            setPublishing(false);
        }
    }

    if (loading) {
        return <LoadingState message="Loading page editor..." />;
    }

    if (!page) {
        return (
            <div className="text-center py-12">
                <p className="text-base-content/60">Page not found</p>
                <button
                    className="btn btn-ghost btn-sm mt-4"
                    onClick={() => router.push("/portal/admin/content/pages")}
                >
                    Back to Pages
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300 bg-base-100 flex-shrink-0">
                <AdminPageHeader
                    title={pageMeta.title || "Untitled Page"}
                    breadcrumbs={[
                        {
                            label: "Content",
                            href: "/portal/admin/content/pages",
                        },
                        { label: "Pages", href: "/portal/admin/content/pages" },
                        { label: pageMeta.title || "Edit" },
                    ]}
                    badge={
                        <span
                            className={`badge badge-sm ${page.status === "published" ? "badge-success" : page.status === "draft" ? "badge-warning" : "badge-ghost"}`}
                        >
                            {page.status}
                        </span>
                    }
                    actions={
                        <div className="flex items-center gap-2">
                            {isDirty && (
                                <span className="text-xs text-warning font-medium flex items-center gap-1">
                                    <i className="fa-duotone fa-regular fa-circle-dot text-[8px]"></i>
                                    Unsaved changes
                                </span>
                            )}
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setShowSettings(true)}
                            >
                                <i className="fa-duotone fa-regular fa-gear mr-1"></i>
                                Settings
                            </button>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={handleSave}
                                disabled={saving || !isDirty}
                            >
                                <ButtonLoading
                                    loading={saving}
                                    text="Save Draft"
                                    loadingText="Saving..."
                                />
                            </button>
                            <button
                                className={`btn btn-sm ${page.status === "published" ? "btn-warning" : "btn-primary"}`}
                                onClick={handlePublishToggle}
                                disabled={publishing}
                            >
                                <ButtonLoading
                                    loading={publishing}
                                    text={
                                        page.status === "published"
                                            ? "Unpublish"
                                            : "Publish"
                                    }
                                    loadingText={
                                        page.status === "published"
                                            ? "Unpublishing..."
                                            : "Publishing..."
                                    }
                                />
                            </button>
                        </div>
                    }
                />
            </div>

            {/* Editor split layout */}
            <div className="flex flex-1 overflow-hidden">
                <BlockPanel
                    blocks={draftBlocks}
                    blockIds={blockIds}
                    onBlocksChange={handleBlocksChange}
                    onAddBlock={() => setShowBlockPicker(true)}
                    onEditBlock={handleEditBlock}
                    onDeleteBlock={handleDeleteBlock}
                />
                <LivePreviewPane blocks={draftBlocks} />
            </div>

            {/* Modals */}
            <PageSettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                meta={pageMeta}
                onChange={handleMetaChange}
            />

            <BlockPickerModal
                isOpen={showBlockPicker}
                onClose={() => setShowBlockPicker(false)}
                onSelect={handleAddBlock}
            />

            {creatingBlockType && (
                <BlockFormModal
                    isOpen={true}
                    onClose={() => setCreatingBlockType(null)}
                    blockType={creatingBlockType}
                    block={null}
                    onSave={handleBlockCreated}
                />
            )}

            {editingBlock && (
                <BlockFormModal
                    isOpen={true}
                    onClose={() => setEditingBlock(null)}
                    blockType={editingBlock.blockType}
                    block={editingBlock.block}
                    onSave={handleBlockEdited}
                />
            )}
        </div>
    );
}
