import {
    EgressClient,
    EncodedFileOutput,
    EncodedFileType,
    EncodingOptionsPreset,
    S3Upload,
} from 'livekit-server-sdk';
import { CallRecordingRepository } from './call-repository.js';

interface SupabaseS3Config {
    endpoint: string;
    region: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
}

export class CallRecordingService {
    private egressClient: EgressClient;
    private repository: CallRecordingRepository;
    private s3Config: SupabaseS3Config;

    constructor(
        repository: CallRecordingRepository,
        livekitApiKey: string,
        livekitApiSecret: string,
        livekitHost: string,
        s3Config: SupabaseS3Config,
    ) {
        this.repository = repository;
        this.s3Config = s3Config;
        this.egressClient = new EgressClient(livekitHost, livekitApiKey, livekitApiSecret);
    }

    async startRecording(callId: string): Promise<void> {
        const call = await this.repository.findCallById(callId);
        if (!call) {
            throw Object.assign(new Error('Call not found'), { statusCode: 404 });
        }

        if (call.status !== 'active') {
            throw Object.assign(
                new Error(`Cannot start recording for call with status: ${call.status}`),
                { statusCode: 400 },
            );
        }

        if (!call.livekit_room_name) {
            throw Object.assign(
                new Error('Call does not have a room name assigned'),
                { statusCode: 400 },
            );
        }

        // Create a pending recording row
        const recording = await this.repository.createRecording(callId, {
            recording_status: 'pending',
            started_at: new Date().toISOString(),
        });

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

        await this.repository.updateRecordingStatus(recording.id, {
            recording_status: 'recording',
            egress_id: egressInfo.egressId,
        });
    }

    async stopRecording(callId: string): Promise<void> {
        const recording = await this.repository.findActiveRecordingByCallId(callId);
        if (!recording) {
            throw Object.assign(
                new Error('No active recording found for this call'),
                { statusCode: 400 },
            );
        }

        if (!recording.egress_id) {
            throw Object.assign(
                new Error('No active egress found for this recording'),
                { statusCode: 400 },
            );
        }

        await this.egressClient.stopEgress(recording.egress_id);

        await this.repository.updateRecordingStatus(recording.id, {
            recording_status: 'processing',
            ended_at: new Date().toISOString(),
        });
    }

    async handleEgressComplete(
        egressId: string,
        fileUrl: string,
        duration: number,
        fileSize: number,
    ): Promise<{ callId: string; recordingId: string }> {
        const recording = await this.repository.findRecordingByEgressId(egressId);
        if (!recording) {
            throw Object.assign(
                new Error(`No call recording found for egress: ${egressId}`),
                { statusCode: 404 },
            );
        }

        await this.repository.updateRecordingStatus(recording.id, {
            recording_status: 'ready',
            blob_url: fileUrl,
            duration_seconds: duration,
            file_size_bytes: fileSize,
        });

        return { callId: recording.call_id, recordingId: recording.id };
    }

    async handleEgressFailed(egressId: string, _error: string): Promise<void> {
        const recording = await this.repository.findRecordingByEgressId(egressId);
        if (!recording) {
            throw Object.assign(
                new Error(`No call recording found for egress: ${egressId}`),
                { statusCode: 404 },
            );
        }

        await this.repository.updateRecordingStatus(recording.id, {
            recording_status: 'failed',
        });
    }
}
