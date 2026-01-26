import CandidateDetailClient from "./components/candidate-detail-client";
import { PageTitle } from "@/components/page-title";

interface CandidateDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function CandidateDetailPage({
    params,
}: CandidateDetailPageProps) {
    const { id } = await params;

    return (
        <>
            <PageTitle title="Candidate Details" />
            <CandidateDetailClient candidateId={id} />
        </>
    );
}
