// ====================================================================
// ADAPTIVELEARN AI — Server Document Text Parser
// Ingests and extracts clean plain text from PDF, DOCX, and TXT files
// ====================================================================

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ExtractionResult {
  success: boolean;
  text: string;
  characterCount: number;
  error?: string;
}

/**
 * Extracts raw textual content from uploaded file buffers.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: 'pdf' | 'docx' | 'pptx' | 'txt'
): Promise<ExtractionResult> {
  try {
    if (fileType === 'pdf') {
      const data = await pdfParse(buffer);
      const text = data.text.trim();
      return {
        success: true,
        text,
        characterCount: text.length,
      };
    }

    if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value.trim();
      return {
        success: true,
        text,
        characterCount: text.length,
      };
    }

    if (fileType === 'txt') {
      const text = buffer.toString('utf-8').trim();
      return {
        success: true,
        text,
        characterCount: text.length,
      };
    }

    if (fileType === 'pptx') {
      // Basic text extraction for PPTX from XML strings
      const raw = buffer.toString('utf-8');
      const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        success: true,
        text: text.slice(0, 10000),
        characterCount: Math.min(text.length, 10000),
      };
    }

    return {
      success: false,
      text: '',
      characterCount: 0,
      error: `Unsupported file type: ${fileType}`,
    };
  } catch (err: any) {
    return {
      success: false,
      text: '',
      characterCount: 0,
      error: `Failed to extract text from ${fileType.toUpperCase()} file: ${err.message}`,
    };
  }
}
