export interface HeartbeatPayload {
    session_id: string;
    user_id?: string;
    app: 'portal' | 'candidate' | 'corporate';
    page: string;
    status: 'active' | 'idle';
}

export interface ActivitySnapshot {
    total_online: number;
    by_app: { portal: number; candidate: number; corporate: number };
    authenticated: number;
    anonymous: number;
    timeline: { minute: string; count: number }[];
    timestamp: string;
}
