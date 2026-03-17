/**
 * Playback View Service
 *
 * Generates a signed playback URL for a recording.
 * Verifies the requesting user is a participant of the call.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BadRequestError, ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { PlaybackRepository } from './playback.repository';

const BUCKET = 'call-recordings';
const SIGNED_URL_EXPIRY_SECONDS = 3600;

export class PlaybackService {
  constructor(
    private repository: PlaybackRepository,
    private supabase: SupabaseClient,
  ) {}

  async getPlaybackUrl(id: string, clerkUserId: string) {
    // Resolve the internal user ID
    const userId = await this.repository.resolveUserId(clerkUserId);
    if (!userId) throw new NotFoundError('User');

    // Find the ready recording
    const recording = await this.repository.findReadyRecording(id);
    if (!recording) throw new BadRequestError('Recording is not available or not ready');

    // Verify participant access
    const participantUserIds = await this.repository.getCallParticipantUserIds(recording.call_id);
    if (!participantUserIds.includes(userId)) {
      throw new ForbiddenError('You are not a participant in this call');
    }

    // Generate signed URL
    const storagePath = extractStoragePath(recording.blob_url);
    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

    if (error || !data?.signedUrl) {
      throw new BadRequestError(`Failed to generate signed URL: ${error?.message || 'Unknown error'}`);
    }

    return {
      url: data.signedUrl,
      expires_at: new Date(Date.now() + SIGNED_URL_EXPIRY_SECONDS * 1000).toISOString(),
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
