"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import ActionsToolbar from "../shared/actions-toolbar";
import { useFilter } from "../../contexts/filter-context";
import type { Application } from "../../types";

interface DetailHeaderProps {
    id: string;
    onClose: () => void;
}

export default function DetailHeader({ id, onClose }: DetailHeaderProps) {
    const { getToken } = useAuth();
    const { refresh } = useFilter();
    const [item, setItem] = useState<Application | null>(null);

    const fetchItem = useCallback(async () => {
        if (!id) return;
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const response: any = await client.get(`/applications/${id}`, {
                params: { include: "job,recruiter,ai_review" },
            });
            setItem(response.data);
        } catch (err) {
            console.error("Failed to fetch application for header:", err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    <i className="fa-duotone fa-regular fa-file-lines mr-2" />
                    Application Details
                </h2>

                <div className="flex items-center gap-2">
                    {item && (
                        <ActionsToolbar
                            item={item}
                            variant="descriptive"
                            onStageChange={() => {
                                refresh();
                                fetchItem();
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
