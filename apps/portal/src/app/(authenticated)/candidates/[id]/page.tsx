import CandidateDetailClient from './candidate-detail-client';

interface CandidateDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function CandidateDetailPage({ params }: CandidateDetailPageProps) {
    const { id } = await params;

    return <CandidateDetailClient candidateId={id} />;
}
