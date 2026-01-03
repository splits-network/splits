import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { loadConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger('document-service');
const config = loadConfig();

export interface DocumentDownloadResult {
  buffer: Buffer;
  size: number;
  contentType: string;
  downloadTimeMs: number;
}

export class DocumentService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Service key for server-side access
    );
  }

  /**
   * Download document from Supabase Storage for processing
   */
  async downloadDocument(storagePath: string): Promise<DocumentDownloadResult> {
    logger.debug(`Downloading document for processing: ${storagePath}`);
    
    const startTime = Date.now();
    
    try {
      // Extract bucket and file path
      const pathParts = storagePath.replace('storage/', '').split('/');
      const bucket = pathParts[0];
      const filePath = pathParts.slice(1).join('/');
      
      logger.debug(`Parsed storage path: ${bucket}/${filePath}`);
      
      // Download file data
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .download(filePath);
      
      if (error) {
        throw new Error(`Failed to download document: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No file data returned from storage');
      }
      
      // Convert blob to buffer
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const downloadTime = Date.now() - startTime;
      
      logger.info(`Document downloaded successfully: ${storagePath} (${buffer.length} bytes, ${data.type}, ${downloadTime}ms)`);
      
      return {
        buffer,
        size: buffer.length,
        contentType: data.type,
        downloadTimeMs: downloadTime
      };
      
    } catch (error) {
      logger.error(`Failed to download document: ${storagePath} - ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}