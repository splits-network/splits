'use client';

import { ProfileCompleteness } from '@/lib/utils/profile-completeness';

interface Props {
    completeness: ProfileCompleteness;
    tierConfig: {
        title: string;
        subtitle: string;
        color: string;
        benefits: string[];
    };
}

export default function ProfileCompletenessIndicator({ completeness, tierConfig }: Props) {
    return (
        <div className="card card-border">
            <div className="card-body">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Progress Ring */}
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                        <div
                            className={`radial-progress text-${tierConfig.color}`}
                            style={{ '--value': completeness.percentage, '--size': '10rem', '--thickness': '0.5rem' } as any}
                            role="progressbar"
                            aria-valuenow={completeness.percentage}
                        >
                            <div className="text-center">
                                <div className="text-3xl font-bold">{completeness.percentage}%</div>
                                <div className={`badge badge-${tierConfig.color} badge-sm mt-1`}>
                                    {completeness.tier.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-2xl font-bold">{tierConfig.title}</h3>
                            <p className="text-base-content/70">{tierConfig.subtitle}</p>
                        </div>

                        <div className="space-y-2">
                            {tierConfig.benefits.map((benefit: string, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    <span className="text-sm">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        {completeness.missingFields.length > 0 && (
                            <div className="mt-4">
                                <p className="font-semibold text-sm mb-2">Top fields to complete:</p>
                                <div className="space-y-1">
                                    {completeness.missingFields.map((field: any) => (
                                        <div key={field.name} className="text-sm">
                                            <span className="badge badge-ghost badge-sm">+{field.weight}%</span>
                                            <span className="ml-2">{field.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
