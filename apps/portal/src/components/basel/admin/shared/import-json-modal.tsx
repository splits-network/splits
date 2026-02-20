"use client";

import { useState, useRef } from "react";

interface ImportJsonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: unknown) => void;
    title: string;
    description: string;
    placeholder?: string;
}

export function ImportJsonModal({
    isOpen,
    onClose,
    onImport,
    title,
    description,
    placeholder,
}: ImportJsonModalProps) {
    const [jsonText, setJsonText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    function handleParse() {
        setError(null);
        try {
            const parsed = JSON.parse(jsonText);
            onImport(parsed);
            setJsonText("");
            setError(null);
        } catch (e) {
            setError(
                `Invalid JSON: ${e instanceof Error ? e.message : "Parse error"}`,
            );
        }
    }

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setJsonText(text);
            setError(null);
        };
        reader.onerror = () => setError("Failed to read file");
        reader.readAsText(file);

        // Reset input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleClose() {
        setJsonText("");
        setError(null);
        onClose();
    }

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={handleClose}
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <h3 className="font-bold text-lg mb-1">{title}</h3>
                <p className="text-sm text-base-content/60 mb-4">
                    {description}
                </p>

                {/* File upload */}
                <div className="mb-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="file-input file-input-bordered file-input-sm w-full"
                    />
                </div>

                <div className="divider text-xs text-base-content/40">
                    or paste JSON
                </div>

                {/* JSON textarea */}
                <textarea
                    className="textarea textarea-bordered w-full font-mono text-xs leading-relaxed"
                    rows={14}
                    value={jsonText}
                    onChange={(e) => {
                        setJsonText(e.target.value);
                        setError(null);
                    }}
                    placeholder={placeholder || '{\n  "title": "...",\n  "blocks": [...]\n}'}
                />

                {error && (
                    <div className="mt-2 text-sm text-error flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        {error}
                    </div>
                )}

                <div className="modal-action">
                    <button className="btn btn-ghost btn-sm" onClick={handleClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleParse}
                        disabled={!jsonText.trim()}
                    >
                        <i className="fa-duotone fa-regular fa-file-import mr-1"></i>
                        Import
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={handleClose}>close</button>
            </form>
        </dialog>
    );
}
