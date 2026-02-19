'use client';

import Link from 'next/link';
import { Badge } from '@splits-network/memphis-ui';
import { useRoleBreakdown } from '../hooks/use-role-breakdown';
import { MemphisCard, MemphisEmpty, MemphisSkeleton, MemphisBtn } from './primitives';
import { ACCENT } from './accent';

interface CompanyRolesTableProps {
    refreshKey?: number;
    onPostRole?: () => void;
}

export default function CompanyRolesTable({ refreshKey, onPostRole }: CompanyRolesTableProps) {
    const { roles, loading, error } = useRoleBreakdown();

    const headerRight = (
        <MemphisBtn href="/portal/roles" accent={ACCENT[1]} variant="ghost" size="sm">
            View All <i className="fa-duotone fa-regular fa-arrow-right" />
        </MemphisBtn>
    );

    if (loading) {
        return (
            <MemphisCard title="Active Roles Pipeline" icon="fa-list-check" accent={ACCENT[0]} headerRight={headerRight}>
                <MemphisSkeleton count={5} />
            </MemphisCard>
        );
    }

    if (error || roles.length === 0) {
        return (
            <MemphisCard title="Active Roles Pipeline" icon="fa-list-check" accent={ACCENT[0]} headerRight={headerRight}>
                <MemphisEmpty
                    icon="fa-briefcase"
                    title="No active roles"
                    description="Create your first role to start receiving candidates."
                    action={
                        onPostRole ? (
                            <MemphisBtn onClick={onPostRole} accent={ACCENT[0]}>
                                <i className="fa-duotone fa-regular fa-plus" /> Post Role
                            </MemphisBtn>
                        ) : undefined
                    }
                />
            </MemphisCard>
        );
    }

    return (
        <MemphisCard title="Active Roles Pipeline" icon="fa-list-check" accent={ACCENT[0]} headerRight={headerRight}>
            <div className="overflow-x-auto -mx-5 max-h-[520px] overflow-y-auto">
                <table className="w-full">
                    <thead className="sticky top-0 z-10">
                        <tr className="border-b-4 border-dark bg-base-100">
                            <th className="text-left px-5 py-2 text-[10px] font-black uppercase tracking-widest text-dark/50">
                                Role
                            </th>
                            <th className="text-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-dark/50">
                                Apps
                            </th>
                            <th className="text-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-dark/50">
                                Interviews
                            </th>
                            <th className="text-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-dark/50">
                                Offers
                            </th>
                            <th className="text-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-dark/50">
                                Hires
                            </th>
                            <th className="text-center px-5 py-2 text-[10px] font-black uppercase tracking-widest text-dark/50">
                                Days
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role) => (
                            <tr key={role.id} className="border-b border-dark/10 hover:bg-dark/5 transition-colors">
                                <td className="px-5 py-3">
                                    <Link href={`/portal/roles/${role.id}`} className="hover:text-coral transition-colors">
                                        <div className="text-sm font-bold text-dark line-clamp-1">{role.title}</div>
                                        <div className="text-[10px] text-dark/40 flex items-center gap-1 mt-0.5">
                                            <i className="fa-duotone fa-regular fa-location-dot text-[8px]" />
                                            {role.location}
                                        </div>
                                    </Link>
                                </td>
                                <td className="text-center px-3 py-3">
                                    <Badge color="dark" variant="soft" size="xs">
                                        {role.applications_count}
                                    </Badge>
                                </td>
                                <td className="text-center px-3 py-3">
                                    <Badge color="teal" variant="soft" size="xs">
                                        {role.interview_count}
                                    </Badge>
                                </td>
                                <td className="text-center px-3 py-3">
                                    <Badge color="yellow" variant="soft" size="xs">
                                        {role.offer_count}
                                    </Badge>
                                </td>
                                <td className="text-center px-3 py-3">
                                    <Badge color="purple" variant="soft" size="xs">
                                        {role.hire_count}
                                    </Badge>
                                </td>
                                <td className="text-center px-5 py-3">
                                    <span className={`text-sm font-bold tabular-nums ${role.days_open > 60 ? 'text-coral' : 'text-dark/50'}`}>
                                        {role.days_open}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </MemphisCard>
    );
}
