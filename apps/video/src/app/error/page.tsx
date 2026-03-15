import { ErrorPage } from '@/components/error-page';
import { JoinError } from '@/lib/types';

interface ErrorRouteProps {
    searchParams: Promise<{ reason?: string }>;
}

const REASON_MAP: Record<string, JoinError['type']> = {
    invalid: 'invalid',
    expired: 'expired',
    'not-started': 'not-started',
};

const ERROR_MESSAGES: Record<JoinError['type'], string> = {
    invalid: 'This call link is invalid or has already been used.',
    expired: 'This call link has expired. Please request a new link.',
    'not-started': 'This call has not started yet.',
    unknown: 'An unexpected error occurred. Please try again.',
};

export default async function ErrorRoute({ searchParams }: ErrorRouteProps) {
    const { reason } = await searchParams;
    const errorType = (reason && REASON_MAP[reason]) || 'unknown';

    const error: JoinError = {
        type: errorType,
        message: ERROR_MESSAGES[errorType],
    };

    return <ErrorPage error={error} />;
}
