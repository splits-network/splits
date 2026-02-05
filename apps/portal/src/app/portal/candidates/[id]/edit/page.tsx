import { Suspense } from 'react';
import EditCandidateClient from './components/edit-candidate-client';
import { LoadingState } from '@splits-network/shared-ui';

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<LoadingState message="Loading candidate..." />}>
                <EditCandidateClient candidateId={id} />
            </Suspense>
        </div>
    );
}
