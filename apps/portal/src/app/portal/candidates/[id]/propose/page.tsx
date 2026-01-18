import ProposeJobClient from './components/propose-job-client';

interface ProposeJobPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProposeJobPage({ params }: ProposeJobPageProps) {
    const { id } = await params;

    return <ProposeJobClient candidateId={id} />;
}
