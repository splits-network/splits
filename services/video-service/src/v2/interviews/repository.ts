import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    Interview,
    InterviewParticipant,
    InterviewAccessToken,
    InterviewWithParticipants,
    InterviewWithContext,
    InterviewParticipantWithUser,
    InterviewStatus,
} from './types';

export class InterviewRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    async createInterview(input: {
        application_id: string;
        room_name: string;
        status: InterviewStatus;
        interview_type: string;
        title: string | null;
        scheduled_at: string;
        scheduled_duration_minutes: number;
        max_duration_seconds: number;
        grace_period_seconds: number;
        metadata: Record<string, any> | null;
        created_by: string;
    }): Promise<Interview> {
        const { data, error } = await this.supabase
            .from('interviews')
            .insert(input)
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as Interview;
    }

    async addParticipants(
        interviewId: string,
        participants: Array<{ user_id: string; role: string }>,
    ): Promise<InterviewParticipant[]> {
        const rows = participants.map((p) => ({
            interview_id: interviewId,
            user_id: p.user_id,
            role: p.role,
        }));

        const { data, error } = await this.supabase
            .from('interview_participants')
            .insert(rows)
            .select();

        if (error) {
            throw error;
        }
        return (data || []) as InterviewParticipant[];
    }

    async createAccessToken(
        interviewId: string,
        participantId: string,
        token: string,
    ): Promise<InterviewAccessToken> {
        const { data, error } = await this.supabase
            .from('interview_access_tokens')
            .insert({
                interview_id: interviewId,
                participant_id: participantId,
                token,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as InterviewAccessToken;
    }

    async findById(id: string): Promise<Interview | null> {
        const { data, error } = await this.supabase
            .from('interviews')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            throw error;
        }
        return data as Interview | null;
    }

    async findByIdWithParticipants(id: string): Promise<InterviewWithParticipants | null> {
        const { data: interview, error: interviewError } = await this.supabase
            .from('interviews')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (interviewError) {
            throw interviewError;
        }
        if (!interview) {
            return null;
        }

        const { data: participants, error: participantsError } = await this.supabase
            .from('interview_participants')
            .select('*')
            .eq('interview_id', id)
            .order('created_at', { ascending: true });

        if (participantsError) {
            throw participantsError;
        }

        return {
            ...(interview as Interview),
            participants: (participants || []) as InterviewParticipant[],
        };
    }

    async findByIdWithContext(id: string): Promise<InterviewWithContext | null> {
        // Fetch the interview
        const { data: interview, error: interviewError } = await this.supabase
            .from('interviews')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (interviewError) {
            throw interviewError;
        }
        if (!interview) {
            return null;
        }

        // Fetch job and company info via application
        const { data: application, error: appError } = await this.supabase
            .from('applications')
            .select('job_id')
            .eq('id', interview.application_id)
            .maybeSingle();

        if (appError) {
            throw appError;
        }

        let job = { id: '', title: 'Interview', company_name: '' };

        if (application?.job_id) {
            const { data: jobRow, error: jobError } = await this.supabase
                .from('jobs')
                .select('id, title, company_id')
                .eq('id', application.job_id)
                .maybeSingle();

            if (jobError) {
                throw jobError;
            }

            if (jobRow) {
                job.id = jobRow.id;
                job.title = jobRow.title || 'Interview';

                if (jobRow.company_id) {
                    const { data: company, error: companyError } = await this.supabase
                        .from('companies')
                        .select('id, name')
                        .eq('id', jobRow.company_id)
                        .maybeSingle();

                    if (companyError) {
                        throw companyError;
                    }

                    job.company_name = company?.name || '';
                }
            }
        }

        // Fetch participants with user details
        const { data: participants, error: participantsError } = await this.supabase
            .from('interview_participants')
            .select('*')
            .eq('interview_id', id)
            .order('created_at', { ascending: true });

        if (participantsError) {
            throw participantsError;
        }

        const userIds = (participants || []).map((p: InterviewParticipant) => p.user_id);
        let userMap = new Map<string, { name: string; profile_image_url: string | null }>();

        if (userIds.length > 0) {
            const { data: users, error: usersError } = await this.supabase
                .from('users')
                .select('id, name, profile_image_url')
                .in('id', userIds);

            if (usersError) {
                throw usersError;
            }

            for (const user of users || []) {
                userMap.set(user.id, {
                    name: user.name || '',
                    profile_image_url: user.profile_image_url || null,
                });
            }
        }

        const enrichedParticipants: InterviewParticipantWithUser[] = (participants || []).map(
            (p: InterviewParticipant) => {
                const user = userMap.get(p.user_id);
                return {
                    ...p,
                    name: user?.name || '',
                    avatar_url: user?.profile_image_url || null,
                };
            },
        );

        return {
            ...(interview as Interview),
            job,
            participants: enrichedParticipants,
        };
    }

    async findByApplicationId(
        applicationId: string,
        options?: { status?: InterviewStatus; limit?: number; offset?: number },
    ): Promise<{ data: Interview[]; total: number }> {
        let query = this.supabase
            .from('interviews')
            .select('*', { count: 'exact' })
            .eq('application_id', applicationId)
            .order('scheduled_at', { ascending: false });

        if (options?.status) {
            query = query.eq('status', options.status);
        }

        const limit = options?.limit ?? 25;
        const offset = options?.offset ?? 0;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        return {
            data: (data || []) as Interview[],
            total: count || 0,
        };
    }

    async findAccessTokenByToken(token: string): Promise<{
        accessToken: InterviewAccessToken;
        interview: Interview;
        participant: InterviewParticipant;
    } | null> {
        const { data: tokenRow, error: tokenError } = await this.supabase
            .from('interview_access_tokens')
            .select('*')
            .eq('token', token)
            .maybeSingle();

        if (tokenError) {
            throw tokenError;
        }
        if (!tokenRow) {
            return null;
        }

        const accessToken = tokenRow as InterviewAccessToken;

        const { data: interview, error: interviewError } = await this.supabase
            .from('interviews')
            .select('*')
            .eq('id', accessToken.interview_id)
            .maybeSingle();

        if (interviewError) {
            throw interviewError;
        }
        if (!interview) {
            return null;
        }

        const { data: participant, error: participantError } = await this.supabase
            .from('interview_participants')
            .select('*')
            .eq('id', accessToken.participant_id)
            .maybeSingle();

        if (participantError) {
            throw participantError;
        }
        if (!participant) {
            return null;
        }

        return {
            accessToken,
            interview: interview as Interview,
            participant: participant as InterviewParticipant,
        };
    }

    async updateRoomName(id: string, roomName: string): Promise<void> {
        const { error } = await this.supabase
            .from('interviews')
            .update({ room_name: roomName, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            throw error;
        }
    }

    async updateStatus(
        id: string,
        status: InterviewStatus,
        extraFields?: Partial<Pick<Interview, 'actual_start_at' | 'actual_end_at' | 'cancellation_reason'>>,
    ): Promise<Interview> {
        const updates: Record<string, any> = {
            status,
            updated_at: new Date().toISOString(),
            ...extraFields,
        };

        const { data, error } = await this.supabase
            .from('interviews')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as Interview;
    }

    async updateParticipantJoined(participantId: string): Promise<InterviewParticipant> {
        const { data, error } = await this.supabase
            .from('interview_participants')
            .update({ joined_at: new Date().toISOString() })
            .eq('id', participantId)
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as InterviewParticipant;
    }

    async updateParticipantLeft(participantId: string): Promise<InterviewParticipant> {
        const { data, error } = await this.supabase
            .from('interview_participants')
            .update({ left_at: new Date().toISOString() })
            .eq('id', participantId)
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data as InterviewParticipant;
    }
}
