"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCreateCall } from "@/hooks/use-create-call";

export default function JoinCallPage() {
    const { id } = useParams<{ id: string }>();
    const { generateToken } = useCreateCall();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        let cancelled = false;

        async function joinCall() {
            try {
                const result = await generateToken(id);
                if (cancelled) return;
                const videoBaseUrl =
                    process.env.NEXT_PUBLIC_VIDEO_APP_URL ||
                    "https://video.splits.network";
                window.location.href = `${videoBaseUrl}/join/${result.access_token}`;
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || "Failed to generate call token");
                }
            }
        }

        joinCall();
        return () => {
            cancelled = true;
        };
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <i className="fa-duotone fa-regular fa-circle-exclamation text-4xl text-error" />
                <p className="text-base-content/70">{error}</p>
                <Link href={`/portal/calls/${id}`} className="btn btn-primary btn-sm">
                    Back to Call
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="text-base-content/70">Joining call...</p>
        </div>
    );
}
