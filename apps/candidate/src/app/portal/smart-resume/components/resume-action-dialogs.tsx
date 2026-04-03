"use client";

import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

export interface ResumeActionDialogsHandle {
    openParse: () => void;
    openGenerate: () => void;
}

interface ResumeActionDialogsProps {
    candidateId: string | null;
    onImportComplete: () => Promise<void>;
    onGenerateResume: (jobId: string) => Promise<any>;
}

const ACCEPTED_TYPES = ".pdf,.doc,.docx,.md,.txt";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/markdown",
    "text/x-markdown",
    "text/plain",
];

export const ResumeActionDialogs = forwardRef<
    ResumeActionDialogsHandle,
    ResumeActionDialogsProps
>(function ResumeActionDialogs({ candidateId, onImportComplete, onGenerateResume }, ref) {
    const { getToken } = useAuth();
    const parseDialogRef = useRef<HTMLDialogElement>(null);
    const generateDialogRef = useRef<HTMLDialogElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [stage, setStage] = useState<"select" | "uploading" | "processing" | "enriching">("select");

    const [jobId, setJobId] = useState("");
    const [generating, setGenerating] = useState(false);

    useImperativeHandle(ref, () => ({
        openParse: () => {
            setFile(null);
            setUploadError(null);
            setStage("select");
            parseDialogRef.current?.showModal();
        },
        openGenerate: () => generateDialogRef.current?.showModal(),
    }));

    const isValidFile = (f: File): boolean => {
        if (VALID_MIME_TYPES.includes(f.type)) return true;
        // Browsers often report empty or generic mime types for .md/.txt files
        const ext = f.name.split(".").pop()?.toLowerCase();
        return ["md", "txt", "pdf", "doc", "docx"].includes(ext || "");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (!isValidFile(selected)) {
            setUploadError("Please upload a PDF, DOCX, Markdown, or TXT file");
            return;
        }
        if (selected.size > MAX_FILE_SIZE) {
            setUploadError("File must be less than 10MB");
            return;
        }

        setUploadError(null);
        setFile(selected);
    };

    const handleUploadAndParse = async () => {
        if (!file || !candidateId) return;

        setUploading(true);
        setUploadError(null);

        try {
            // Step 1: Upload the file
            setStage("uploading");
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("entity_type", "candidate");
            formData.append("entity_id", candidateId);
            formData.append("document_type", "resume");

            const uploadResult = await client.post("/documents", formData);
            const documentId = uploadResult.data?.id || uploadResult.id;

            if (!documentId) throw new Error("Upload succeeded but no document ID returned");

            // Step 2: Wait for document processing (virus scan + text extraction + smart resume population)
            setStage("processing");
            await waitForDocumentProcessing(documentId);

            // Done — document-processing-service already populated smart_resume tables via officeparser
            // Just notify parent to refresh the profile data
            await onImportComplete();

            parseDialogRef.current?.close();
            setFile(null);
            setStage("select");
        } catch (err: any) {
            console.error("Upload/parse failed:", err);
            setUploadError(err.message || "Failed to process resume");
            setStage("select");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0];
        if (!dropped) return;

        if (!isValidFile(dropped)) {
            setUploadError("Please upload a PDF, DOCX, Markdown, or TXT file");
            return;
        }
        if (dropped.size > MAX_FILE_SIZE) {
            setUploadError("File must be less than 10MB");
            return;
        }

        setUploadError(null);
        setFile(dropped);
    };

    const handleGenerate = async () => {
        if (!jobId.trim()) return;
        setGenerating(true);
        try {
            await onGenerateResume(jobId.trim());
            generateDialogRef.current?.close();
            setJobId("");
        } catch (err) {
            console.error("Generate failed:", err);
        } finally {
            setGenerating(false);
        }
    };

    const waitForDocumentProcessing = async (documentId: string) => {
        const MAX_POLLS = 40; // 40 × 3s = 120s max wait
        const POLL_INTERVAL = 3000;

        for (let i = 0; i < MAX_POLLS; i++) {
            const token = await getToken();
            if (!token) throw new Error("Authentication expired. Please try again.");
            const client = createAuthenticatedClient(token);

            const result = await client.get(`/documents/${documentId}`);
            const doc = result.data || result;
            const status = doc.processing_status;

            if (status === "processed") return;
            if (status === "failed") throw new Error("Document processing failed. Please try a different file.");

            // Show enriching stage in UI
            if (status === "enriching") {
                setStage("enriching");
            }

            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        }

        throw new Error("Document processing timed out. Please try again.");
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <>
            {/* Hidden file input — lives outside dialogs to prevent auto-trigger */}
            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Upload & Parse Dialog */}
            <dialog ref={parseDialogRef} className="modal">
                <div className="modal-box bg-base-100 max-w-md p-0">
                    <div className="border-b border-base-300 px-6 py-4">
                        <h3 className="text-lg font-black tracking-tight">
                            Import Resume
                        </h3>
                        <p className="text-sm text-base-content/50 mt-1">
                            Upload a PDF or Word document to populate your Smart Resume
                        </p>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        {/* Progress indicator when processing */}
                        {uploading && (
                            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20">
                                <span className="loading loading-spinner loading-md text-primary" />
                                <div>
                                    <p className="font-semibold text-sm">
                                        {stage === "uploading" && "Uploading document..."}
                                        {stage === "processing" && "Processing your resume..."}
                                        {stage === "enriching" && "Building your Smart Resume..."}
                                    </p>
                                    <p className="text-xs text-base-content/50">
                                        {stage === "uploading" && "Sending your file securely"}
                                        {stage === "processing" && "Scanning and extracting text"}
                                        {stage === "enriching" && "AI is structuring your experience, skills, and education"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* File drop zone */}
                        {!uploading && (
                            <>
                                <div
                                    className={`border-2 border-dashed p-8 text-center transition-colors
                                        ${file ? "border-primary bg-primary/5" : "border-base-300"}`}
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept={ACCEPTED_TYPES}
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />

                                    {file ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <i className="fa-duotone fa-regular fa-file-pdf text-2xl text-primary" />
                                            <div className="text-left">
                                                <p className="font-semibold text-sm truncate max-w-[250px]">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-base-content/50">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-xs btn-square ml-2"
                                                onClick={() => setFile(null)}
                                            >
                                                <i className="fa-duotone fa-regular fa-xmark" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-cloud-arrow-up text-3xl text-base-content/30 mb-3 block" />
                                            <p className="text-sm font-semibold">
                                                Drop your resume here
                                            </p>
                                            <p className="text-xs text-base-content/40 mt-1">
                                                PDF, DOCX, Markdown, or TXT — max 10MB
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm mt-3"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <i className="fa-duotone fa-regular fa-folder-open" />
                                                Browse files
                                            </button>
                                        </>
                                    )}
                                </div>

                                {uploadError && (
                                    <div className="text-sm text-error flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-circle-exclamation" />
                                        {uploadError}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Actions */}
                        {!uploading && (
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => parseDialogRef.current?.close()}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleUploadAndParse}
                                    disabled={!file}
                                >
                                    <i className="fa-duotone fa-regular fa-wand-magic-sparkles" />
                                    Import Resume
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button type="submit">close</button>
                </form>
            </dialog>

            {/* Generate Tailored Resume Dialog */}
            <dialog ref={generateDialogRef} className="modal">
                <div className="modal-box bg-base-100 max-w-sm p-0">
                    <div className="border-b border-base-300 px-6 py-4">
                        <h3 className="text-lg font-black tracking-tight">
                            Generate Tailored Resume
                        </h3>
                    </div>
                    <div className="px-6 py-4 space-y-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Job ID</legend>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="Enter the job ID to tailor for"
                                value={jobId}
                                onChange={(e) => setJobId(e.target.value)}
                            />
                            <p className="fieldset-label">
                                AI will generate a resume tailored to this specific job.
                            </p>
                        </fieldset>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => generateDialogRef.current?.close()}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleGenerate}
                                disabled={generating || !jobId.trim()}
                            >
                                {generating ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    "Generate"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button type="submit">close</button>
                </form>
            </dialog>
        </>
    );
});
