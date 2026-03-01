"use client";

import { useState } from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";

interface ThreadComposeProps {
    draft: string;
    onDraftChange: (value: string) => void;
    onSend: () => void;
    sending: boolean;
    disabled: boolean;
    placeholderText: string;
}

export function ThreadCompose({
    draft,
    onDraftChange,
    onSend,
    sending,
    disabled,
    placeholderText,
}: ThreadComposeProps) {
    const [useMarkdown, setUseMarkdown] = useState(false);

    return (
        <div className="border-t border-base-300 bg-base-100 p-4 mt-auto">
            <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-2 relative">
                    {useMarkdown ? (
                        <MarkdownEditor
                            className="flex-1"
                            value={draft}
                            onChange={onDraftChange}
                            height={140}
                            preview="edit"
                            disabled={disabled}
                            placeholder={placeholderText}
                        />
                    ) : (
                        <textarea
                            className="textarea w-full"
                            value={draft}
                            onChange={(e) => onDraftChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    onSend();
                                }
                            }}
                            rows={5}
                            disabled={disabled}
                            placeholder={placeholderText}
                        />
                    )}
                    <button
                        className="btn btn-primary btn-square btn-soft absolute bottom-4 right-2"
                        onClick={onSend}
                        disabled={disabled || sending}
                        title="Send message"
                    >
                        <i className="fa-duotone fa-paper-plane" />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
                <label className="label cursor-pointer gap-2">
                    <input
                        type="checkbox"
                        className="toggle toggle-sm"
                        checked={useMarkdown}
                        onChange={(e) => setUseMarkdown(e.target.checked)}
                        disabled={disabled}
                    />
                    <span className="label-text text-sm">Markdown editor</span>
                </label>
            </div>
        </div>
    );
}
