export type UserType = 'recruiter' | 'company_admin' | 'hiring_manager' | 'candidate' | 'anonymous';

export const ALL_USER_TYPES: UserType[] = ['recruiter', 'company_admin', 'hiring_manager', 'candidate', 'anonymous'];
export const ALL_APPS = ['portal', 'candidate', 'corporate'] as const;

export interface HeartbeatPayload {
    session_id: string;
    user_id?: string;
    user_type?: UserType;
    app: 'portal' | 'candidate' | 'corporate';
    page: string;
    status: 'active' | 'idle';
}

export interface TimelinePoint {
    minute: string;
    count: number;
}

export interface ActivitySnapshot {
    total_online: number;
    by_app: { portal: number; candidate: number; corporate: number };
    by_role: Record<UserType, number>;
    authenticated: number;
    anonymous: number;
    timeline: TimelinePoint[];
    timeline_by_app: Record<string, TimelinePoint[]>;
    timeline_by_role: Record<string, TimelinePoint[]>;
    timestamp: string;
}
