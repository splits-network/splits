'use client';

type MatchOverviewProps = {
    match: {
        id: string;
        candidate_name: string;
        candidate_email: string;
        job_title: string;
        company: string;
        score: number;
        status: string;
        created_at: string;
        updated_at: string;
    };
};

const SCORE_COLOR = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
};

const STATUS_BADGE: Record<string, string> = {
    pending: 'badge-warning',
    accepted: 'badge-success',
    rejected: 'badge-error',
    expired: 'badge-ghost',
};

export function MatchOverview({ match }: MatchOverviewProps) {
    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body gap-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold">{match.candidate_name}</h2>
                        <p className="text-sm text-base-content/60">{match.candidate_email}</p>
                    </div>
                    <span className={`badge ${STATUS_BADGE[match.status] ?? 'badge-ghost'}`}>
                        {match.status}
                    </span>
                </div>

                <div className="divider my-0" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-base-content/50 font-medium">Job</p>
                        <p className="font-semibold">{match.job_title}</p>
                    </div>
                    <div>
                        <p className="text-base-content/50 font-medium">Company</p>
                        <p className="font-semibold">{match.company}</p>
                    </div>
                    <div>
                        <p className="text-base-content/50 font-medium">Created</p>
                        <p>{new Date(match.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-base-content/50 font-medium">Updated</p>
                        <p>{new Date(match.updated_at).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="divider my-0" />

                <div>
                    <p className="text-base-content/50 font-medium text-sm mb-2">Overall Score</p>
                    <div className="flex items-center gap-3">
                        <progress
                            className={`progress flex-1 h-3 ${match.score >= 80 ? 'progress-success' : match.score >= 60 ? 'progress-warning' : 'progress-error'}`}
                            value={match.score}
                            max={100}
                        />
                        <span className={`text-2xl font-black ${SCORE_COLOR(match.score)}`}>
                            {match.score}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
