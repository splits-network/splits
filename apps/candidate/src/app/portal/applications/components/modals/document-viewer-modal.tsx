"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ModalLoadingOverlay } from "@splits-network/shared-ui";

interface Document {
    id: string;
    file_name: string;
    content_type: string | null;
    file_size: number | null;
    document_type: string | null;
    is_primary: boolean;
    storage_path: string;
}

interface DocumentViewerModalProps {
    document: Document | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function DocumentViewerModal({
    document,
    isOpen,
    onClose,
}: DocumentViewerModalProps) {
    const { getToken } = useAuth();
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !document) {
            setSignedUrl(null);
            setLoading(true);
            setError(null);
            return;
        }

        const fetchSignedUrl = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = await getToken();
                if (!token) {
                    throw new Error("Not authenticated");
                }

                const client = createAuthenticatedClient(token);
                const response: any = await client.get(
                    `/documents/${document.id}`,
                );
                const url = response.data?.download_url;

                if (!url) {
                    throw new Error("No download URL available");
                }

                setSignedUrl(url);
            } catch (err: any) {
                console.error("Failed to fetch signed URL:", err);

                if (err?.response?.status === 404) {
                    setError(
                        "This document file is missing from storage. It may have been deleted or never uploaded.",
                    );
                } else {
                    setError(err?.message || "Failed to load document");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSignedUrl();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, document]);

    if (!isOpen || !document) return null;

    const handleDownloadClick = async () => {
        if (signedUrl) {
            window.open(signedUrl, "_blank");
        }
    };

    const isPdf =
        document.content_type?.includes("pdf") ||
        document.file_name.toLowerCase().endsWith(".pdf");
    const isImage =
        document.content_type?.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif|webp)$/i.test(document.file_name);
    const isText =
        document.content_type?.includes("text/") ||
        /\.(txt|md|csv)$/i.test(document.file_name);

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-6xl h-[90vh] p-0 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-base-300 flex justify-between items-start bg-base-100 shrink-0">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate mb-1">
                            {document.file_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
                            <span className="capitalize">
                                {document.document_type}
                            </span>
                            {document.file_size && (
                                <>
                                    <span>&bull;</span>
                                    <span>
                                        {(document.file_size / 1024).toFixed(1)}{" "}
                                        KB
                                    </span>
                                </>
                            )}
                            {document.is_primary && (
                                <span className="badge badge-primary badge-sm">
                                    <i className="fa-duotone fa-regular fa-star mr-1"></i>
                                    Primary
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleDownloadClick}
                            className="btn btn-ghost"
                            title="Download"
                            disabled={!signedUrl}
                        >
                            <i className="fa-duotone fa-regular fa-download fa-lg"></i>
                        </button>
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-xl"></i>
                        </button>
                    </div>
                </div>

                {/* Document Viewer */}
                <div className="flex-1 overflow-hidden bg-base-200/30 relative">
                    {error ? (
                        <div className="flex items-center justify-center h-full p-8">
                            <div className="alert alert-error max-w-md">
                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                <div>
                                    <div className="font-semibold">
                                        Failed to load document
                                    </div>
                                    <div className="text-sm mt-1">{error}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <ModalLoadingOverlay loading={loading}>
                            {isPdf && signedUrl ? (
                                <iframe
                                    src={`${signedUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                                    className="w-full h-full"
                                    title={document.file_name}
                                />
                            ) : isImage && signedUrl ? (
                                <div className="flex items-center justify-center h-full p-8 overflow-auto">
                                    <img
                                        src={signedUrl}
                                        alt={document.file_name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            ) : isText && signedUrl ? (
                                <iframe
                                    src={signedUrl}
                                    className="w-full h-full bg-white"
                                    title={document.file_name}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full p-8">
                                    <div className="text-center max-w-md">
                                        <i className="fa-duotone fa-regular fa-file text-6xl text-base-content/40 mb-4"></i>
                                        <h4 className="text-lg font-semibold mb-2">
                                            Preview not available
                                        </h4>
                                        <p className="text-base-content/70 mb-6">
                                            This file type cannot be previewed
                                            in the browser. Please download the
                                            file to view it.
                                        </p>
                                        <button
                                            onClick={handleDownloadClick}
                                            className="btn btn-primary"
                                        >
                                            <i className="fa-duotone fa-regular fa-download mr-2"></i>
                                            Download File
                                        </button>
                                    </div>
                                </div>
                            )}
                        </ModalLoadingOverlay>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-base-300 bg-base-100 shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-base-content/60">
                            <i className="fa-duotone fa-regular fa-circle-info mr-2"></i>
                            Tip: You can download this document using the button
                            above
                        </div>
                        <button onClick={onClose} className="btn btn-sm">
                            Close
                        </button>
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button>close</button>
            </form>
        </dialog>
    );
}
