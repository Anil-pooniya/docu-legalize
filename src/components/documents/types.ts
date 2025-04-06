
export interface OCRMetadata {
  confidence: number;
  pageCount?: number;
  parties?: string[];
  dates?: string[];
  keywords?: string[];
  documentType?: string;
  confidentialityLevel?: string;
  author?: string;
  creationDate?: string;
  fileName?: string;
  fileSize?: number;
  format?: string;
  lastModified?: string;
  totalWords?: number;
  totalChars?: number;
  legalTerms?: string[]; // For legal term recognition
  encrypted?: boolean; // Whether the document is encrypted/password-protected
  scannedOnly?: boolean; // Whether the document contains only scanned images
  processingErrors?: string[]; // Any errors that occurred during processing
  recognitionQuality?: 'high' | 'medium' | 'low'; // Quality of OCR recognition
  languageDetected?: string; // Detected language of the document
  detectedScripts?: string[]; // Scripts (writing systems) detected in the document
}

export interface StructuredContent {
  title?: string;
  sections: { heading?: string; content: string; level: number }[];
  tables?: { description: string; location: string }[];
  signatures?: { name?: string; position?: string; date?: string }[];
  legalReferences?: string[];
  definitions?: Record<string, string>;
  keyInformation?: Record<string, string>;
  clauses?: { number: string; title?: string; content: string; subclauses?: { number: string; content: string }[] }[]; // For better clause structure
}

export interface DocumentPreviewProps {
  documentId?: string;
}

export interface CertificateData {
  id: string;
  documentName: string;
  date: string;
  documentId?: string;
  verificationLink?: string;
  sha256Hash?: string;
  certifierName?: string;
  certifierDesignation?: string;
  certifierOrganization?: string;
}

export interface ExtractedDocumentData {
  text: string;
  confidence: number;
  metadata: OCRMetadata;
  structuredContent?: StructuredContent;
}

export interface DocumentExtractionError {
  code: string;
  message: string;
  details?: string;
  possibleResolution?: string;
}
