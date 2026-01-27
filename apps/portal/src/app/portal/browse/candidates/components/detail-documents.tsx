"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

export default function DetailDocuments({
    candidateId,
}: {
    candidateId: string;
}) {
    const { getToken } = useAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            setLoading(true);
            try {
                // Fetch logic here
                // const res = await client.get('/documents?candidate_id=' + candidateId);
                // setDocuments(res.data);
                setDocuments([]);
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
                    Documents
                </h3>
            </div>

            <div className="p-4">
                {loading && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="skeleton h-24 w-full rounded-xl"></div>
                        <div className="skeleton h-24 w-full rounded-xl"></div>
                    </div>
                )}

                {!loading && documents.length === 0 && (
                    <div className="p-8 text-center text-sm text-base-content/60">
                        No documents attached
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {documents.map((doc) => (
                        <a key={doc.id} href={doc.url} className="block group">
                            <div className="border border-base-200 rounded-xl p-3 hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                                <div className="mb-2 text-3xl opacity-80 group-hover:scale-110 transition-transform">
                                    <i
                                        className={`fa-duotone fa-regular fa-file-${doc.type === "pdf" ? "pdf text-error" : "word text-info"}`}
                                    ></i>
                                </div>
                                <div className="text-sm font-medium truncate px-2">
                                    {doc.name}
                                </div>
                                <div className="text-xs text-base-content/50">
                                    {doc.size}
                                </div>
                            </div>
                        </a>
                    ))}

                    {!loading && (
                        <button className="border border-dashed border-base-300 rounded-xl p-3 hover:border-primary/50 hover:bg-base-50 transition-all text-center flex flex-col items-center justify-center gap-2 text-base-content/50 hover:text-primary h-full min-h-[100px]">
                            <i className="fa-duotone fa-regular fa-plus text-xl"></i>
                            <span className="text-xs font-medium">
                                Add File
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
