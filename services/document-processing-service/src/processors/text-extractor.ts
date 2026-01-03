import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger('text-extractor');

export interface ExtractionResult {
  text: string;
  pages?: number;
  wordCount: number;
  extractionMethod: string;
  confidence: number;
}

export class TextExtractor {
  
  /**
   * Extract text from various document formats
   */
  async extractText(fileBuffer: Buffer, mimeType: string, filename?: string): Promise<ExtractionResult> {
    try {
      switch (mimeType.toLowerCase()) {
        case 'application/pdf':
          return await this.extractFromPdf(fileBuffer);
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/docx':
          return await this.extractFromDocx(fileBuffer);
        
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      logger.error(`Text extraction failed for ${mimeType} file ${filename || 'unknown'}: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return empty result for failed extractions
      return {
        text: '',
        wordCount: 0,
        extractionMethod: 'failed',
        confidence: 0
      };
    }
  }

  /**
   * Extract text from PDF using pdf-parse
   */
  private async extractFromPdf(fileBuffer: Buffer): Promise<ExtractionResult> {
    logger.debug('Starting PDF text extraction');
    
    const startTime = Date.now();
    const result = await pdfParse(fileBuffer);
    const extractionTime = Date.now() - startTime;
    
    const wordCount = this.countWords(result.text);
    const confidence = this.calculatePdfConfidence(result, wordCount);
    
    logger.info(`PDF text extraction completed: ${result.numpages} pages, ${result.text.length} chars, ${wordCount} words, ${confidence}% confidence (${extractionTime}ms)`);
    
    return {
      text: result.text.trim(),
      pages: result.numpages,
      wordCount,
      extractionMethod: 'pdf-parse',
      confidence
    };
  }

  /**
   * Extract text from DOCX using mammoth
   */
  private async extractFromDocx(fileBuffer: Buffer): Promise<ExtractionResult> {
    logger.debug('Starting DOCX text extraction');
    
    const startTime = Date.now();
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const extractionTime = Date.now() - startTime;
    
    const wordCount = this.countWords(result.value);
    const confidence = this.calculateDocxConfidence(result, wordCount);
    
    // Log warnings if there were conversion issues
    if (result.messages.length > 0) {
      logger.warn(`DOCX conversion warnings: ${result.messages.map(m => m.message).join(', ')}`);
    }
    
    logger.info(`DOCX text extraction completed: ${result.value.length} chars, ${wordCount} words, ${confidence}% confidence, ${result.messages.length} warnings (${extractionTime}ms)`);
    
    return {
      text: result.value.trim(),
      wordCount,
      extractionMethod: 'mammoth',
      confidence
    };
  }

  /**
   * Count words in extracted text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate confidence score for PDF extraction (0-1)
   * Based on text quality indicators
   */
  private calculatePdfConfidence(result: any, wordCount: number): number {
    // Base confidence on text length and structure
    let confidence = 0.5;
    
    // Boost confidence if we got substantial text
    if (wordCount > 50) confidence += 0.2;
    if (wordCount > 200) confidence += 0.2;
    
    // Check for common resume indicators
    const text = result.text.toLowerCase();
    const resumeKeywords = [
      'experience', 'education', 'skills', 'work', 'employment',
      'university', 'college', 'degree', 'email', 'phone'
    ];
    
    const foundKeywords = resumeKeywords.filter(keyword => 
      text.includes(keyword)
    ).length;
    
    confidence += (foundKeywords / resumeKeywords.length) * 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate confidence score for DOCX extraction (0-1)
   */
  private calculateDocxConfidence(result: any, wordCount: number): number {
    // DOCX extraction is generally more reliable than PDF
    let confidence = 0.8;
    
    // Reduce confidence if there were conversion warnings
    const warningCount = result.messages.length;
    confidence -= (warningCount * 0.1);
    
    // Boost confidence for substantial content
    if (wordCount > 100) confidence += 0.1;
    
    return Math.max(Math.min(confidence, 1.0), 0.3);
  }

  /**
   * Validate extraction quality
   */
  isExtractionValid(result: ExtractionResult): boolean {
    return (
      result.text.length > 10 && 
      result.wordCount > 5 && 
      result.confidence > 0.3
    );
  }
}