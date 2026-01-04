import { Channel } from 'amqplib';
import { createLogger } from '@splits-network/shared-logging';
import { TextExtractor, ExtractionResult } from './processors/text-extractor.js';
import { DocumentService } from './services/document-service.js';

// V2 Architecture imports
import { DocumentRepositoryV2 } from './v2/documents/repository';
import { DocumentServiceV2 } from './v2/documents/service';

import { createClient } from '@supabase/supabase-js';
import { loadConfig } from '@splits-network/shared-config';

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
  private repository: DocumentRepositoryV2;
  private documentServiceV2: DocumentServiceV2;
  private channel: Channel;

  constructor(channel: Channel) {
    this.channel = channel;
    this.textExtractor = new TextExtractor();
    this.documentService = new DocumentService();
    // Initialize V2 repository and service with Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.repository = new DocumentRepositoryV2(supabase);
    this.documentServiceV2 = new DocumentServiceV2(this.repository);
  }

  /**
   * Initialize event consumers
   */
  async initialize(): Promise<void> {
    logger.info('Initializing domain consumer');
    
    // Declare exchange and queue, then bind them
    await this.channel.assertExchange('splits-network-events', 'topic', { durable: true });
    await this.channel.assertQueue('document-processing-service', { durable: true });
    await this.channel.bindQueue(
      'document-processing-service',
      'splits-network-events',
      'document.uploaded'
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

      logger.debug(`Received message: ${routingKey} (messageId: ${content.id})`);

      switch (routingKey) {
        case 'document.uploaded':
          await this.handleDocumentUploaded(content);
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
   * Handle document.uploaded event
   */
  private async handleDocumentUploaded(event: DocumentUploadedEvent): Promise<void> {
    const startTime = Date.now();
    logger.info(`Processing document upload: ${event.document_id} (${event.entity_type}, ${event.mime_type}, ${event.file_size} bytes)`);

    try {
      // 1. Mark document as processing using V2 updateBySystem
      await this.documentServiceV2.updateBySystem(event.document_id, {
        processing_status: 'processing'
      });

      // 2. Download document from storage
      const downloadResult = await this.documentService.downloadDocument(event.bucket_name, event.file_path);
      
      logger.debug(`Document downloaded: ${event.document_id} (${downloadResult.size} bytes, ${downloadResult.downloadTimeMs}ms)`);

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

      // 5. Update document with extracted content using V2 updateBySystem
      await this.documentServiceV2.updateBySystem(event.document_id, {
        processing_status: 'processed',
        metadata: {
          extracted_text: extractionResult.text,
          extraction_method: extractionResult.extractionMethod,
          extraction_confidence: extractionResult.confidence,
          word_count: extractionResult.wordCount,
          pages: extractionResult.pages
        }
      });

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

      logger.info(`Document processing completed successfully: ${event.document_id} (${extractionResult.text.length} chars, ${extractionResult.wordCount} words, ${extractionResult.confidence}% confidence, ${processingTime}ms)`);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logger.error(`Document processing failed: ${event.document_id} - ${errorMessage} (${processingTime}ms)`);

      // Mark as failed in database using V2 updateBySystem
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
   * Publish document.processed event
   */
  private async publishDocumentProcessed(event: DocumentProcessedEvent): Promise<void> {
    try {
      const message = {
        ...event,
        id: `${event.document_id}-processed-${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      await this.channel.publish(
        'splits-network-events',
        'document.processed',
        Buffer.from(JSON.stringify(message))
      );

      logger.debug(`Published document.processed event: ${event.document_id} (${event.processing_status})`);
    } catch (error) {
      logger.error(`Failed to publish document.processed event: ${event.document_id} - ${error instanceof Error ? error.message : String(error)}`);
    }
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
            bucket_name: doc.bucket_name,
            filename: doc.filename,
            mime_type: (doc as any).content_type, // Database field is content_type
            file_size: doc.file_size,
            uploaded_at: doc.created_at,
            uploaded_by: 'system-retroactive-processing'
          };

          await this.handleDocumentUploaded(syntheticEvent);
          
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