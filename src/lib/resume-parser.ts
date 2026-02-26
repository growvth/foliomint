import { ParseError } from '@/lib/errors';
import type { ResumeData } from '@/types';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;

  try {
    const data = await pdfParse(buffer);
    if (!data.text?.trim()) {
      throw new ParseError('PDF appears to be empty or contains only images');
    }
    return data.text;
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError('Failed to extract text from PDF');
  }
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');

  try {
    const result = await mammoth.extractRawText({ buffer });
    if (!result.value?.trim()) {
      throw new ParseError('DOCX appears to be empty');
    }
    return result.value;
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError('Failed to extract text from DOCX');
  }
}

export function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  switch (mimeType) {
    case 'application/pdf':
      return extractTextFromPdf(buffer);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractTextFromDocx(buffer);
    case 'text/plain':
      return Promise.resolve(buffer.toString('utf-8'));
    default:
      throw new ParseError(`Unsupported file type: ${mimeType}`);
  }
}

export function buildFallbackResumeData(rawText: string): ResumeData {
  const lines = rawText.split('\n').filter((l) => l.trim());
  return {
    name: lines[0]?.trim() ?? 'Unknown',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    bio: rawText.slice(0, 500),
  };
}
