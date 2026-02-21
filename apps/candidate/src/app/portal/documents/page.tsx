"use client";

import { useState, useRef, useEffect, Suspense, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useStandardList } from "@/hooks/use-standard-list";
import { formatDate } from "@/lib/utils";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    BaselTabBar,
    BaselEmptyState,
    BaselConfirmModal,
} from "@splits-network/basel-ui";
import BaselUploadDocumentModal from "@/components/basel/upload-document-modal";
import type { Document } from "@/lib/document-utils";

// ===== TYPES =====

interface DocumentFilters {
    document_type?: string;
}

// ===== LOADING FALLBACK =====

function DocumentsLoading() {
    return (
        <div className="min-h-screen bg-base-100">
            {/* Hero skeleton */}
            <div className="bg-neutral py-16 lg:py-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl">
                        <div className="h-4 w-32 bg-neutral-content/10 mb-6" />
                        <div className="h-12 w-80 bg-neutral-content/10 mb-4" />
                        <div className="h-6 w-64 bg-neutral-content/10" />
                    </div>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="container mx-auto px-6 lg:px-12 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                            {/* COPY: loading indicator text */}
                            Loading your documents
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===== PAGE WRAPPER =====

export default function DocumentsBaselPage() {
    return (
        <Suspense fallback={<DocumentsLoading />}>
            <DocumentsContent />
        </Suspense>
    );
}

// ===== PAGE CONTENT =====

function DocumentsContent() {
    const { getToken } = useAuth();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [candidateId, setCandidateId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [settingPrimary, setSettingPrimary] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const mainRef = useRef<HTMLElement>(null);

    // Memoize defaultFilters to prevent infinite re-renders in useStandardList
    const defaultFilters = useMemo<DocumentFilters>(() => ({}), []);

    const {
        data: documents,
        loading,
        error,
        filters,
        setFilter,
        refresh,
    } = useStandardList<Document, DocumentFilters>({
        endpoint: "/documents",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        viewModeKey: "candidateDocumentsViewMode",
    });

    // ===== HELPER FUNCTIONS =====

    const formatFileSize = (bytes?: number): string => {
        if (typeof bytes !== "number" || Number.isNaN(bytes)) return "-";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (name?: string): string => {
        if (!name) return "fa-file text-base-content";
        const lower = name.toLowerCase();
        if (lower.endsWith(".pdf")) return "fa-file-pdf text-error";
        if (lower.endsWith(".doc") || lower.endsWith(".docx"))
            return "fa-file-word text-info";
        return "fa-file text-base-content";
    };

    const getDocumentTypeLabel = (type?: string | null): string => {
        return type ? type.replace(/_/g, " ") : "unspecified";
    };

    const isPrimaryResume = (doc: Document): boolean => {
        return (
            doc.document_type === "resume" &&
            doc.metadata?.is_primary_for_candidate === true
        );
    };

    const getCandidateId = async () => {
        if (candidateId) return candidateId;

        try {
            const token = await getToken();
            if (!token) {
                console.error("No auth token available");
                return null;
            }

            const client = createAuthenticatedClient(token);
            const response = await client.get("/candidates", {
                params: { limit: 1 },
            });
            const profile = response.data?.[0];
            if (profile?.id) {
                setCandidateId(profile.id);
                return profile.id;
            }

            console.error("No candidate profile found");
            return null;
        } catch (err) {
            console.error("Failed to get candidate ID:", err);
            return null;
        }
    };

    const handleUploadClick = async () => {
        const id = await getCandidateId();
        if (!id) {
            setActionError(
                "Failed to find candidate profile. Please contact support.",
            );
            return;
        }
        setShowUploadModal(true);
    };

    const handleDelete = (documentId: string) => {
        setConfirmDelete(documentId);
    };

    const confirmDeleteAction = async () => {
        if (!confirmDelete) return;

        setDeleting(confirmDelete);
        setActionError(null);

        try {
            const token = await getToken();
            if (!token) {
                setActionError("Please sign in to delete documents");
                return;
            }

            const client = createAuthenticatedClient(token);
            await client.delete(`/documents/${confirmDelete}`);
            refresh();
        } catch (err: any) {
            console.error("Failed to delete document:", err);
            setActionError(err.message || "Failed to delete document");
        } finally {
            setDeleting(null);
            setConfirmDelete(null);
        }
    };

    const handleDownload = async (doc: Document) => {
        setActionError(null);
        try {
            const token = await getToken();
            if (!token) {
                setActionError("Please sign in to download documents");
                return;
            }

            const client = createAuthenticatedClient(token);
            const response = await client.get(`/documents/${doc.id}`);
            if (response.data?.download_url) {
                window.open(response.data.download_url, "_blank");
            } else {
                setActionError("Download URL not available");
            }
        } catch (err: any) {
            console.error("Failed to get download URL:", err);
            setActionError(err.message || "Failed to download document");
        }
    };

    const handleSetPrimary = async (documentId: string) => {
        const id = await getCandidateId();
        if (!id) {
            setActionError(
                "Failed to find candidate profile. Please contact support.",
            );
            return;
        }

        setSettingPrimary(documentId);
        setActionError(null);

        try {
            const token = await getToken();
            if (!token) {
                setActionError("Please sign in to set primary resume");
                return;
            }

            const client = createAuthenticatedClient(token);
            await client.patch(`/documents/${documentId}`, {
                metadata: {
                    is_primary_for_candidate: true,
                },
            });
            refresh();
        } catch (err: any) {
            console.error("Failed to set primary resume:", err);
            setActionError(err.message || "Failed to set primary resume");
        } finally {
            setSettingPrimary(null);
        }
    };

    // ===== FILTER / TABS =====

    const filterType = filters.document_type || "all";
    const filteredDocuments =
        filterType === "all"
            ? documents
            : documents.filter((doc) => doc.document_type === filterType);

    const docForDelete = confirmDelete
        ? documents.find((d) => d.id === confirmDelete)
        : null;

    const tabs = [
        {
            label: "All",
            value: "all",
            count: documents.length,
        },
        {
            label: "Resumes",
            value: "resume",
            count: documents.filter((d) => d.document_type === "resume").length,
        },
        {
            label: "Cover Letters",
            value: "cover_letter",
            count: documents.filter((d) => d.document_type === "cover_letter")
                .length,
        },
        {
            label: "Portfolios",
            value: "portfolio",
            count: documents.filter((d) => d.document_type === "portfolio")
                .length,
        },
        {
            label: "Other",
            value: "other",
            count: documents.filter(
                (d) =>
                    !d.document_type ||
                    !["resume", "cover_letter", "portfolio"].includes(
                        d.document_type,
                    ),
            ).length,
        },
    ];

    // ===== GSAP ANIMATION =====

    useGSAP(
        () => {
            if (!mainRef.current) return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

            if (prefersReducedMotion) {
                const hidden =
                    mainRef.current.querySelectorAll("[class*='opacity-0']");
                gsap.set(hidden, { opacity: 1 });
                return;
            }

            const $ = (sel: string) =>
                mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                mainRef.current!.querySelector(sel);

            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            // Hero kicker
            const kicker = $1(".hero-kicker");
            if (kicker) {
                tl.fromTo(
                    kicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                );
            }

            // Headline words
            const words = $(".hero-headline-word");
            if (words.length) {
                tl.fromTo(
                    words,
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 1,
                        stagger: 0.12,
                    },
                    "-=0.3",
                );
            }

            // Body text
            const body = $1(".hero-body");
            if (body) {
                tl.fromTo(
                    body,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.5",
                );
            }

            // Upload card
            const uploadCard = $1(".upload-cta");
            if (uploadCard) {
                tl.fromTo(
                    uploadCard,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.3",
                );
            }

            // Tab bar
            const tabBar = $1(".tab-bar-section");
            if (tabBar) {
                tl.fromTo(
                    tabBar,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.2",
                );
            }

            // Tips sidebar
            const tips = $1(".tips-section");
            if (tips) {
                tl.fromTo(
                    tips,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.2",
                );
            }
        },
        { scope: mainRef },
    );

    // Animate document cards when they load or filter changes
    useEffect(() => {
        if (!mainRef.current || loading || filteredDocuments.length === 0) return;

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReducedMotion) return;

        const cards = mainRef.current.querySelectorAll(".doc-card");
        if (!cards.length) return;

        gsap.fromTo(
            cards,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power3.out" },
        );
    }, [loading, filteredDocuments]);

    // ===== RENDER =====

    return (
        <main ref={mainRef} className="overflow-hidden min-h-screen bg-base-100">
            {/* ── EDITORIAL HERO ── */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                            {/* COPY: kicker label above the headline */}
                            Document Library
                        </p>

                        <h1 className="text-5xl md:text-6xl font-black leading-[0.92] tracking-tight mb-6">
                            <span className="hero-headline-word inline-block opacity-0">
                                {/* COPY: headline first segment */}
                                Every application starts
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-primary">
                                {/* COPY: headline accent segment */}
                                here.
                            </span>
                        </h1>

                        <p className="hero-body text-lg text-neutral-content/70 leading-relaxed max-w-xl mb-4 opacity-0">
                            {/* COPY: hero body paragraph */}
                            Your resumes, cover letters, and portfolios in one place.
                            Upload once, attach to any application, and keep everything
                            current so recruiters always see your best work.
                        </p>
                    </div>
                </div>

                {/* Diagonal accent */}
                <div
                    className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/5 hidden lg:block"
                    style={{
                        clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                />
            </section>

            {/* ── MAIN CONTENT ── */}
            <div className="container mx-auto px-6 lg:px-12 py-10">
                {/* Error Display */}
                {(error || actionError) && (
                    <div className="border-l-4 border-error bg-error/5 p-4 mb-8 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg" />
                        <span className="text-sm font-semibold text-error">
                            {error || actionError}
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                    {/* LEFT COLUMN — Upload + Tabs + Cards */}
                    <div>
                        {/* ── UPLOAD CTA CARD ── */}
                        <div className="upload-cta border-l-4 border-primary bg-base-100 shadow-sm p-8 mb-8 opacity-0">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-primary/10 flex items-center justify-center shrink-0">
                                    <i className="fa-duotone fa-regular fa-cloud-arrow-up text-primary text-2xl" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-black tracking-tight mb-1">
                                        {/* COPY: upload card heading */}
                                        Add to Your Library
                                    </h2>
                                    <p className="text-sm text-base-content/60 leading-relaxed">
                                        {/* COPY: upload card body text */}
                                        Resumes, cover letters, portfolios, and supporting files.
                                        Accepts PDF, DOC, DOCX, TXT, and RTF up to 10MB.
                                    </p>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm shrink-0"
                                    onClick={handleUploadClick}
                                >
                                    <i className="fa-duotone fa-regular fa-upload" />
                                    {/* COPY: upload button label */}
                                    Upload File
                                </button>
                            </div>
                        </div>

                        {/* ── TAB BAR ── */}
                        <div className="tab-bar-section border-b-2 border-base-300 mb-8 opacity-0">
                            <BaselTabBar
                                tabs={tabs}
                                active={filterType}
                                onChange={(value) =>
                                    setFilter(
                                        "document_type",
                                        value === "all" ? undefined : value,
                                    )
                                }
                            />
                        </div>

                        {/* ── LOADING STATE ── */}
                        {loading && (
                            <div className="flex items-center justify-center py-16">
                                <div className="text-center">
                                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                        {/* COPY: loading indicator */}
                                        Loading your documents
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ── DOCUMENT CARDS ── */}
                        {!loading && filteredDocuments.length > 0 && (
                            <div className="space-y-4">
                                {filteredDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="doc-card border-l-4 border-secondary shadow-sm bg-base-100 p-6"
                                    >
                                        <div className="flex items-center gap-5">
                                            {/* File icon */}
                                            <div className="w-14 h-14 bg-base-200 flex items-center justify-center shrink-0">
                                                <i
                                                    className={`fa-duotone fa-regular ${getFileIcon(doc.file_name)} text-2xl`}
                                                />
                                            </div>

                                            {/* File info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1.5">
                                                    <h3 className="font-bold text-base-content truncate">
                                                        {doc.file_name}
                                                    </h3>
                                                    {isPrimaryResume(doc) && (
                                                        <span className="bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold shrink-0">
                                                            <i className="fa-duotone fa-regular fa-star mr-1" />
                                                            {/* COPY: primary resume badge */}
                                                            Primary
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/50">
                                                    <span className="bg-base-200 px-2 py-0.5 font-semibold uppercase tracking-wider">
                                                        {getDocumentTypeLabel(
                                                            doc.document_type,
                                                        )}
                                                    </span>
                                                    <span>
                                                        <i className="fa-duotone fa-regular fa-weight-scale mr-1" />
                                                        {formatFileSize(
                                                            doc.file_size,
                                                        )}
                                                    </span>
                                                    <span>
                                                        <i className="fa-duotone fa-regular fa-calendar mr-1" />
                                                        {doc.created_at
                                                            ? formatDate(
                                                                  doc.created_at,
                                                              )
                                                            : "Unknown"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {doc.document_type === "resume" &&
                                                    !isPrimaryResume(doc) && (
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() =>
                                                                handleSetPrimary(
                                                                    doc.id,
                                                                )
                                                            }
                                                            disabled={
                                                                settingPrimary ===
                                                                doc.id
                                                            }
                                                        >
                                                            {settingPrimary ===
                                                            doc.id ? (
                                                                <span className="loading loading-spinner loading-xs" />
                                                            ) : (
                                                                <>
                                                                    <i className="fa-duotone fa-regular fa-star" />
                                                                    {/* COPY: set primary button */}
                                                                    Set Primary
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() =>
                                                        handleDownload(doc)
                                                    }
                                                >
                                                    <i className="fa-duotone fa-regular fa-download" />
                                                    {/* COPY: download button */}
                                                    Download
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm text-error"
                                                    onClick={() =>
                                                        handleDelete(doc.id)
                                                    }
                                                    disabled={
                                                        deleting === doc.id
                                                    }
                                                >
                                                    {deleting === doc.id ? (
                                                        <span className="loading loading-spinner loading-xs" />
                                                    ) : (
                                                        <i className="fa-duotone fa-regular fa-trash" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── EMPTY STATE ── */}
                        {!loading && filteredDocuments.length === 0 && (
                            <BaselEmptyState
                                icon="fa-duotone fa-regular fa-folder-open"
                                iconColor="text-secondary"
                                iconBg="bg-secondary/10"
                                title={
                                    filterType === "all"
                                        ? /* COPY: empty state title when no docs exist */
                                          "No documents yet"
                                        : /* COPY: empty state title when filtered category is empty */
                                          "Nothing here yet"
                                }
                                description={
                                    filterType === "all"
                                        ? /* COPY: empty state body for no docs */
                                          "Upload your resume to get started. Once your documents are here, you can attach them to any application in seconds."
                                        : /* COPY: empty state body for empty category */
                                          "No documents match this filter. Upload a new file or switch categories."
                                }
                                actions={
                                    filterType === "all"
                                        ? [
                                              {
                                                  /* COPY: empty state upload button */
                                                  label: "Upload Document",
                                                  style: "btn-primary",
                                                  icon: "fa-duotone fa-regular fa-upload",
                                                  onClick: handleUploadClick,
                                              },
                                          ]
                                        : undefined
                                }
                            />
                        )}
                    </div>

                    {/* RIGHT COLUMN — Tips sidebar */}
                    <div className="hidden lg:block">
                        <div className="tips-section border-l-4 border-info bg-info/5 p-6 opacity-0 sticky top-6">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-info mb-4">
                                <i className="fa-duotone fa-regular fa-lightbulb mr-2" />
                                {/* COPY: tips section kicker */}
                                Best Practices
                            </p>
                            <h3 className="text-lg font-black tracking-tight mb-4">
                                {/* COPY: tips section heading */}
                                Stronger Documents
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-sm text-base-content/60 leading-relaxed">
                                    <i className="fa-duotone fa-regular fa-check text-info mt-0.5 shrink-0" />
                                    {/* COPY: tip item 1 */}
                                    Update your resume after every role change, promotion, or major project
                                </li>
                                <li className="flex items-start gap-2 text-sm text-base-content/60 leading-relaxed">
                                    <i className="fa-duotone fa-regular fa-check text-info mt-0.5 shrink-0" />
                                    {/* COPY: tip item 2 */}
                                    Tailor cover letters to the specific role rather than using a generic template
                                </li>
                                <li className="flex items-start gap-2 text-sm text-base-content/60 leading-relaxed">
                                    <i className="fa-duotone fa-regular fa-check text-info mt-0.5 shrink-0" />
                                    {/* COPY: tip item 3 */}
                                    Name files clearly: FirstName_LastName_Resume.pdf reads better than Document_Final_v3
                                </li>
                                <li className="flex items-start gap-2 text-sm text-base-content/60 leading-relaxed">
                                    <i className="fa-duotone fa-regular fa-check text-info mt-0.5 shrink-0" />
                                    {/* COPY: tip item 4 */}
                                    PDF preserves formatting across devices. Use it whenever possible
                                </li>
                                <li className="flex items-start gap-2 text-sm text-base-content/60 leading-relaxed">
                                    <i className="fa-duotone fa-regular fa-check text-info mt-0.5 shrink-0" />
                                    {/* COPY: tip item 5 */}
                                    Set your strongest resume as primary so it auto-attaches to new applications
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── DELETE CONFIRM MODAL ── */}
            <BaselConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={confirmDeleteAction}
                title={/* COPY: delete modal title */ "Delete this document?"}
                subtitle={/* COPY: delete modal subtitle */ "Permanent Action"}
                icon="fa-trash"
                confirmLabel={/* COPY: delete confirm button */ "Delete Document"}
                cancelLabel={/* COPY: delete cancel button */ "Keep Document"}
                confirmColor="btn-error"
                confirming={!!deleting}
                confirmingLabel={/* COPY: delete confirming button */ "Deleting..."}
            >
                <p className="text-sm text-base-content/70 leading-relaxed">
                    {/* COPY: delete confirmation body */}
                    Deleting{" "}
                    <span className="font-bold text-base-content">
                        {docForDelete?.file_name ?? "this document"}
                    </span>{" "}
                    will remove it permanently. Any applications already submitted
                    with this file will not be affected.
                </p>
            </BaselConfirmModal>

            {/* ── UPLOAD MODAL ── */}
            {showUploadModal && candidateId && (
                <BaselUploadDocumentModal
                    entityType="candidate"
                    entityId={candidateId}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        refresh();
                    }}
                />
            )}
        </main>
    );
}
