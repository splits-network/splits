import { DocumentRepositoryV2 } from './repository';
import { DocumentUpdate } from '../shared/types';

export class DocumentServiceV2 {
  constructor(
    private repository: DocumentRepositoryV2,
  ) {}

  async update(id: string, clerkUserId: string, updates: DocumentUpdate) {
    // Smart validation based on what's being updated
    if (updates.processing_status) {
      this.validateStatusTransition(updates.processing_status);
    }
    
    if (updates.extracted_text !== undefined && updates.extracted_text.length > 1000000) {
      throw new Error('Extracted text is too large (max 1MB)');
    }
    
    return await this.repository.update(id, clerkUserId, updates);
  }

  // System-level update for processing service
  async updateBySystem(id: string, updates: DocumentUpdate) {
    if (updates.processing_status) {
      this.validateStatusTransition(updates.processing_status);
    }
    
    return await this.repository.updateBySystem(id, updates);
  }

  private validateStatusTransition(status: string) {
    const validStatuses = ['pending', 'processing', 'processed', 'failed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid processing status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }
  }
}