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
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get(
                    `/documents?entity_type=candidate&entity_id=${candidateId}&document_type=resume`
                );
                const docs = res?.data ?? [];
                const primaryResume = docs.find(
                    (doc: any) =>
                        doc.metadata?.is_primary === true ||
                        doc.metadata?.is_primary_for_candidate === true
                );
                setDocuments(primaryResume ? [primaryResume] : []);
            } catch (e) {
                console.error(e);
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

                {!loading && documents.length === 0 && (
                    <div className="p-8 text-center text-sm text-base-content/60">
                        No resume attached
                    </div>
                )}

                {!loading && documents.length > 0 && (
                    <div className="space-y-3">
                        {documents.map((doc) => {
                            const isPdf = doc.mime_type?.includes("pdf");
                            const fileSize = doc.file_size
                                ? `${(doc.file_size / 1024).toFixed(0)} KB`
                                : "";
                            return (
                                <a
                                    key={doc.id}
                                    href={doc.download_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 border border-base-200 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                >
                                    <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform">
                                        <i
                                            className={`fa-duotone fa-regular fa-file-${isPdf ? "pdf text-error" : "word text-info"}`}
                                        ></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">
                                            {doc.file_name}
                                        </div>
                                        {fileSize && (
                                            <div className="text-xs text-base-content/50">
                                                {fileSize}
                                            </div>
                                        )}
                                    </div>
                                    <i className="fa-duotone fa-regular fa-download text-base-content/40 group-hover:text-primary"></i>
                                </a>
                            );
                        })}
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
