"use client";

import { useState, useEffect, useRef } from "react";
import type { CallTranscript } from "../../hooks/use-call-detail";

interface TranscriptTabProps {
    transcript?: CallTranscript | null;
    currentTimestamp: number;
    onTimestampSeek: (ts: number) => void;
}

/** Parsed transcript line from storage */
interface TranscriptLine {
    timestamp: number;
    speaker: string;
    text: string;
}

export function TranscriptTab({
    transcript,
    currentTimestamp,
    onTimestampSeek,
}: TranscriptTabProps) {
    const [lines, setLines] = useState<TranscriptLine[]>([]);
    const [search, setSearch] = useState("");
    const [loadError, setLoadError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLDivElement>(null);

    // Load transcript content from storage URL
    useEffect(() => {
        if (!transcript || transcript.transcript_status !== "ready") return;
        if (!transcript.storage_url) return;

        fetch(transcript.storage_url)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch transcript");
                return res.json();
            })
            .then((data: TranscriptLine[]) => {
                setLines(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setLoadError("Could not load transcript content.");
            });
    }, [transcript]);

    // Auto-scroll to active line
    useEffect(() => {
        if (activeLineRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [currentTimestamp]);

    // No transcript
    if (!transcript) {
        return (
            <div className="border-2 border-base-300 p-8 text-center">
                <i className="fa-duotone fa-regular fa-file-lines text-4xl text-base-content/15 mb-4 block" />
                <p className="text-sm text-base-content/50">
                    No transcript available for this call.
                </p>
            </div>
        );
    }

    // Processing
    if (
        transcript.transcript_status === "pending" ||
        transcript.transcript_status === "processing"
    ) {
        return (
            <div className="border-2 border-base-300 p-8 text-center">
                <span className="loading loading-spinner loading-md text-primary mb-4 block" />
                <p className="font-bold mb-1">Transcript Processing</p>
                <p className="text-sm text-base-content/50">
                    The transcript is being generated and will appear here when
                    ready.
                </p>
            </div>
        );
    }

    // Failed
    if (transcript.transcript_status === "failed") {
        return (
            <div className="border-2 border-base-300 p-8 text-center">
                <i className="fa-duotone fa-regular fa-triangle-exclamation text-4xl text-error/30 mb-4 block" />
                <p className="font-bold mb-1">Transcript Failed</p>
                <p className="text-sm text-base-content/50">
                    {transcript.error || "Transcription could not be completed."}
                </p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="border-2 border-base-300 p-8 text-center">
                <p className="text-sm text-error">{loadError}</p>
            </div>
        );
    }

    // Filter lines by search
    const filteredLines = search
        ? lines.filter(
              (l) =>
                  l.text.toLowerCase().includes(search.toLowerCase()) ||
                  l.speaker.toLowerCase().includes(search.toLowerCase())
          )
        : lines;

    // Find active line index (closest line at or before currentTimestamp)
    const activeIndex = findActiveLineIndex(filteredLines, currentTimestamp);

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
                <label className="input w-full flex items-center gap-2" style={{ borderRadius: 0 }}>
                    <i className="fa-duotone fa-regular fa-search text-base-content/30" />
                    <input
                        type="text"
                        className="grow"
                        placeholder="Search transcript..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setSearch("")}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}
                </label>
                <span className="text-sm text-base-content/40 whitespace-nowrap">
                    {filteredLines.length} line{filteredLines.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Transcript lines */}
            <div
                ref={containerRef}
                className="border-2 border-base-300 max-h-[500px] overflow-y-auto"
            >
                {filteredLines.length === 0 ? (
                    <div className="p-8 text-center text-sm text-base-content/50">
                        {search
                            ? "No matching lines found."
                            : "Transcript is empty."}
                    </div>
                ) : (
                    <div className="divide-y divide-base-300">
                        {filteredLines.map((line, i) => {
                            const isActive = i === activeIndex;
                            return (
                                <div
                                    key={i}
                                    ref={isActive ? activeLineRef : undefined}
                                    className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-base-200/50 ${
                                        isActive
                                            ? "bg-primary/5 border-l-4 border-primary"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        onTimestampSeek(line.timestamp)
                                    }
                                >
                                    {/* Timestamp */}
                                    <span className="text-sm text-primary font-mono whitespace-nowrap pt-0.5">
                                        {formatTimestamp(line.timestamp)}
                                    </span>
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-bold text-base-content/70">
                                            {line.speaker}
                                        </span>
                                        <p className="text-sm mt-0.5">
                                            {line.text}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function findActiveLineIndex(
    lines: TranscriptLine[],
    timestamp: number
): number {
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].timestamp <= timestamp) idx = i;
        else break;
    }
    return idx;
}

function formatTimestamp(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
