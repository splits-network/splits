"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import ActionsToolbar from "../shared/actions-toolbar";
import type { Job } from "../../types";

interface DetailHeaderProps {
    id: string;
    onClose: () => void;
}

export default function DetailHeader({ id, onClose }: DetailHeaderProps) {
    const [item, setItem] = useState<Job | null>(null);

    const fetchItem = useCallback(async () => {
        if (!id) return;
        try {
            const response: any = await apiClient.get(`/jobs/${id}`);
            setItem(response.data);
        } catch (err) {
            console.error("Failed to fetch job for header:", err);
        }
    }, [id]);

    useEffect(() => {
        fetchItem();
    }, [fetchItem]);

    return (
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
            <div className="flex items-center justify-between">
                {/* Back button (mobile) */}
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-ghost md:hidden"
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    Back
                </button>

                <h2 className="text-lg font-bold hidden md:block">
                    <i className="fa-duotone fa-regular fa-briefcase mr-2" />
                    Job Details
                </h2>

                <div className="flex items-center gap-2">
                    {item && (
                        <ActionsToolbar item={item} variant="descriptive" />
                    )}
                </div>
            </div>
        </div>
    );
}
