import { use } from 'react';
import JobDetailClient from './job-detail-client';

interface Props {
    params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: Props) {
    const { id } = use(params);
    return <JobDetailClient jobId={id} />;
}
