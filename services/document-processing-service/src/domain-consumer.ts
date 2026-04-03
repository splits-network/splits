import { Channel } from 'amqplib';
import { createLogger } from '@splits-network/shared-logging';
import { TextExtractor, ExtractionResult } from './processors/text-extractor.js';
import { DocumentService } from './services/document-service.js';
import { ScannerService } from './services/scanner-service.js';

// V2 Architecture imports
import { DocumentRepositoryV2 } from './v2/documents/repository.js';
import { DocumentServiceV2 } from './v2/documents/service.js';

import { createClient } from '@supabase/supabase-js';
import { loadConfig } from '@splits-network/shared-config';
import { EventPublisher } from '@splits-network/shared-job-queue';

const logger = createLogger('domain-consumer');
const config = loadConfig();

export interface DocumentUploadedEvent {
    document_id: string;
    entity_type: 'application' | 'candidate' | 'job' | 'company';
    entity_id: string;
    file_path: string;
    bucket_name: string;
    filename: string;
    mime_type: string;
    file_size: number;
    uploaded_at: string;
    uploaded_by: string;
}

export interface DocumentScannedEvent {
    document_id: string;
    entity_type: string;
    entity_id: string;
    scan_status: 'clean' | 'infected' | 'error';
    viruses?: string[];
    scanned_at: string;
    file_path: string;
    bucket_name: string;
    filename: string;
    mime_type: string;
    file_size: number;
}

export interface DocumentProcessedEvent {
    document_id: string;
    entity_type: string;
    entity_id: string;
    processing_status: 'processed' | 'failed';
    text_length: number;
    structured_data_available: boolean;
    embedding_generated: boolean;
    processed_at: string;
    processing_time_ms: number;
    error?: string;
}

export class DomainConsumer {
    private textExtractor: TextExtractor;
    private documentService: DocumentService;
    private scannerService: ScannerService;
    private repository: DocumentRepositoryV2;
    private documentServiceV2: DocumentServiceV2;
    private channel: Channel;
    private eventPublisher: EventPublisher;
    private supabase: ReturnType<typeof createClient>;

    constructor(channel: Channel, eventPublisher: EventPublisher) {
        this.channel = channel;
        this.eventPublisher = eventPublisher;
        this.textExtractor = new TextExtractor();
        this.documentService = new DocumentService();
        this.scannerService = new ScannerService();
        // Initialize V2 repository and service with Supabase client
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        this.repository = new DocumentRepositoryV2(this.supabase);
        this.documentServiceV2 = new DocumentServiceV2(this.repository);
    }

    /**
     * Initialize event consumers
     */
    async initialize(): Promise<void> {
        logger.info('Initializing domain consumer');

        // Initialize scanner service
        await this.scannerService.initialize();

        // Declare exchange and queue, then bind them
        await this.channel.assertExchange('splits-network-events', 'topic', { durable: true });
        await this.channel.assertQueue('document-processing-service', { durable: true });
        await this.channel.bindQueue(
            'document-processing-service',
            'splits-network-events',
            'document.uploaded'
        );
        await this.channel.bindQueue(
            'document-processing-service',
            'splits-network-events',
            'document.scanned'
        );

        // Start consuming messages
        await this.channel.consume(
            'document-processing-service',
            (message) => this.handleMessage(message),
            { noAck: false }
        );

        logger.info('Domain consumer initialized successfully');
    }

    /**
     * Handle incoming RabbitMQ messages
     */
    private async handleMessage(message: any): Promise<void> {
        if (!message) return;

        try {
            const content = JSON.parse(message.content.toString());
            const routingKey = message.fields.routingKey;

            logger.debug(`Received message: ${routingKey} (messageId: ${content.event_id})`);

            // Extract payload from DomainEvent wrapper
            const payload = content.payload || content;

            switch (routingKey) {
                case 'document.uploaded':
                    await this.handleDocumentUploaded(payload);
                    break;
                case 'document.scanned':
                    await this.handleDocumentScanned(payload);
                    break;

                default:
                    logger.warn('Unknown routing key: %s', routingKey);
            }

            // Acknowledge message
            this.channel.ack(message);

        } catch (error) {
            logger.error(error, 'Failed to handle message');

            // Reject message and don't requeue to avoid infinite loops
            this.channel.nack(message, false, false);
        }
    }

    /**
     * Handle document.uploaded event (Step 1: Virus Scan)
     */
    private async handleDocumentUploaded(event: DocumentUploadedEvent): Promise<void> {
        const startTime = Date.now();
        logger.info(`Processing document upload for scan: ${event.document_id} (${event.entity_type}, ${event.mime_type}, ${event.file_size} bytes)`);

        try {
            // 1. Download document from storage
            const downloadResult = await this.documentService.downloadDocument(event.bucket_name, event.file_path);

            logger.debug(`Document downloaded for scan: ${event.document_id} (${downloadResult.size} bytes, ${downloadResult.downloadTimeMs}ms)`);

            // 2. Scan document for viruses
            const scanResult = await this.scannerService.scanBuffer(downloadResult.buffer);

            // 3. Update document scan status
            const scanStatus = scanResult.isClean ? 'clean' : 'infected';

            await this.documentServiceV2.updateBySystem(event.document_id, {
                scan_status: scanStatus,
                ...(scanResult.isInfected ? { processing_status: 'failed', processing_error: `Malware detected: ${scanResult.viruses.join(', ')}` } : {})
            });

            // 4. If infected, delete from storage
            if (scanResult.isInfected) {
                logger.warn(`Deleting infected document from storage: ${event.document_id}`);
                await this.documentService.deleteDocument(event.bucket_name, event.file_path);
            }

            // 5. Publish document.scanned event
            await this.publishDocumentScanned({
                document_id: event.document_id,
                entity_type: event.entity_type,
                entity_id: event.entity_id,
                scan_status: scanStatus,
                viruses: scanResult.viruses,
                scanned_at: new Date().toISOString(),
                file_path: event.file_path,
                bucket_name: event.bucket_name,
                filename: event.filename,
                mime_type: event.mime_type,
                file_size: event.file_size
            });

            const processingTime = Date.now() - startTime;
            logger.info(`Document scan completed: ${event.document_id} (Status: ${scanStatus}, ${processingTime}ms)`);

        } catch (error) {
            const processingTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);

            logger.error(`Document scan failed: ${event.document_id} - ${errorMessage} (${processingTime}ms)`);

            // Mark as error in database
            await this.documentServiceV2.updateBySystem(event.document_id, {
                scan_status: 'error',
                processing_status: 'failed',
                processing_error: `Scan failed: ${errorMessage}`
            });
        }
    }

    /**
     * Handle document.scanned event (Step 2: Text Extraction)
     */
    private async handleDocumentScanned(event: DocumentScannedEvent): Promise<void> {
        // Only process clean documents
        if (event.scan_status !== 'clean') {
            logger.info(`Skipping text extraction for document ${event.document_id} (scan_status: ${event.scan_status})`);
            return;
        }

        const startTime = Date.now();
        logger.info(`Processing document extraction: ${event.document_id} (${event.entity_type}, ${event.mime_type}, ${event.file_size} bytes)`);

        try {
            // 1. Mark document as processing
            await this.documentServiceV2.updateBySystem(event.document_id, {
                processing_status: 'processing'
            });

            // 2. Download document from storage
            const downloadResult = await this.documentService.downloadDocument(event.bucket_name, event.file_path);

            logger.debug(`Document downloaded for extraction: ${event.document_id} (${downloadResult.size} bytes, ${downloadResult.downloadTimeMs}ms)`);

            // 3. Extract text from document
            const extractionResult = await this.textExtractor.extractText(
                downloadResult.buffer,
                event.mime_type,
                event.filename
            );

            // 4. Validate extraction quality
            if (!this.textExtractor.isExtractionValid(extractionResult)) {
                throw new Error(`Poor extraction quality: confidence=${extractionResult.confidence}, words=${extractionResult.wordCount}`);
            }

            // 5. Check if this is a resume that needs smart resume extraction
            const isResume = await this.isResumeDocument(event.document_id);
            const needsSmartResume = isResume && event.entity_type === 'candidate';

            // 5a. Update document with extracted content
            // If smart resume extraction is needed, mark as 'enriching' so the frontend waits
            await this.documentServiceV2.updateBySystem(event.document_id, {
                processing_status: needsSmartResume ? 'enriching' : 'processed',
                metadata: {
                    extracted_text: extractionResult.text,
                    extraction_method: extractionResult.extractionMethod,
                    extraction_confidence: extractionResult.confidence,
                    word_count: extractionResult.wordCount,
                    pages: extractionResult.pages
                }
            });

            // 5b. If this is a resume for a candidate, publish event for ai-service to handle
            if (needsSmartResume) {
                await this.publishDocumentEnriching({
                    document_id: event.document_id,
                    candidate_id: event.entity_id,
                    extracted_text: extractionResult.text,
                    mime_type: event.mime_type,
                });
                logger.info(`Published document.enriching event for candidate ${event.entity_id}`);
            }

            const processingTime = Date.now() - startTime;

            // 6. Publish document.processed event
            await this.publishDocumentProcessed({
                document_id: event.document_id,
                entity_type: event.entity_type,
                entity_id: event.entity_id,
                processing_status: 'processed',
                text_length: extractionResult.text.length,
                structured_data_available: false, // Phase 1: only text extraction
                embedding_generated: false,       // Phase 1: no embeddings yet
                processed_at: new Date().toISOString(),
                processing_time_ms: processingTime
            });

            logger.info(`Document extraction completed successfully: ${event.document_id} (${extractionResult.text.length} chars, ${extractionResult.wordCount} words, ${extractionResult.confidence}% confidence, ${processingTime}ms)`);

        } catch (error) {
            const processingTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);

            logger.error(`Document extraction failed: ${event.document_id} - ${errorMessage} (${processingTime}ms)`);

            // Mark as failed in database
            await this.documentServiceV2.updateBySystem(event.document_id, {
                processing_status: 'failed',
                processing_error: errorMessage
            });

            // Publish failure event
            await this.publishDocumentProcessed({
                document_id: event.document_id,
                entity_type: event.entity_type,
                entity_id: event.entity_id,
                processing_status: 'failed',
                text_length: 0,
                structured_data_available: false,
                embedding_generated: false,
                processed_at: new Date().toISOString(),
                processing_time_ms: processingTime,
                error: errorMessage
            });
        }
    }

    /**
     * Publish document.scanned event
     */
    private async publishDocumentScanned(event: DocumentScannedEvent): Promise<void> {
        try {
            await this.eventPublisher.publish('document.scanned', event, 'document-processing-service');
            logger.debug(`Published document.scanned event: ${event.document_id} (${event.scan_status})`);
        } catch (error) {
            logger.error(`Failed to publish document.scanned event: ${event.document_id} - ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Publish document.enriching event — triggers ai-service to extract structured resume data
     */
    private async publishDocumentEnriching(event: {
        document_id: string;
        candidate_id: string;
        extracted_text: string;
        mime_type: string;
    }): Promise<void> {
        try {
            await this.eventPublisher.publish('document.enriching', event, 'document-processing-service');
            logger.debug(`Published document.enriching event: ${event.document_id}`);
        } catch (error) {
            logger.error(`Failed to publish document.enriching event: ${event.document_id} - ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Publish document.processed event
     */
    private async publishDocumentProcessed(event: DocumentProcessedEvent): Promise<void> {
        try {
            await this.eventPublisher.publish('document.processed', event, 'document-processing-service');
            logger.debug(`Published document.processed event: ${event.document_id} (${event.processing_status})`);
        } catch (error) {
            logger.error(`Failed to publish document.processed event: ${event.document_id} - ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Check if a document is a resume type
     */
    private async isResumeDocument(documentId: string): Promise<boolean> {
        const { data } = await this.supabase
            .from('documents')
            .select('document_type')
            .eq('id', documentId)
            .single() as any;
        return data?.document_type === 'resume';
    }

    /**
     * Process pending documents for retroactive processing
     */
    async processPendingDocuments(batchSize = 10): Promise<void> {
        logger.info(`Starting retroactive processing of pending documents (batch size: ${batchSize})`);

        try {
            // Use V2 repository method for consistency
            const pendingDocs = await this.repository.getPendingDocuments(batchSize);

            if (pendingDocs.length === 0) {
                logger.info('No pending documents found');
                return;
            }

            logger.info(`Found ${pendingDocs.length} pending documents to process`);

            for (const doc of pendingDocs) {
                try {
                    // Create synthetic upload event for processing
                    // Note: Database has content_type but our code expects mime_type
                    const syntheticEvent: DocumentUploadedEvent = {
                        document_id: doc.id,
                        entity_type: doc.entity_type,
                        entity_id: doc.entity_id,
                        file_path: doc.storage_path,
                        bucket_name: doc.bucket_name, // Use actual bucket name from database
                        filename: doc.filename,
                        mime_type: (doc as any).content_type || doc.mime_type, // Database field is content_type or mime_type
                        file_size: doc.file_size,
                        uploaded_at: doc.created_at,
                        uploaded_by: 'system-retroactive-processing'
                    };

                    // If it hasn't been scanned, scan it. Otherwise, if it's clean, extract it.
                    if (doc.scan_status === 'pending' || !doc.scan_status) {
                        await this.handleDocumentUploaded(syntheticEvent);
                    } else if (doc.scan_status === 'clean' && doc.processing_status === 'pending') {
                        await this.handleDocumentScanned({
                            ...syntheticEvent,
                            scan_status: 'clean',
                            scanned_at: new Date().toISOString()
                        });
                    }

                    // Small delay between documents to avoid overwhelming the system
                    await new Promise(resolve => setTimeout(resolve, 1000));

                } catch (error) {
                    logger.error(`Failed to process pending document: ${doc.id} - ${error instanceof Error ? error.message : String(error)}`);
                }
            }

            logger.info(`Retroactive processing completed (processed ${pendingDocs.length} documents)`);

        } catch (error) {
            logger.error(`Failed to process pending documents: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}