'use client';

export type MatchFactor = {
    label: string;
    score: number;
    weight: number;
    explanation?: string;
};

type MatchFactorsProps = {
    factors: MatchFactor[];
};

const FACTOR_COLOR = (score: number) => {
    if (score >= 80) return 'progress-success';
    if (score >= 60) return 'progress-warning';
    return 'progress-error';
};

const SCORE_TEXT_COLOR = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
};

function FactorRow({ factor }: { factor: MatchFactor }) {
    return (
        <div className="flex flex-col gap-1.5 py-3 border-b border-base-200 last:border-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{factor.label}</span>
                    <span className="badge badge-ghost badge-xs">
                        weight: {Math.round(factor.weight * 100)}%
                    </span>
                </div>
                <span className={`text-sm font-bold ${SCORE_TEXT_COLOR(factor.score)}`}>
                    {factor.score}%
                </span>
            </div>
            <progress
                className={`progress w-full h-2 ${FACTOR_COLOR(factor.score)}`}
                value={factor.score}
                max={100}
            />
            {factor.explanation && (
                <p className="text-sm text-base-content/50">{factor.explanation}</p>
            )}
        </div>
    );
}

export function MatchFactors({ factors }: MatchFactorsProps) {
    if (factors.length === 0) {
        return (
            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body">
                    <h3 className="text-base font-bold mb-2">Factor Breakdown</h3>
                    <p className="text-sm text-base-content/50">No factor data available for this match.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body gap-0">
                <h3 className="text-base font-bold mb-2">Factor Breakdown</h3>
                {factors.map((factor) => (
                    <FactorRow key={factor.label} factor={factor} />
                ))}
            </div>
        </div>
    );
}
