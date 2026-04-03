"use client";

/**
 * Step 2: Import Smart Resume
 * Upload a resume file → AI extracts into Smart Resume tables.
 * Reuses the same upload + poll pattern as resume-action-dialogs.
 */

import { useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type {
    CandidateOnboardingState,
    CandidateOnboardingActions,
} from "../types";

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

type ProcessingStage = "idle" | "uploading" | "processing" | "enriching" | "done";

interface ResumeStepProps {
    state: CandidateOnboardingState;
    actions: CandidateOnboardingActions;
}

function isValidFile(f: File): boolean {
    if (VALID_MIME_TYPES.includes(f.type)) return true;
    const ext = f.name.split(".").pop()?.toLowerCase();
    return ["md", "txt", "pdf", "doc", "docx"].includes(ext || "");
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeStep({ state, actions }: ResumeStepProps) {
    const { getToken } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [stage, setStage] = useState<ProcessingStage>("idle");
    const [error, setError] = useState<string | null>(null);

    const isProcessing = stage !== "idle" && stage !== "done";

    const validateAndSetFile = (f: File) => {
        if (!isValidFile(f)) {
            setError("Please upload a PDF, DOCX, Markdown, or TXT file");
            return;
        }
        if (f.size > MAX_FILE_SIZE) {
            setError("File must be less than 10MB");
            return;
        }
        setError(null);
        setFile(f);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) validateAndSetFile(selected);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) validateAndSetFile(dropped);
    };

    const waitForProcessing = async (documentId: string) => {
        const MAX_POLLS = 40;
        const POLL_INTERVAL = 3000;

        for (let i = 0; i < MAX_POLLS; i++) {
            const token = await getToken();
            if (!token) throw new Error("Authentication expired");
            const client = createAuthenticatedClient(token);

            const result = await client.get(`/documents/${documentId}`);
            const doc = result.data || result;
            const status = doc.processing_status;

            if (status === "processed") return;
            if (status === "failed")
                throw new Error("Processing failed. Please try a different file.");
            if (status === "enriching") setStage("enriching");

            await new Promise((r) => setTimeout(r, POLL_INTERVAL));
        }

        throw new Error("Processing timed out. Please try again.");
    };

    const handleImport = async () => {
        if (!file || !state.candidateId) return;

        setError(null);

        try {
            setStage("uploading");
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("entity_type", "candidate");
            formData.append("entity_id", state.candidateId);
            formData.append("document_type", "resume");

            const uploadResult = await client.post("/documents", formData);
            const documentId = uploadResult.data?.id || uploadResult.id;
            if (!documentId) throw new Error("Upload succeeded but no document ID returned");

            setStage("processing");
            await waitForProcessing(documentId);

            actions.updateProfileData({
                resumeFile: file,
                resumeUploaded: true,
                resumeDocumentId: documentId,
            });

            setStage("done");
        } catch (err: any) {
            console.error("[ResumeStep] Import failed:", err);
            setError(err.message || "Failed to process resume");
            setStage("idle");
        }
    };

    // After successful import, show success state
    if (stage === "done") {
        return (
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                    Smart Resume
                </p>
                <h1 className="text-3xl font-black tracking-tight mb-2">
                    Your Smart Resume is ready
                </h1>
                <p className="text-base-content/50 mb-8">
                    We extracted your experiences, skills, education, and more.
                    You can review and refine everything from your Smart Resume page.
                </p>

                <div className="bg-success/5 border border-success/20 p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-success/10 flex items-center justify-center shrink-0">
                            <i className="fa-duotone fa-regular fa-circle-check text-success text-2xl" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Resume imported successfully</p>
                            <p className="text-xs text-base-content/50 mt-0.5">
                                {file?.name}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-l-4 border-info bg-info/5 p-5 mb-6">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-lightbulb text-info text-lg mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold">What's next?</h4>
                            <p className="text-xs text-base-content/50 mt-1">
                                Your Smart Resume powers every application. When you apply
                                to a role, our AI automatically tailors it for that specific
                                position.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-base-300">
                    <button
                        className="btn btn-ghost"
                        onClick={() => {
                            setStage("idle");
                            setFile(null);
                        }}
                    >
                        <i className="fa-solid fa-arrow-left text-xs" /> Import a different resume
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => actions.submitOnboarding()}
                        disabled={state.submitting}
                    >
                        {state.submitting ? (
                            <span className="loading loading-spinner loading-sm" />
                        ) : (
                            <>
                                Continue
                                <i className="fa-solid fa-arrow-right text-xs" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Smart Resume
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2">
                Import Your Resume
            </h1>
            <p className="text-base-content/50 mb-8">
                Upload an existing resume and our AI will extract your career
                history into a structured Smart Resume.
            </p>

            {/* Processing indicator */}
            {isProcessing && (
                <div className="p-6 bg-primary/5 border border-primary/20 mb-6">
                    <div className="flex items-center gap-4">
                        <span className="loading loading-spinner loading-lg text-primary" />
                        <div>
                            <p className="font-bold text-sm">
                                {stage === "uploading" && "Uploading your resume..."}
                                {stage === "processing" && "Processing your resume..."}
                                {stage === "enriching" && "Building your Smart Resume..."}
                            </p>
                            <p className="text-xs text-base-content/50 mt-0.5">
                                {stage === "uploading" && "Sending your file securely"}
                                {stage === "processing" && "Scanning and extracting text"}
                                {stage === "enriching" && "AI is structuring your experience, skills, and education"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* File drop zone */}
            {!isProcessing && (
                <>
                    <div
                        className={`border-2 border-dashed p-8 text-center transition-colors mb-4 ${
                            file ? "border-primary bg-primary/5" : "border-base-300 hover:border-primary/50"
                        }`}
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
                                <i className="fa-duotone fa-regular fa-cloud-arrow-up text-4xl text-base-content/30 mb-3 block" />
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

                    {error && (
                        <div className="border-l-4 border-error bg-error/5 p-4 mb-4 flex items-center gap-3">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-error" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {file && (
                        <button
                            type="button"
                            className="btn btn-primary w-full mb-6"
                            onClick={handleImport}
                        >
                            <i className="fa-duotone fa-regular fa-wand-magic-sparkles" />
                            Import Resume
                        </button>
                    )}
                </>
            )}

            {/* Skip note */}
            {!isProcessing && (
                <div className="border-l-4 border-info bg-info/5 p-5 mb-6">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-lightbulb text-info text-lg mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold">No resume handy?</h4>
                            <p className="text-xs text-base-content/50 mt-1">
                                No problem. You can skip this step and build your Smart
                                Resume manually from your dashboard, or import one later.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            {!isProcessing && (
                <div className="flex items-center justify-between pt-6 border-t border-base-300">
                    <button
                        className="btn btn-ghost"
                        onClick={() => actions.setStep(1)}
                        disabled={state.submitting}
                    >
                        <i className="fa-solid fa-arrow-left text-xs" /> Back
                    </button>
                    <button
                        className="btn btn-ghost text-base-content/40"
                        onClick={() => actions.submitOnboarding()}
                        disabled={state.submitting}
                    >
                        {state.submitting ? (
                            <span className="loading loading-spinner loading-sm" />
                        ) : (
                            <>
                                Skip for now
                                <i className="fa-solid fa-forward text-xs" />
                            </>
                        )}
                    </button>
                </div>
            )}

            {state.error && (
                <div className="border-l-4 border-error bg-error/5 p-4 mt-4 flex items-center gap-3">
                    <i className="fa-duotone fa-regular fa-circle-exclamation text-error" />
                    <span className="text-sm">{state.error}</span>
                </div>
            )}
        </div>
    );
}
