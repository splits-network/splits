import { redirect } from 'next/navigation';
import { JoinFlow } from '@/components/join-flow';

interface JoinPageProps {
    params: Promise<{ token: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
    const { token } = await params;

    // Validate token has minimum length (access tokens are 64-char hex strings)
    if (!token || token.length < 32) {
        redirect('/error?reason=invalid');
    }

    return <JoinFlow token={token} />;
}
