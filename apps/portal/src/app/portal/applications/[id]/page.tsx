"use client";

import { useParams } from "next/navigation";
import ApplicationDetailClient from "./components/application-detail-client";
import { PageTitle } from "@/components/page-title";

export default function ApplicationDetailPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <>
            <PageTitle title="Application Details" />
            <ApplicationDetailClient applicationId={id} />
        </>
    );
}
