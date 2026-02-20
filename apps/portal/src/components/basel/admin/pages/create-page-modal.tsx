"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
    BaselFormField,
} from "@splits-network/basel-ui";
import { ButtonLoading } from "@splits-network/shared-ui";

interface CreatePageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (pageId: string) => void;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function CreatePageModal({
    isOpen,
    onClose,
    onCreated,
}: CreatePageModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        app: "portal",
        category: "",
        description: "",
    });

    function resetForm() {
        setFormData({
            title: "",
            slug: "",
            app: "portal",
            category: "",
            description: "",
        });
        setSlugManuallyEdited(false);
    }

    function handleTitleChange(title: string) {
        setFormData((prev) => ({
            ...prev,
            title,
            slug: slugManuallyEdited ? prev.slug : slugify(title),
        }));
    }

    function handleSlugChange(slug: string) {
        setSlugManuallyEdited(true);
        setFormData((prev) => ({ ...prev, slug }));
    }

    async function handleSubmit() {
        if (!formData.title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!formData.slug.trim()) {
            toast.error("Slug is required");
            return;
        }

        setSubmitting(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            const result = await apiClient.post("/pages", {
                title: formData.title.trim(),
                slug: formData.slug.trim(),
                app: formData.app,
                category: formData.category.trim() || undefined,
                description: formData.description.trim() || undefined,
                blocks: [],
                status: "draft",
            });

            toast.success("Page created");
            resetForm();
            onCreated(result.data.id);
        } catch (err: any) {
            console.error("Failed to create page:", err);
            toast.error(err?.message || "Failed to create page");
        } finally {
            setSubmitting(false);
        }
    }

    function handleClose() {
        resetForm();
        onClose();
    }

    return (
        <BaselModal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-lg">
            <BaselModalHeader
                title="Create Page"
                icon="fa-file-lines"
                iconColor="primary"
                onClose={handleClose}
            />
            <BaselModalBody>
                <div className="space-y-4">
                    <BaselFormField label="Title" required>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Page title"
                        />
                    </BaselFormField>

                    <BaselFormField
                        label="Slug"
                        required
                        hint="URL path segment — auto-generated from title"
                    >
                        <input
                            type="text"
                            className="input input-bordered w-full font-mono text-sm"
                            value={formData.slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            placeholder="page-slug"
                        />
                    </BaselFormField>

                    <BaselFormField label="App" required>
                        <select
                            className="select select-bordered w-full"
                            value={formData.app}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    app: e.target.value,
                                })
                            }
                        >
                            <option value="portal">Portal</option>
                            <option value="candidate">Candidate</option>
                            <option value="corporate">Corporate</option>
                        </select>
                    </BaselFormField>

                    <BaselFormField
                        label="Category"
                        hint="Optional grouping (e.g., marketing, legal)"
                    >
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    category: e.target.value,
                                })
                            }
                            placeholder="marketing"
                        />
                    </BaselFormField>

                    <BaselFormField
                        label="Description"
                        hint="Short summary for SEO and page previews"
                    >
                        <textarea
                            className="textarea textarea-bordered w-full h-20"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            placeholder="A brief description of this page..."
                        />
                    </BaselFormField>
                </div>
            </BaselModalBody>
            <BaselModalFooter align="end">
                <button
                    className="btn btn-ghost"
                    onClick={handleClose}
                    disabled={submitting}
                >
                    Cancel
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    <ButtonLoading
                        loading={submitting}
                        text="Create Page"
                        loadingText="Creating..."
                    />
                </button>
            </BaselModalFooter>
        </BaselModal>
    );
}
