import { Channel } from 'amqplib';
import { createLogger } from '@splits-network/shared-logging';
import { TextExtractor, ExtractionResult } from './processors/text-extractor.js';
import { SmartResumeExtractor } from './processors/smart-resume-extractor.js';
import { DocumentService } from './services/document-service.js';
import { ScannerService } from './services/scanner-service.js';

// V2 Architecture imports
import { DocumentRepositoryV2 } from './v2/documents/repository.js';
import { DocumentServiceV2 } from './v2/documents/service.js';

import { createClient } from '@supabase/supabase-js';
import { loadConfig } from '@splits-network/shared-config';
import { EventPublisher } from '@splits-network/shared-job-queue';
import type { IAiClient } from '@splits-network/shared-ai-client';

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
    private smartResumeExtractor: SmartResumeExtractor;
    private documentService: DocumentService;
    private scannerService: ScannerService;
    private repository: DocumentRepositoryV2;
    private documentServiceV2: DocumentServiceV2;
    private channel: Channel;
    private eventPublisher: EventPublisher;
    private supabase: ReturnType<typeof createClient>;

    constructor(channel: Channel, eventPublisher: EventPublisher, aiClient?: IAiClient) {
        this.channel = channel;
        this.eventPublisher = eventPublisher;
        this.textExtractor = new TextExtractor();
        this.smartResumeExtractor = new SmartResumeExtractor(aiClient);
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

            // 5b. If this is a resume for a candidate, populate smart_resume tables via AI
            if (needsSmartResume) {
                try {
                    const isPdf = event.mime_type === 'application/pdf';
                    await this.populateSmartResume(
                        event.entity_id,
                        event.document_id,
                        isPdf ? extractionResult.text : downloadResult.buffer,
                        event.mime_type
                    );
                    logger.info(`Smart resume populated for candidate ${event.entity_id}`);
                } catch (srError) {
                    logger.warn({ err: srError, document_id: event.document_id },
                        'Smart resume extraction failed (non-fatal)');
                }

                // Mark as fully processed after smart resume extraction
                await this.documentServiceV2.updateBySystem(event.document_id, {
                    processing_status: 'processed',
                });
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
     * Extract structured data from a resume and write to smart_resume tables.
     * Runs officeparser for structured extraction — no AI needed.
     */
    private async populateSmartResume(
        candidateId: string,
        documentId: string,
        fileBufferOrText: Buffer | string,
        mimeType: string
    ): Promise<void> {
        const extraction = await this.smartResumeExtractor.extract(fileBufferOrText, mimeType);

        const sb = this.supabase as any;

        // Get or create profile
        let { data: profile } = await sb
            .from('smart_resume_profiles')
            .select('id')
            .eq('candidate_id', candidateId)
            .is('deleted_at', null)
            .maybeSingle();

        if (!profile) {
            const { data: created, error } = await sb
                .from('smart_resume_profiles')
                .insert({
                    candidate_id: candidateId,
                    professional_summary: extraction.professional_summary,
                    source_document_id: documentId,
                })
                .select('id')
                .single();
            if (error) throw error;
            profile = created;
        } else {
            // Update existing profile
            await sb
                .from('smart_resume_profiles')
                .update({
                    professional_summary: extraction.professional_summary || undefined,
                    source_document_id: documentId,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', profile.id);
        }

        const profileId = profile!.id;

        // Clear existing entries before writing new ones (soft delete)
        const childTables = [
            'smart_resume_experiences', 'smart_resume_projects', 'smart_resume_tasks',
            'smart_resume_education', 'smart_resume_certifications',
            'smart_resume_skills', 'smart_resume_publications',
        ];
        for (const table of childTables) {
            await sb.from(table)
                .update({ deleted_at: new Date().toISOString() })
                .eq('profile_id', profileId)
                .is('deleted_at', null);
        }

        // Write experiences
        if (extraction.experiences.length > 0) {
            const rows = extraction.experiences.map((exp, i) => ({
                profile_id: profileId,
                company: exp.company,
                title: exp.title,
                location: exp.location,
                start_date: exp.start_date,
                end_date: exp.end_date,
                is_current: exp.is_current,
                description: exp.description,
                achievements: exp.achievements,
                sort_order: i,
            }));
            const { error: expError } = await sb.from('smart_resume_experiences').insert(rows);
            if (expError) logger.warn({ err: expError, count: rows.length }, 'Failed to insert experiences');
        }

        // Write education
        if (extraction.education.length > 0) {
            const rows = extraction.education.map((edu, i) => ({
                profile_id: profileId,
                institution: edu.institution,
                degree: edu.degree,
                field_of_study: edu.field_of_study,
                start_date: edu.start_date,
                end_date: edu.end_date,
                gpa: edu.gpa,
                honors: edu.honors,
                sort_order: i,
            }));
            const { error: eduError } = await sb.from('smart_resume_education').insert(rows);
            if (eduError) logger.warn({ err: eduError, count: rows.length }, 'Failed to insert education');
        }

        // Write skills (deduplicate by name to avoid unique constraint violation)
        if (extraction.skills.length > 0) {
            const seen = new Set<string>();
            const deduped = extraction.skills.filter(skill => {
                const key = skill.name.toLowerCase().trim();
                if (seen.has(key) || !key) return false;
                seen.add(key);
                return true;
            });
            const rows = deduped.map((skill, i) => ({
                profile_id: profileId,
                name: skill.name,
                category: skill.category,
                sort_order: i,
            }));
            const { error: skillsError } = await sb.from('smart_resume_skills').insert(rows);
            if (skillsError) {
                logger.warn({ err: skillsError, count: rows.length }, 'Failed to insert skills batch');
            }
        }

        // Write certifications
        if (extraction.certifications.length > 0) {
            const rows = extraction.certifications.map((cert, i) => ({
                profile_id: profileId,
                name: cert.name,
                issuer: cert.issuer,
                date_obtained: cert.date_obtained,
                sort_order: i,
            }));
            const { error: certError } = await sb.from('smart_resume_certifications').insert(rows);
            if (certError) logger.warn({ err: certError, count: rows.length }, 'Failed to insert certifications');
        }

        // Write projects
        if (extraction.projects.length > 0) {
            const rows = extraction.projects.map((proj, i) => ({
                profile_id: profileId,
                name: proj.name,
                description: proj.description,
                skills_used: proj.skills_used,
                sort_order: i,
            }));
            const { error: projError } = await sb.from('smart_resume_projects').insert(rows);
            if (projError) logger.warn({ err: projError, count: rows.length }, 'Failed to insert projects');
        }

        // Write publications
        if (extraction.publications.length > 0) {
            const rows = extraction.publications.map((pub, i) => ({
                profile_id: profileId,
                title: pub.title,
                description: pub.description,
                sort_order: i,
            }));
            const { error: pubError } = await sb.from('smart_resume_publications').insert(rows);
            if (pubError) logger.warn({ err: pubError, count: rows.length }, 'Failed to insert publications');
        }

        // Update candidate profile with contact info and current role
        try {
            const candidateUpdates: Record<string, any> = {};

            // Contact info from extraction
            if (extraction.contact) {
                if (extraction.contact.phone) candidateUpdates.phone = extraction.contact.phone;
                if (extraction.contact.location) candidateUpdates.location = extraction.contact.location;
                if (extraction.contact.linkedin_url) candidateUpdates.linkedin_url = extraction.contact.linkedin_url;
                if (extraction.contact.github_url) candidateUpdates.github_url = extraction.contact.github_url;
                if (extraction.contact.portfolio_url) candidateUpdates.portfolio_url = extraction.contact.portfolio_url;
            }

            // Current title and company from most recent experience
            const currentRole = extraction.experiences.find(e => e.is_current) || extraction.experiences[0];
            if (currentRole) {
                candidateUpdates.current_title = currentRole.title;
                candidateUpdates.current_company = currentRole.company;
            }

            if (Object.keys(candidateUpdates).length > 0) {
                const { error: candidateError } = await sb
                    .from('candidates')
                    .update(candidateUpdates)
                    .eq('id', candidateId);
                if (candidateError) {
                    logger.warn({ err: candidateError }, 'Failed to update candidate profile from resume');
                } else {
                    logger.info({ candidateId, fields: Object.keys(candidateUpdates) }, 'Candidate profile updated from resume');
                }
            }
        } catch (err) {
            logger.warn({ err }, 'Failed to update candidate profile (non-fatal)');
        }

        // Publish event for matching service
        try {
            await this.eventPublisher.publish('smart_resume.updated', {
                profileId,
                candidateId,
                source: 'document-extraction',
            }, 'document-processing-service');
        } catch {
            // Non-fatal
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