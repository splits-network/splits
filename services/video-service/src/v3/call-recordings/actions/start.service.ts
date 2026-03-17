/**
 * Start Recording Action Service
 *
 * Creates a recording row and starts a LiveKit room composite egress.
 * Host-only — verifies the requesting user is the call host.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  EncodingOptionsPreset,
  S3Upload,
} from 'livekit-server-sdk';
import { BadRequestError, ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events';

interface S3Config {
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export class StartRecordingService {
  private egressClient: EgressClient;

  constructor(
    private supabase: SupabaseClient,
    private s3Config: S3Config,
    livekitApiKey: string,
    livekitApiSecret: string,
    livekitWsUrl: string,
    private eventPublisher?: IEventPublisher,
  ) {
    this.egressClient = new EgressClient(livekitWsUrl, livekitApiKey, livekitApiSecret);
  }

  async start(callId: string, clerkUserId: string) {
    // Resolve user
    const userId = await this.resolveUserId(clerkUserId);

    // Verify host
    await this.verifyHost(callId, userId);

    // Validate call state
    const call = await this.findCall(callId);
    if (call.status !== 'active') {
      throw new BadRequestError(`Cannot start recording for call with status: ${call.status}`);
    }
    if (!call.livekit_room_name) {
      throw new BadRequestError('Call does not have a room name assigned');
    }

    // Create pending recording row
    const { data: recording, error: insertError } = await this.supabase
      .from('call_recordings')
      .insert({
        call_id: callId,
        recording_status: 'pending',
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Start LiveKit egress
    const filepath = `recordings/calls/${callId}/${recording.id}.mp4`;
    const output = new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath,
      output: {
        case: 's3',
        value: new S3Upload({
          accessKey: this.s3Config.accessKey,
          secret: this.s3Config.secretKey,
          endpoint: this.s3Config.endpoint,
          region: this.s3Config.region,
          bucket: this.s3Config.bucket,
          forcePathStyle: true,
        }),
      },
    });

    const egressInfo = await this.egressClient.startRoomCompositeEgress(
      call.livekit_room_name,
      output,
      { encodingOptions: EncodingOptionsPreset.H264_720P_30 },
    );

    // Update recording with egress ID and status
    await this.supabase
      .from('call_recordings')
      .update({ recording_status: 'recording', egress_id: egressInfo.egressId })
      .eq('id', recording.id);

    await this.eventPublisher?.publish('call_recording.started', {
      recording_id: recording.id,
      call_id: callId,
      started_by: userId,
    }, 'video-service');

    return { recording_status: 'recording', recording_id: recording.id };
  }

  private async resolveUserId(clerkUserId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundError('User');
    return data.id;
  }

  private async verifyHost(callId: string, userId: string): Promise<void> {
    const { data: participants, error } = await this.supabase
      .from('call_participants')
      .select('user_id, role')
      .eq('call_id', callId);

    if (error) throw error;
    const isHost = (participants || []).some(
      (p: any) => p.user_id === userId && p.role === 'host',
    );
    if (!isHost) {
      throw new ForbiddenError('Only the host can control recording');
    }
  }

  private async findCall(callId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('calls')
      .select('id, status, livekit_room_name')
      .eq('id', callId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundError('Call', callId);
    return data;
  }
}
