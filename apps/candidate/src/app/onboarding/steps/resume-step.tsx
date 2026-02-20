"use client";

/**
 * Step 3: Resume Upload (Basel Edition)
 * Optional resume upload to /documents endpoint via FormData.
 */

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type {
    CandidateOnboardingState,
    CandidateOnboardingActions,
} from "../types";

const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.txt";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ResumeStepProps {
    state: CandidateOnboardingState;
    actions: CandidateOnboardingActions;
}

export function ResumeStep({ state, actions }: ResumeStepProps) {
    const { getToken } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileSelect = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ];
        if (!validTypes.includes(file.type)) {
            setUploadError("Please upload a PDF, DOC, DOCX, or TXT file");
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setUploadError("File size must be less than 10MB");
            return;
        }

        setUploadError(null);
        setUploading(true);

        try {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");

            const apiClient = createAuthenticatedClient(token);

            if (!state.candidateId) {
                throw new Error("No candidate ID available for file upload");
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("entity_type", "candidate");
            formData.append("entity_id", state.candidateId);
            formData.append("document_type", "resume");

            const response = await apiClient.post("/documents", formData);

            const documentId = response.data?.id || response.id;
            actions.updateProfileData({
                resumeFile: file,
                resumeUploaded: true,
                resumeDocumentId: documentId,
            });
        } catch (error) {
            console.error("[ResumeStep] Upload failed:", error);
            setUploadError(
                error instanceof Error
                    ? error.message
                    : "Failed to upload resume",
            );
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = async () => {
        if (state.profileData.resumeDocumentId) {
            try {
                const token = await getToken();
                if (token) {
                    const apiClient = createAuthenticatedClient(token);
                    await apiClient.delete(
                        `/documents/${state.profileData.resumeDocumentId}`,
                    );
                }
            } catch (error) {
                console.error(
                    "[ResumeStep] Failed to delete document:",
                    error,
                );
            }
        }

        actions.updateProfileData({
            resumeFile: null,
            resumeUploaded: false,
            resumeDocumentId: undefined,
        });
        setUploadError(null);
    };

    const hasUploadedResume =
        state.profileData.resumeUploaded && state.profileData.resumeFile;

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Step 3
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-1">
                Upload Your Resume
            </h1>
            <p className="text-base-content/50 mb-8">
                A resume helps recruiters understand your experience. This step
                is optional.
            </p>

            {/* Upload Area */}
            <div className="mb-6">
                {hasUploadedResume ? (
                    <div className="border-2 border-success border-dashed p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-success/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-file-check text-2xl text-success" />
                                </div>
                                <div>
                                    <p className="font-semibold truncate max-w-[200px]">
                                        {state.profileData.resumeFile?.name}
                                    </p>
                                    <p className="text-xs text-base-content/50">
                                        {state.profileData.resumeFile?.size
                                            ? `${(state.profileData.resumeFile.size / 1024).toFixed(1)} KB`
                                            : "Uploaded"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm btn-square"
                                onClick={handleRemoveFile}
                                title="Remove file"
                            >
                                <i className="fa-duotone fa-regular fa-xmark" />
                            </button>
                        </div>
                        <p className="text-xs text-success mt-3 text-center">
                            <i className="fa-solid fa-check mr-1" />
                            Resume uploaded successfully
                        </p>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-base-300 p-8 hover:border-primary/50 transition-colors">
                        <div className="text-center">
                            {uploading ? (
                                <>
                                    <span className="loading loading-spinner loading-lg text-primary" />
                                    <p className="mt-3 text-sm text-base-content/60">
                                        Uploading your resume...
                                    </p>
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-cloud-arrow-up text-4xl text-base-content/30" />
                                    <p className="mt-3 text-sm">
                                        <label className="link link-primary cursor-pointer font-semibold">
                                            Click to upload
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept={ACCEPTED_FILE_TYPES}
                                                onChange={handleFileSelect}
                                                disabled={uploading}
                                            />
                                        </label>{" "}
                                        or drag and drop
                                    </p>
                                    <p className="text-xs text-base-content/40 mt-1">
                                        PDF, DOC, DOCX, or TXT &mdash; Max 10MB
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {uploadError && (
                    <div className="border-l-4 border-error bg-error/5 p-4 mt-4 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error" />
                        <span className="text-sm">{uploadError}</span>
                    </div>
                )}
            </div>

            {/* Info note */}
            <div className="border-l-4 border-info bg-info/5 p-5 mb-6">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-lightbulb text-info text-lg mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold">No resume ready?</h4>
                        <p className="text-xs text-base-content/50 mt-1">
                            No problem. You can skip this step and upload your
                            resume later from your profile page.
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-base-300">
                <button
                    className="btn btn-ghost"
                    onClick={() => actions.setStep(2)}
                    disabled={state.submitting}
                >
                    <i className="fa-solid fa-arrow-left text-xs" /> Back
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => actions.setStep(4)}
                    disabled={state.submitting}
                >
                    Continue
                    <i className="fa-solid fa-arrow-right text-xs" />
                </button>
            </div>
        </div>
    );
}
