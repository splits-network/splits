import {
    EgressClient,
    EncodedFileOutput,
    EncodedFileType,
    EncodingOptionsPreset,
    AzureBlobUpload,
} from 'livekit-server-sdk';
import { InterviewRepository } from './repository';

interface AzureConfig {
    accountName: string;
    accountKey: string;
    containerName: string;
}

export class RecordingService {
    private egressClient: EgressClient;
    private repository: InterviewRepository;
    private azureConfig: AzureConfig;

    constructor(
        repository: InterviewRepository,
        livekitApiKey: string,
        livekitApiSecret: string,
        livekitHost: string,
        azureConfig: AzureConfig,
    ) {
        this.repository = repository;
        this.azureConfig = azureConfig;
        this.egressClient = new EgressClient(livekitHost, livekitApiKey, livekitApiSecret);
    }

    async startRecording(interviewId: string): Promise<void> {
        const interview = await this.repository.findById(interviewId);
        if (!interview) {
            throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
        }

        if (interview.status !== 'scheduled' && interview.status !== 'in_progress') {
            throw Object.assign(
                new Error(`Cannot start recording for interview with status: ${interview.status}`),
                { statusCode: 400 },
            );
        }

        if (!interview.recording_enabled) {
            throw Object.assign(
                new Error('Recording is not enabled for this interview'),
                { statusCode: 400 },
            );
        }

        if (!interview.room_name) {
            throw Object.assign(
                new Error('Interview does not have a room name assigned'),
                { statusCode: 400 },
            );
        }

        const filepath = `recordings/${interviewId}/${interviewId}.mp4`;

        const output = new EncodedFileOutput({
            fileType: EncodedFileType.MP4,
            filepath,
            output: {
                case: 'azure',
                value: new AzureBlobUpload({
                    accountName: this.azureConfig.accountName,
                    accountKey: this.azureConfig.accountKey,
                    containerName: this.azureConfig.containerName,
                }),
            },
        });

        const egressInfo = await this.egressClient.startRoomCompositeEgress(
            interview.room_name,
            output,
            { encodingOptions: EncodingOptionsPreset.H264_720P_30 },
        );

        await this.repository.updateRecordingStatus(interviewId, {
            recording_status: 'recording',
            recording_egress_id: egressInfo.egressId,
            recording_started_at: new Date().toISOString(),
        });
    }

    async stopRecording(interviewId: string): Promise<void> {
        const interview = await this.repository.findById(interviewId);
        if (!interview) {
            throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
        }

        if (interview.recording_status !== 'recording') {
            throw Object.assign(
                new Error(`Cannot stop recording: status is ${interview.recording_status}`),
                { statusCode: 400 },
            );
        }

        if (!interview.recording_egress_id) {
            throw Object.assign(
                new Error('No active egress found for this interview'),
                { statusCode: 400 },
            );
        }

        await this.egressClient.stopEgress(interview.recording_egress_id);

        await this.repository.updateRecordingStatus(interviewId, {
            recording_status: 'processing',
            recording_ended_at: new Date().toISOString(),
        });
    }

    async handleEgressComplete(
        egressId: string,
        fileUrl: string,
        duration: number,
        fileSize: number,
    ): Promise<string> {
        const interview = await this.repository.findByEgressId(egressId);
        if (!interview) {
            throw Object.assign(
                new Error(`No interview found for egress: ${egressId}`),
                { statusCode: 404 },
            );
        }

        await this.repository.updateRecordingStatus(interview.id, {
            recording_status: 'ready',
            recording_blob_url: fileUrl,
            recording_duration_seconds: duration,
            recording_file_size_bytes: fileSize,
        });

        return interview.id;
    }

    async handleEgressFailed(egressId: string, _error: string): Promise<void> {
        const interview = await this.repository.findByEgressId(egressId);
        if (!interview) {
            throw Object.assign(
                new Error(`No interview found for egress: ${egressId}`),
                { statusCode: 404 },
            );
        }

        await this.repository.updateRecordingStatus(interview.id, {
            recording_status: 'failed',
        });
    }
}
