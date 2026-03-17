interface AIPipelineStatusProps {
    status: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; type: 'loading' | 'error' }> = {
    pending: { label: 'Preparing transcription...', type: 'loading' },
    transcribing: { label: 'Transcribing audio...', type: 'loading' },
    summarizing: { label: 'Generating summary...', type: 'loading' },
    posting: { label: 'Posting to notes...', type: 'loading' },
    failed: { label: 'Transcription failed', type: 'error' },
};

export function AIPipelineStatus({ status }: AIPipelineStatusProps) {
    if (!status || status === 'complete') return null;

    const config = STATUS_CONFIG[status];
    if (!config) return null;

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-base-200 text-sm">
            {config.type === 'loading' ? (
                <span className="loading loading-spinner loading-xs text-secondary" />
            ) : (
                <i className="fa-duotone fa-regular fa-triangle-exclamation text-error" />
            )}
            <span className={config.type === 'error' ? 'text-error' : 'text-base-content/70'}>
                {config.label}
            </span>
        </div>
    );
}
