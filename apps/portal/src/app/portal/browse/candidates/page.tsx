import { Metadata } from "next";
import CandidateBrowseClient from "./components/candidate-browse-client";
import { PageTitle } from "@/components/page-title";

export const metadata: Metadata = {
    title: "Browse Candidates | Splits Network",
    description: "Browse and manage your candidate pipeline",
};

export default function CandidateBrowsePage() {
    return (
        <>
            <PageTitle
                title="Candidate Browser"
                subtitle="Browse and manage your candidate pipeline"
            />
            <CandidateBrowseClient />
        </>
    );
}
