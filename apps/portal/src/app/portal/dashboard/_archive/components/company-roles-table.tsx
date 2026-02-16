'use client';

import Link from 'next/link';
import { useRoleBreakdown } from '../hooks/use-role-breakdown';
import { ContentCard, EmptyState } from '@/components/ui/cards';
import { SkeletonList } from '@splits-network/shared-ui';

interface CompanyRolesTableProps {
    refreshKey?: number;
    onPostRole?: () => void;
}

export default function CompanyRolesTable({ refreshKey, onPostRole }: CompanyRolesTableProps) {
    const { roles, loading, error } = useRoleBreakdown();

    if (loading) {
        return (
            <ContentCard title="Active roles pipeline" icon="fa-list-check" className="bg-base-200">
                <SkeletonList count={5} variant="text-block" gap="gap-3" />
            </ContentCard>
        );
    }

    if (error || roles.length === 0) {
        return (
            <ContentCard title="Active roles pipeline" icon="fa-list-check" className="bg-base-200">
                <EmptyState
                    icon="fa-briefcase"
                    title="No active roles"
                    description="Create your first role to start receiving candidates from the recruiter marketplace."
                    size="sm"
                    action={
                        onPostRole ? (
                            <button onClick={onPostRole} className="btn btn-primary btn-sm">
                                <i className="fa-duotone fa-regular fa-plus mr-1"></i>
                                Post Role
                            </button>
                        ) : undefined
                    }
                />
            </ContentCard>
        );
    }

    return (
        <ContentCard
            title="Active roles pipeline"
            icon="fa-list-check"
            className="bg-base-200"
            headerActions={
                <Link href="/portal/roles" className="btn btn-sm btn-ghost text-xs">
                    View all roles
                    <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                </Link>
            }
        >
            <div className="overflow-x-auto -mx-4 sm:-mx-6 max-h-[520px] overflow-y-auto">
                <table className="table table-sm">
                    <thead className="sticky top-0 z-10 bg-base-200">
                        <tr className="border-b border-base-300/50">
                            <th className="bg-base-200 text-xs font-medium uppercase tracking-wider text-base-content/60">Role</th>
                            <th className="bg-base-200 text-center text-xs font-medium uppercase tracking-wider text-base-content/60">Apps</th>
                            <th className="bg-base-200 text-center text-xs font-medium uppercase tracking-wider text-base-content/60">Interviews</th>
                            <th className="bg-base-200 text-center text-xs font-medium uppercase tracking-wider text-base-content/60">Offers</th>
                            <th className="bg-base-200 text-center text-xs font-medium uppercase tracking-wider text-base-content/60">Hires</th>
                            <th className="bg-base-200 text-center text-xs font-medium uppercase tracking-wider text-base-content/60">Days Open</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role) => (
                            <tr key={role.id} className="hover:bg-base-300/30 transition-colors">
                                <td>
                                    <Link href={`/portal/roles/${role.id}`} className="hover:text-primary transition-colors">
                                        <div className="font-semibold text-sm line-clamp-1">{role.title}</div>
                                        <div className="text-xs text-base-content/60 flex items-center gap-1 line-clamp-1">
                                            <i className="fa-duotone fa-regular fa-location-dot text-[10px]"></i>
                                            {role.location}
                                        </div>
                                    </Link>
                                </td>
                                <td className="text-center">
                                    <span className="badge badge-sm badge-ghost tabular-nums">{role.applications_count}</span>
                                </td>
                                <td className="text-center">
                                    <span className="badge badge-sm badge-info badge-outline tabular-nums">{role.interview_count}</span>
                                </td>
                                <td className="text-center">
                                    <span className="badge badge-sm badge-success badge-outline tabular-nums">{role.offer_count}</span>
                                </td>
                                <td className="text-center">
                                    <span className="badge badge-sm badge-primary badge-outline tabular-nums">{role.hire_count}</span>
                                </td>
                                <td className="text-center">
                                    <span className={`text-sm tabular-nums ${role.days_open > 60 ? 'text-warning font-semibold' : 'text-base-content/70'}`}>
                                        {role.days_open}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ContentCard>
    );
}
