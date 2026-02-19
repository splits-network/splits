"use client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselFileUploadProps {
    /** Currently uploaded file name (null when empty) */
    file?: string | null;
    /** Called when a file is selected or cleared */
    onFileChange: (file: string | null) => void;
    /** Accepted file types hint text (default: "PDF, DOC up to 10MB") */
    acceptHint?: string;
    /** Upload prompt text (default: "Click to upload or drag and drop") */
    prompt?: string;
    /** Additional className on the upload zone */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel file upload — dashed-border upload zone with empty and uploaded states.
 * Click toggles between upload and remove.
 */
export function BaselFileUpload({
    file,
    onFileChange,
    acceptHint = "PDF, DOC up to 10MB",
    prompt = "Click to upload or drag and drop",
    className,
}: BaselFileUploadProps) {
    const handleClick = () => {
        onFileChange(file ? null : "uploaded-file");
    };

    return (
        <div
            className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                file
                    ? "border-success bg-success/5"
                    : "border-base-300 hover:border-primary/50 bg-base-200"
            } ${className || ""}`}
            onClick={handleClick}
        >
            {file ? (
                <div className="flex items-center justify-center gap-3">
                    <i className="fa-duotone fa-regular fa-file-pdf text-success text-xl" />
                    <span className="text-sm font-semibold text-success">
                        {file}
                    </span>
                    <span className="text-xs text-base-content/40">
                        Click to remove
                    </span>
                </div>
            ) : (
                <>
                    <i className="fa-duotone fa-regular fa-cloud-arrow-up text-2xl text-base-content/30 mb-2" />
                    <p className="text-sm text-base-content/50">{prompt}</p>
                    <p className="text-[10px] text-base-content/30 mt-1">
                        {acceptHint}
                    </p>
                </>
            )}
        </div>
    );
}
