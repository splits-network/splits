import type { Metadata } from 'next';
import { InterviewClient } from './interview-client';

export const metadata: Metadata = {
    title: 'Interview | Splits Network',
};

export default async function CandidateInterviewPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    return <InterviewClient magicToken={token} />;
}
