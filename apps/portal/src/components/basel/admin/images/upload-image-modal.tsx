"use client";

import { useState, useRef } from "react";
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

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/svg+xml";
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface UploadImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploaded: () => void;
}

export function UploadImageModal({
    isOpen,
    onClose,
    onUploaded,
}: UploadImageModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [altText, setAltText] = useState("");
    const [tags, setTags] = useState("");

    function resetForm() {
        setFile(null);
        setPreview(null);
        setAltText("");
        setTags("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (selected.size > MAX_SIZE_BYTES) {
            toast.error(`File too large. Maximum size is ${MAX_SIZE_MB}MB`);
            return;
        }

        setFile(selected);

        // Generate preview
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(selected);
    }

    async function handleUpload() {
        if (!file) {
            toast.error("Please select an image file");
            return;
        }

        setUploading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");

            const formData = new FormData();
            formData.append("file", file);
            if (altText.trim()) formData.append("alt_text", altText.trim());
            if (tags.trim()) formData.append("tags", tags.trim());

            const apiClient = createAuthenticatedClient(token);
            await apiClient.post("/content-images", formData);

            toast.success("Image uploaded");
            resetForm();
            onUploaded();
        } catch (err: any) {
            console.error("Failed to upload image:", err);
            toast.error(err?.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    }

    function handleClose() {
        resetForm();
        onClose();
    }

    return (
        <BaselModal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-lg">
            <BaselModalHeader
                title="Upload Image"
                icon="fa-cloud-arrow-up"
                iconColor="primary"
                onClose={handleClose}
            />
            <BaselModalBody>
                <div className="space-y-4">
                    <BaselFormField label="Image File" required>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="file-input file-input-bordered w-full"
                            accept={ACCEPTED_TYPES}
                            onChange={handleFileSelect}
                        />
                        <p className="text-sm text-base-content/50 mt-1">
                            JPG, PNG, WebP, or SVG. Max {MAX_SIZE_MB}MB.
                        </p>
                    </BaselFormField>

                    {preview && (
                        <div className="rounded-lg border border-base-300 overflow-hidden bg-base-200 p-2">
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-h-48 mx-auto object-contain rounded"
                            />
                        </div>
                    )}

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
            <BaselModalFooter align="end">
                <button
                    className="btn btn-ghost"
                    onClick={handleClose}
                    disabled={uploading}
                >
                    Cancel
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={uploading || !file}
                >
                    <ButtonLoading
                        loading={uploading}
                        text="Upload"
                        loadingText="Uploading..."
                    />
                </button>
            </BaselModalFooter>
        </BaselModal>
    );
}
