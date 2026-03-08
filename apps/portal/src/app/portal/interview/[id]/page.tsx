import type { Metadata } from 'next';
import { InterviewClient } from './interview-client';

export const metadata: Metadata = {
    title: 'Interview | Splits Network',
};

export default async function InterviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <InterviewClient interviewId={id} />;
}
