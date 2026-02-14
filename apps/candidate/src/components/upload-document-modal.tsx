"use client";

import { useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface UploadDocumentModalProps {
    entityType: string;
    entityId: string;
    documentType?: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UploadDocumentModal({
    entityType,
    entityId,
    documentType = "other",
    onClose,
    onSuccess,
}: UploadDocumentModalProps) {
    const { getToken } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [selectedDocType, setSelectedDocType] = useState(documentType);
    const [setAsPrimary, setSetAsPrimary] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file type
            const allowedTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain",
                "application/rtf",
            ];
            if (!allowedTypes.includes(selectedFile.type)) {
                setError("Please upload a PDF, DOC, DOCX, TXT, or RTF file");
                return;
            }
            // Validate file size (10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError("File size must be less than 10MB");
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

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

    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Upload Document</h3>

                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Document Type
                        </legend>
                        <select
                            className="select w-full"
                            value={selectedDocType}
                            onChange={(e) => setSelectedDocType(e.target.value)}
                            required
                        >
                            <option value="resume">Resume</option>
                            <option value="cover_letter">Cover Letter</option>
                            <option value="other">Other</option>
                        </select>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            File *
                            <span className="text-base-content/60 font-normal text-sm ml-2">
                                PDF, DOC, DOCX, TXT, or RTF - Max 10MB
                            </span>
                        </legend>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="file-input w-full"
                            accept=".pdf,.doc,.docx,.txt,.rtf"
                            onChange={handleFileChange}
                            required
                        />
                        {file && (
                            <div className="mt-2 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-file text-primary"></i>
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-base-content/60">
                                    ({(file.size / (1024 * 1024)).toFixed(2)}{" "}
                                    MB)
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-xs ml-auto"
                                    onClick={() => {
                                        setFile(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = "";
                                        }
                                    }}
                                >
                                    <i className="fa-duotone fa-regular fa-times"></i>
                                </button>
                            </div>
                        )}
                    </fieldset>

                    {selectedDocType === "resume" && (
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Primary Resume
                            </legend>
                            <label className="cursor-pointer flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={setAsPrimary}
                                    onChange={(e) =>
                                        setSetAsPrimary(e.target.checked)
                                    }
                                />
                                <span>Set as primary resume</span>
                            </label>
                            <p className="fieldset-label">
                                Your primary resume will be used by default in
                                applications
                            </p>
                        </fieldset>
                    )}

                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={uploading || !file}
                        >
                            {uploading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-upload"></i>
                                    Upload
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button type="button">close</button>
            </form>
        </dialog>
    );
}
