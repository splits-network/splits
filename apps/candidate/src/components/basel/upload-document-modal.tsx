"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
} from "@splits-network/basel-ui";
import gsap from "gsap";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface UploadDocumentModalProps {
    entityType: string;
    entityId: string;
    documentType?: string;
    onClose: () => void;
    onSuccess: () => void;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/rtf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function BaselUploadDocumentModal({
    entityType,
    entityId,
    documentType = "other",
    onClose,
    onSuccess,
}: UploadDocumentModalProps) {
    const { getToken } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [selectedDocType, setSelectedDocType] = useState(documentType);
    const [setAsPrimary, setSetAsPrimary] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ─── GSAP entrance animation ────────────────────────────────────────── */

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        if (prefersReducedMotion) {
            if (containerRef.current) containerRef.current.style.opacity = "1";
            if (backdropRef.current) backdropRef.current.style.opacity = "1";
            return;
        }

        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 40, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" },
            );
        }

        if (backdropRef.current) {
            gsap.fromTo(
                backdropRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3 },
            );
        }
    }, []);

    /* ─── File handling ──────────────────────────────────────────────────── */

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
            setError("Please upload a PDF, DOC, DOCX, TXT, or RTF file");
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("File size must be less than 10MB");
            return;
        }

        setFile(selectedFile);
        setError(null);
    };

    const handleDropZoneClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files?.[0];
        if (!droppedFile) return;

        if (!ALLOWED_TYPES.includes(droppedFile.type)) {
            setError("Please upload a PDF, DOC, DOCX, TXT, or RTF file");
            return;
        }

        if (droppedFile.size > MAX_FILE_SIZE) {
            setError("File size must be less than 10MB");
            return;
        }

        setFile(droppedFile);
        setError(null);
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    /* ─── Upload ─────────────────────────────────────────────────────────── */

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError("Please select a file");
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("No auth token available");
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("entity_type", entityType);
            formData.append("entity_id", entityId);
            formData.append("document_type", selectedDocType);

            const client = createAuthenticatedClient(token);
            const response = await client.post("/documents", formData);

            // If this is a resume and set as primary is selected, set it as primary
            if (
                selectedDocType === "resume" &&
                setAsPrimary &&
                response.data?.id
            ) {
                try {
                    await client.patch(`/documents/${response.data.id}`, {
                        metadata: {
                            is_primary_for_candidate: true,
                        },
                    });
                } catch (primaryErr: any) {
                    console.error(
                        "Failed to set as primary resume:",
                        primaryErr,
                    );
                    // Don't fail the upload if primary setting fails
                }
            }

            onSuccess();
        } catch (err: any) {
            console.error("Upload error:", err);
            console.error("Error details:", {
                message: err.message,
                response: err.response,
                status: err.status,
                stack: err.stack,
            });
            setError(
                err.response?.data?.error?.message ||
                    err.message ||
                    "Upload failed",
            );
        } finally {
            setUploading(false);
        }
    };

    /* ─── Helpers ─────────────────────────────────────────────────────────── */

    const formatFileSize = (bytes: number): string => {
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    /* ─── Render ─────────────────────────────────────────────────────────── */

    return (
        <BaselModal
            isOpen={true}
            onClose={onClose}
            maxWidth="max-w-xl"
            containerRef={containerRef}
            backdropRef={backdropRef}
        >
            <BaselModalHeader
                title={/* COPY: modal title */ "Upload Document"}
                subtitle={/* COPY: modal subtitle */ "Add a file to your document library"}
                icon="fa-cloud-arrow-up"
                iconColor="primary"
                onClose={onClose}
                closeDisabled={uploading}
            />

            <BaselModalBody>
                <form onSubmit={handleUpload} id="upload-document-form" className="space-y-5">
                    {/* Document type select */}
                    <div>
                        <label className="text-xs font-semibold tracking-wider uppercase text-base-content/70 mb-2 block">
                            {/* COPY: document type label */}
                            Document Type
                        </label>
                        <select
                            className="select w-full"
                            value={selectedDocType}
                            onChange={(e) => setSelectedDocType(e.target.value)}
                            required
                        >
                            <option value="resume">
                                {/* COPY: resume option */ "Resume"}
                            </option>
                            <option value="cover_letter">
                                {/* COPY: cover letter option */ "Cover Letter"}
                            </option>
                            <option value="other">
                                {/* COPY: other option */ "Other"}
                            </option>
                        </select>
                    </div>

                    {/* File drop zone / file selected */}
                    <div>
                        <label className="text-xs font-semibold tracking-wider uppercase text-base-content/70 mb-2 block">
                            {/* COPY: file label */}
                            File
                        </label>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.rtf"
                            onChange={handleFileChange}
                        />

                        {!file ? (
                            <div
                                onClick={handleDropZoneClick}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className="border-2 border-dashed border-base-300 hover:border-primary/50 bg-base-200 p-8 text-center cursor-pointer transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-cloud-arrow-up text-3xl text-base-content/40 mb-3 block" />
                                <p className="text-sm font-medium text-base-content/70">
                                    {/* COPY: drop zone main text */}
                                    Drag a file here or click to browse
                                </p>
                                <p className="text-xs text-base-content/50 mt-1">
                                    {/* COPY: drop zone hint text */}
                                    PDF, DOC, DOCX, TXT, or RTF up to 10MB
                                </p>
                            </div>
                        ) : (
                            <div className="border-l-4 border-success bg-success/5 p-4 flex items-center gap-3">
                                <i className="fa-duotone fa-regular fa-file-check text-success text-lg" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-base-content truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-base-content/60">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
                                    onClick={removeFile}
                                >
                                    <i className="fa-duotone fa-regular fa-xmark" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Primary resume checkbox */}
                    {selectedDocType === "resume" && (
                        <div>
                            <label className="cursor-pointer flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={setAsPrimary}
                                    onChange={(e) => setSetAsPrimary(e.target.checked)}
                                />
                                <span className="text-sm text-base-content">
                                    {/* COPY: primary resume checkbox label */}
                                    Make this my primary resume
                                </span>
                            </label>
                            <p className="text-xs text-base-content/60 mt-1 ml-8">
                                {/* COPY: primary resume helper text */}
                                Your primary resume is auto-attached when you start a new application
                            </p>
                        </div>
                    )}

                    {/* Error display */}
                    {error && (
                        <div className="border-l-4 border-error bg-error/5 p-4 flex items-center gap-3">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-error" />
                            <p className="text-sm text-error">{error}</p>
                        </div>
                    )}
                </form>
            </BaselModalBody>

            <BaselModalFooter>
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onClose}
                    disabled={uploading}
                >
                    {/* COPY: cancel button */}
                    Cancel
                </button>
                <button
                    type="submit"
                    form="upload-document-form"
                    className="btn btn-primary"
                    disabled={uploading || !file}
                >
                    {uploading ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />
                            {/* COPY: uploading button text */}
                            Uploading
                        </>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-upload" />
                            {/* COPY: upload button text */}
                            Upload File
                        </>
                    )}
                </button>
            </BaselModalFooter>
        </BaselModal>
    );
}
