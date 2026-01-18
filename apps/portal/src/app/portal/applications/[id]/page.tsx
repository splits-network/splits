'use client';

import { useParams } from 'next/navigation';
import ApplicationDetailClient from './components/application-detail-client';

export default function ApplicationDetailPage() {
    const params = useParams();
    const id = params.id as string;

    return <ApplicationDetailClient applicationId={id} />;
}
