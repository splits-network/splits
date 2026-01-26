"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RoleHeader from "./components/role-header";
import RoleDetailsTabs from "./components/role-details-tabs";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import Link from "next/link";
import { PageTitle } from "@/components/page-title";

interface Job {
    id: string;
    title: string;
    job_requirements: Array<{
        id: string;
        description: string;
        requirement_type: "required" | "preferred";
    }>;
}

export default function RoleDetailPage() {
    const params = useParams();
    const { getToken } = useAuth();
    const id = params.id as string;
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadJob() {
            try {
                setLoading(true);
                const token = await getToken();
                if (!token) {
                    console.error("No auth token available");
                    return;
                }

                const client = createAuthenticatedClient(token);
                const response = await client.get(`/jobs/${id}`, {
                    params: { include: "job_requirements" },
                });

                setJob(response.data);
            } catch (error) {
                console.error("Error loading job:", error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            loadJob();
        }
    }, [id, getToken]);

    return (
        <>
            <PageTitle title={job?.title || "Role Details"} />
            <div className="flex">
                <div className="text-sm breadcrumbs py-4">
                    <ul>
                        <li>
                            <a href="/portal/dashboard">Dashboard</a>
                        </li>
                        <li>
                            <Link href="/portal/roles">Roles</Link>
                        </li>
                        <li>
                            {loading
                                ? "Loading..."
                                : job?.title || "Role Details"}
                        </li>
                    </ul>
                </div>
            </div>
            <div>
                <div className="space-y-6">
                    <RoleHeader roleId={id} />
                    <RoleDetailsTabs roleId={id} />
                </div>
            </div>
        </>
    );
}
