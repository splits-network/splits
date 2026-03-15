"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
    BaselFormField,
    BaselConfirmModal,
} from "@splits-network/basel-ui";
import { ButtonLoading } from "@splits-network/shared-ui";
import type { ContentImage } from "@splits-network/shared-types";

interface ImageDetailModalProps {
    image: ContentImage | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
    onDeleted: () => void;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageDetailModal({
    image,
    isOpen,
    onClose,
    onUpdated,
    onDeleted,
}: ImageDetailModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [altText, setAltText] = useState("");
    const [tags, setTags] = useState("");
    const [filename, setFilename] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (image) {
            setAltText(image.alt_text || "");
            setTags(image.tags?.join(", ") || "");
            setFilename(image.filename || "");
        }
    }, [image]);

    async function handleSave() {
        if (!image) return;

        setSaving(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            await apiClient.patch(`/content-images/${image.id}`, {
                alt_text: altText.trim(),
                tags: tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                filename: filename.trim() || image.filename,
            });

            toast.success("Image updated.");
            onUpdated();
        } catch (err: any) {
            console.error("Failed to update image:", err);
            toast.error(err?.message || "Failed to update image");
        } finally {
            setSaving(false);
        }
    }

    function handleDelete() {
        setShowDeleteConfirm(true);
    }

    async function confirmDelete() {
        if (!image) return;
        setShowDeleteConfirm(false);

        setDeleting(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);
            await apiClient.delete(`/content-images/${image.id}`);

            toast.success("Image deleted.");
            onDeleted();
        } catch (err: any) {
            console.error("Failed to delete image:", err);
            toast.error(err?.message || "Failed to delete image");
        } finally {
            setDeleting(false);
        }
    }

    function handleCopyUrl() {
        if (!image) return;
        navigator.clipboard.writeText(image.public_url);
        toast.info("URL copied to clipboard.");
    }

    if (!image) return null;

    return (
        <>
        <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <BaselModalHeader
                title="Image Details"
                icon="fa-image"
                iconColor="primary"
                onClose={onClose}
            />
            <BaselModalBody>
                <div className="space-y-5">
                    {/* Preview */}
                    <div className="rounded-lg border border-base-300 overflow-hidden bg-base-200 p-2">
                        <img
                            src={image.public_url}
                            alt={image.alt_text || image.filename}
                            className="max-h-64 mx-auto object-contain rounded"
                        />
                    </div>

                    {/* Copy URL */}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            className="input input-bordered input-sm w-full font-mono text-sm"
                            value={image.public_url}
                            readOnly
                        />
                        <button
                            className="btn btn-primary btn-sm whitespace-nowrap"
                            onClick={handleCopyUrl}
                        >
                            <i className="fa-duotone fa-regular fa-copy mr-1"></i>
                            Copy URL
                        </button>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                            <span className="text-base-content/50 block">Original Name</span>
                            <span className="font-medium truncate block" title={image.original_filename}>
                                {image.original_filename}
                            </span>
                        </div>
                        <div>
                            <span className="text-base-content/50 block">Type</span>
                            <span className="font-medium">{image.mime_type.split("/")[1].toUpperCase()}</span>
                        </div>
                        <div>
                            <span className="text-base-content/50 block">Size</span>
                            <span className="font-medium">{formatFileSize(image.file_size)}</span>
                        </div>
                        <div>
                            <span className="text-base-content/50 block">Uploaded</span>
                            <span className="font-medium" suppressHydrationWarning>
                                {new Date(image.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div className="divider my-0"></div>

                    {/* Editable fields */}
                    <BaselFormField label="Display Filename">
                        <input
                            type="text"
                            className="input input-bordered w-full text-sm"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                        />
                    </BaselFormField>

                    <BaselFormField
                        label="Alt Text"
                        hint="Descriptive text for accessibility and SEO"
                    >
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                            placeholder="Describe the image..."
                        />
                    </BaselFormField>

                    <BaselFormField
                        label="Tags"
                        hint="Comma-separated tags for organization"
                    >
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="hero, marketing, team"
                        />
                    </BaselFormField>
                </div>
            </BaselModalBody>
            <BaselModalFooter>
                <button
                    className="btn btn-error btn-outline btn-sm"
                    onClick={handleDelete}
                    disabled={deleting || saving}
                >
                    <ButtonLoading
                        loading={deleting}
                        text="Delete"
                        loadingText="Deleting..."
                    />
                </button>
                <div className="flex-1"></div>
                <button
                    className="btn btn-ghost"
                    onClick={onClose}
                    disabled={saving}
                >
                    Cancel
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving || deleting}
                >
                    <ButtonLoading
                        loading={saving}
                        text="Save Changes"
                        loadingText="Saving..."
                    />
                </button>
            </BaselModalFooter>
        </BaselModal>
        <BaselConfirmModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={confirmDelete}
            title="Delete Image"
            icon="fa-trash"
            confirmColor="btn-error"
        >
            <p>Are you sure you want to delete &quot;{image?.filename}&quot;? This will remove the image from storage.</p>
        </BaselConfirmModal>
        </>
    );
}
