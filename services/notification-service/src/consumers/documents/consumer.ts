import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { DocumentsEmailService } from '../../services/documents/service';
import { ContactLookupHelper } from '../../helpers/contact-lookup';
import { DataLookupHelper } from '../../helpers/data-lookup';

export class DocumentsEventConsumer {
    constructor(
        private emailService: DocumentsEmailService,
        private logger: Logger,
        private portalUrl: string,
        private contactLookup: ContactLookupHelper,
        private dataLookup: DataLookupHelper
    ) {}

    async handleResumeMetadataExtracted(event: DomainEvent): Promise<void> {
        try {
            const {
                document_id,
                entity_type,
                entity_id,
                skills_count = 0,
                experience_count = 0,
                education_count = 0,
            } = event.payload;

            this.logger.info(
                { document_id, entity_type, entity_id, skills_count, experience_count, education_count },
                'Handling resume.metadata.extracted notification'
            );

            // Only handle candidate resumes
            if (entity_type !== 'candidate') {
                this.logger.info({ entity_type }, 'Skipping non-candidate document');
                return;
            }

            // Fetch document details for file name
            const document = await this.dataLookup.getDocument(document_id);
            const fileName = document?.file_name || 'Resume';

            // Fetch candidate details
            const candidate = await this.dataLookup.getCandidate(entity_id);
            if (!candidate) {
                this.logger.warn({ entity_id }, 'Candidate not found — skipping notification');
                return;
            }

            const candidateName = candidate.full_name || 'Unknown Candidate';
            const viewUrl = `${this.portalUrl}/portal/candidates/${entity_id}`;

            // Notify the recruiter who uploaded the document
            if (document?.uploaded_by) {
                const uploaderContact = await this.contactLookup.getContactByUserId(document.uploaded_by);
                if (uploaderContact?.email) {
                    await this.emailService.sendResumeProcessed(
                        uploaderContact.email,
                        {
                            candidateName,
                            fileName,
                            skillsCount: skills_count,
                            experienceCount: experience_count,
                            educationCount: education_count,
                            viewUrl,
                        },
                        uploaderContact.user_id ?? undefined
                    );

                    this.logger.info(
                        { document_id, uploader: document.uploaded_by },
                        'Resume processed notification sent to uploader'
                    );
                    return;
                }
            }

            // Fallback: notify the candidate's recruiter if no uploader found
            if (candidate.user_id) {
                const candidateContact = await this.contactLookup.getContactByUserId(candidate.user_id);
                if (candidateContact?.email) {
                    await this.emailService.sendResumeProcessed(
                        candidateContact.email,
                        {
                            candidateName,
                            fileName,
                            skillsCount: skills_count,
                            experienceCount: experience_count,
                            educationCount: education_count,
                            viewUrl: `${this.portalUrl}/portal/profile`,
                            source: 'candidate',
                        },
                        candidateContact.user_id ?? undefined
                    );

                    this.logger.info(
                        { document_id, candidate_id: entity_id },
                        'Resume processed notification sent to candidate'
                    );
                }
            }
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send resume processed notification'
            );
            throw error;
        }
    }
}
