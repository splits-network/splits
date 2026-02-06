"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts/user-profile-context";

export default function DetailDocuments({
    candidateId,
}: {
    candidateId: string;
}) {
    const { getToken } = useAuth();
    const { isRecruiter } = useUserProfile();
    const [document, setDocument] = useState<any>();
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        if (!document?.download_url) return;

        setDownloading(true);
        try {
            const response = await fetch(document.download_url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = window.document.createElement("a");
            link.href = url;
            link.download = document.filename || "resume";
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        const fetchDocs = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = await getToken();
                if (!token) {
                    setError("Authentication required");
                    return;
                }
                const client = createAuthenticatedClient(token);

                try {
                    const data = await client.get(
                        `/candidates/${candidateId}/primary-resume`,
                    );
                    setDocument(data.data);
                } catch (candidateError) {
                    console.log("Candidate endpoint failed:", candidateError);
                }
            } catch (e) {
                // Check if it's a network error or API error
                if (e instanceof Error) {
                    console.error("Error message:", e.message);
                    setError(`Failed to load documents: ${e.message}`);
                } else {
                    setError("Failed to load documents");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [candidateId, getToken]);

    return (
        <section className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="p-4 border-b border-base-200 bg-base-200/30">
                <h3 className="font-semibold flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-file-lines text-secondary"></i>
                    Resume
                </h3>
            </div>

            <div className="p-4">
                {loading && (
                    <div className="skeleton h-16 w-full rounded-xl"></div>
                )}

                {error && (
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {!loading && !error && !document && (
                    <div className="p-8 text-center text-sm text-base-content/60">
                        No resume attached
                    </div>
                )}

                {!loading && !error && document && (
                    <div className="space-y-3">
                        {(() => {
                            const isPdf =
                                document.content_type?.includes("pdf");
                            const fileSize = document.file_size
                                ? `${(document.file_size / 1024).toFixed(0)} KB`
                                : "";
                            return (
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 group">
                                        <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform">
                                            <i
                                                className={`fa-duotone fa-regular fa-file-${isPdf ? "pdf text-error" : "word text-info"}`}
                                            ></i>
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="text-sm font-medium truncate">
                                                {document.filename}
                                            </div>
                                            {fileSize && (
                                                <div className="text-xs text-base-content/50">
                                                    {fileSize}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className="btn"
                                    >
                                        {downloading ? (
                                            <span className="loading loading-spinner loading-sm text-primary"></span>
                                        ) : (
                                            <i className="fa-duotone fa-regular fa-download text-base-content/40 group-hover:text-primary"></i>
                                        )}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {!loading && !isRecruiter && (
                    <button className="mt-3 w-full border border-dashed border-base-300 rounded-xl p-3 hover:border-primary/50 hover:bg-base-50 transition-all text-center flex items-center justify-center gap-2 text-base-content/50 hover:text-primary">
                        <i className="fa-duotone fa-regular fa-plus"></i>
                        <span className="text-xs font-medium">
                            Upload Resume
                        </span>
                    </button>
                )}
            </div>
        </section>
    );
}
