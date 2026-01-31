'use client';

import Link from 'next/link';

interface ResourceItem {
    title: string;
    description: string;
    icon: string;
    href: string;
    color: string;
}

const RESOURCES: ResourceItem[] = [
    {
        title: 'Career Guides',
        description: 'Expert advice on career growth',
        icon: 'fa-book-open',
        href: '/public/resources/career-guides',
        color: 'text-primary',
    },
    {
        title: 'Salary Insights',
        description: 'Know your market value',
        icon: 'fa-chart-line',
        href: '/public/resources/salary-insights',
        color: 'text-success',
    },
    {
        title: 'Interview Prep',
        description: 'Ace your next interview',
        icon: 'fa-clipboard-question',
        href: '/public/resources/interview-prep',
        color: 'text-info',
    },
    {
        title: 'Success Stories',
        description: 'Get inspired by others',
        icon: 'fa-trophy',
        href: '/public/resources/success-stories',
        color: 'text-warning',
    },
];

interface ResourcesHubProps {
    compact?: boolean;
}

export default function ResourcesHub({ compact = false }: ResourcesHubProps) {
    if (compact) {
        return (
            <div className="space-y-2">
                {RESOURCES.map((resource) => (
                    <Link
                        key={resource.href}
                        href={resource.href}
                        className="block p-2 bg-base-100 rounded-lg hover:bg-base-200/70 hover:shadow transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <i className={`fa-duotone fa-regular ${resource.icon} ${resource.color} text-sm`}></i>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">{resource.title}</div>
                            </div>
                            <i className="fa-duotone fa-regular fa-chevron-right text-[10px] text-base-content/30"></i>
                        </div>
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3">
            {RESOURCES.map((resource) => (
                <Link
                    key={resource.href}
                    href={resource.href}
                    className="block p-3 bg-base-100 rounded-lg hover:bg-base-200/70 hover:shadow-md hover:border-primary/30 border border-transparent transition-all group"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0 group-hover:bg-base-300 transition-colors">
                            <i className={`fa-duotone fa-regular ${resource.icon} ${resource.color} text-lg`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-0.5 group-hover:text-primary transition-colors">
                                {resource.title}
                            </h4>
                            <p className="text-xs text-base-content/60 line-clamp-1">
                                {resource.description}
                            </p>
                        </div>
                        <i className="fa-duotone fa-regular fa-chevron-right text-xs text-base-content/30 group-hover:text-primary transition-colors flex-shrink-0 mt-1"></i>
                    </div>
                </Link>
            ))}
        </div>
    );
}
