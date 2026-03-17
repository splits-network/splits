/**
 * Chat Attachment Storage Client
 *
 * Wraps Supabase Storage for signed upload/download URLs.
 * Ported from V2: services/chat-service/src/v2/chat/storage.ts
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class AttachmentStorageClient {
  constructor(
    private supabase: SupabaseClient,
    private bucket: string,
  ) {}

  async createSignedUploadUrl(path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUploadUrl(path, { upsert: false });

    if (error) {
      throw new Error(`Failed to create signed upload URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  async createSignedDownloadUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed download URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  async removeFile(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete attachment: ${error.message}`);
    }
  }
}
