
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
  legalTerms?: string[]; // Added for legal term recognition
}

export interface StructuredContent {
  title?: string;
  sections: { heading?: string; content: string; level: number }[];
  tables?: { description: string; location: string }[];
  signatures?: { name?: string; position?: string; date?: string }[];
  legalReferences?: string[];
  definitions?: Record<string, string>;
  keyInformation?: Record<string, string>;
  clauses?: { number: string; title?: string; content: string; subclauses?: { number: string; content: string }[] }[]; // Added for better clause structure
}

export interface DocumentPreviewProps {
  documentId?: string;
}

export interface CertificateData {
  id: string;
  documentName: string;
  date: string;
}
