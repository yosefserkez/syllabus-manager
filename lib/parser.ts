import { Task, TaskType } from './data';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { syllabusSchema, type SyllabusData } from './schemas';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Add file size limit
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function extractTextFromFile(file: File): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files only.');
  }

  const buffer = await file.arrayBuffer();
  let text = '';
  
  try {
    switch (file.type) {
      case 'application/pdf':
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        // Add page limit for PDFs
        if (pdf.numPages > 50) {
          throw new Error('PDF exceeds 50 page limit');
        }
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        break;
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        text = result.value;
        break;
      
      case 'text/plain':
        text = new TextDecoder().decode(buffer);
        break;
    }

    // Validate extracted text
    if (!text || text.trim().length === 0) {
      throw new Error('No text content found in file');
    }

    // Limit text length to prevent API abuse
    const MAX_TEXT_LENGTH = 50000; // 50K characters
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.slice(0, MAX_TEXT_LENGTH);
    }

    return text;
  } catch (error) {
    throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function parseSyllabusWithAI(text: string): Promise<SyllabusData> {
  try {
    console.log('BODY from client', JSON.stringify({ text }))
    const response = await fetch('/api/parse-syllabus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    console.log('response', response)
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to parse syllabus');
    }

    const data = await response.json();

    return syllabusSchema.parse(data);
  } catch (error) {
    throw new Error(`Parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateParsedData(data: unknown): string[] {
  const result = syllabusSchema.safeParse(data);
  
  if (!result.success) {
    return result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    );
  }

  return [];
}