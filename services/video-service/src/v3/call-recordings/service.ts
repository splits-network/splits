/**
 * Call Recordings V3 Service
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CallRecordingRepository } from './repository';
import { CallRecordingListParams } from './types';

const BUCKET = 'call-recordings';

export class CallRecordingService {
  constructor(
    private repository: CallRecordingRepository,
    private supabase: SupabaseClient,
  ) {}

  async list(params: CallRecordingListParams, clerkUserId: string) {
    const userId = await this.repository.resolveUserId(clerkUserId);
    const { data, total } = await this.repository.list(params);

    // Filter to recordings where user is a participant on the call
    const callIds = [...new Set(data.map((r: any) => r.call_id))];
    const participantCalls = new Set<string>();

    for (const callId of callIds) {
      const participants = await this.repository.getCallParticipants(callId);
      if (participants.some((p: any) => p.user_id === userId)) {
        participantCalls.add(callId);
      }
    }

    const filtered = data.filter((r: any) => participantCalls.has(r.call_id));
    const p = params.page || 1;
    const l = params.limit || 25;

    return {
      data: filtered,
      pagination: { total, page: p, limit: l, total_pages: Math.ceil(total / l) },
    };
  }

  async getPlaybackUrl(callId: string, clerkUserId: string, recordingId?: string) {
    const userId = await this.repository.resolveUserId(clerkUserId);
    const participants = await this.repository.getCallParticipants(callId);

    if (!participants.some((p: any) => p.user_id === userId)) {
      throw Object.assign(new Error('You are not a participant in this call'), { statusCode: 403 });
    }

    const blobUrl = await this.repository.findReadyRecording(callId, recordingId);
    const storagePath = extractStoragePath(blobUrl);
    const expiresIn = 3600;

    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data?.signedUrl) {
      throw Object.assign(
        new Error(`Failed to generate signed URL: ${error?.message || 'Unknown error'}`),
        { statusCode: 500 },
      );
    }

    return {
      url: data.signedUrl,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };
  }
}

function extractStoragePath(blobUrl: string): string {
  if (!blobUrl.startsWith('http')) return blobUrl;
  try {
    const parsed = new URL(blobUrl);
    const pathParts = parsed.pathname.split('/');
    const bucketIndex = pathParts.indexOf(BUCKET);
    if (bucketIndex !== -1) return pathParts.slice(bucketIndex + 1).join('/');
    return pathParts.slice(-3).join('/');
  } catch {
    return blobUrl;
  }
}
