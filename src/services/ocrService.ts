import api from './api';

// Mock OCR service for development
// In a production environment, this would connect to a real OCR service

interface OCRResult {
  text: string;
  confidence: number;
  metadata: Record<string, any>;
  structuredContent?: StructuredContent;
}

interface StructuredContent {
  title?: string;
  sections: { heading?: string; content: string; level: number }[];
  tables?: { description: string; location: string }[];
  signatures?: { name?: string; position?: string; date?: string }[];
  legalReferences?: string[];
  definitions?: Record<string, string>;
  keyInformation?: Record<string, string>;
  clauses?: { number: string; title?: string; content: string; subclauses?: { number: string; content: string }[] }[];
}

// Common legal terms for recognition
const LEGAL_TERMS = [
  "hereinafter", "whereas", "witnesseth", "aforementioned", "hereto", "hereof", "hereby",
  "hereunder", "thereto", "thereof", "thereby", "therewith", "foregoing", "pursuant to",
  "notwithstanding", "inter alia", "mutatis mutandis", "prima facie", "bona fide", "de facto",
  "ex parte", "pro rata", "quid pro quo", "sine qua non", "ultra vires", "vis major",
  "force majeure", "res judicata", "sub judice", "caveat emptor", "in witness whereof",
  "without prejudice", "indemnify", "covenant", "warrant", "termination", "jurisdiction"
];

/**
 * Extract text from a document using OCR
 */
async function extractText(file: File): Promise<OCRResult> {
  try {
    // Process the file with OCR
    const ocrResult = await api.performOCR(file);
    
    // If we have text, try to structure it
    if (ocrResult.text) {
      const structuredContent = analyzeTextContent(ocrResult.text, file.name);
      
      // Enhance metadata with legal terms
      if (!ocrResult.metadata) {
        ocrResult.metadata = {};
      }
      
      // Extract legal terms from the text
      ocrResult.metadata.legalTerms = extractLegalTerms(ocrResult.text);
      
      // Return combined results
      return {
        text: ocrResult.text,
        confidence: ocrResult.confidence || 0.85,
        metadata: ocrResult.metadata || {},
        structuredContent
      };
    }
    
    return ocrResult;
  } catch (error) {
    console.error("Error in OCR processing:", error);
    throw new Error("Failed to extract text from document");
  }
}

/**
 * Extract file metadata
 */
async function extractFileMetadata(file: File): Promise<Record<string, any>> {
  try {
    const metadata = await api.extractMetadata(file);
    
    // Infer document type from filename and type
    const documentType = inferDocumentType(file.name, file.type);
    
    return {
      ...metadata,
      documentType,
      pageCount: estimatePageCount(file.size, file.type),
      confidentialityLevel: "Standard"
    };
  } catch (error) {
    console.error("Error extracting metadata:", error);
    throw new Error("Failed to extract file metadata");
  }
}

/**
 * Save extracted text for a document
 */
async function saveExtractedText(
  documentId: string, 
  text: string, 
  structuredContent?: StructuredContent
): Promise<void> {
  try {
    // In a production environment, this would save to a database
    // For now, we'll use localStorage for persistence
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const documentIndex = savedDocuments.findIndex((doc: any) => doc.id === documentId);
    
    if (documentIndex !== -1) {
      savedDocuments[documentIndex].content = text;
      savedDocuments[documentIndex].structuredContent = structuredContent;
      savedDocuments[documentIndex].lastModified = new Date().toISOString();
      
      localStorage.setItem('documents', JSON.stringify(savedDocuments));
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error saving extracted text:", error);
    throw new Error("Failed to save extracted text");
  }
}

/**
 * Convert OCR result to JSON
 */
function convertToJSON(result: OCRResult): string {
  const jsonData = {
    document: {
      content: result.text,
      metadata: result.metadata,
      confidence: result.confidence
    },
    structuredContent: result.structuredContent
  };
  
  return JSON.stringify(jsonData, null, 2);
}

/**
 * Export OCR result as formatted text
 */
function exportAsText(result: OCRResult): string {
  let output = '';
  
  // Add document info
  output += `DOCUMENT: ${result.metadata.fileName || 'Unknown'}\n`;
  output += `TYPE: ${result.metadata.documentType || result.metadata.format || 'Unknown'}\n`;
  output += `OCR CONFIDENCE: ${Math.round(result.confidence * 100)}%\n\n`;
  
  // Add structured content if available
  if (result.structuredContent) {
    if (result.structuredContent.title) {
      output += `${result.structuredContent.title.toUpperCase()}\n\n`;
    }
    
    // Add dates if available
    if (result.metadata.dates && result.metadata.dates.length > 0) {
      output += `Date: ${result.metadata.dates[0]}\n\n`;
    }
    
    // Add parties if available
    if (result.metadata.parties && result.metadata.parties.length > 0) {
      output += `BETWEEN:\n`;
      result.metadata.parties.forEach((party, index) => {
        output += `${index + 1}. ${party}\n`;
      });
      output += '\n';
    }
    
    // Add key information if available
    if (result.structuredContent.keyInformation && Object.keys(result.structuredContent.keyInformation).length > 0) {
      output += `KEY INFORMATION:\n`;
      for (const [key, value] of Object.entries(result.structuredContent.keyInformation)) {
        output += `- ${key}: ${value}\n`;
      }
      output += '\n';
    }
    
    // Add clauses if available
    if (result.structuredContent.clauses && result.structuredContent.clauses.length > 0) {
      output += `CLAUSES:\n\n`;
      for (const clause of result.structuredContent.clauses) {
        output += `CLAUSE ${clause.number}: ${clause.title || ''}\n`;
        output += `${clause.content}\n\n`;
        
        // Add subclauses if available
        if (clause.subclauses && clause.subclauses.length > 0) {
          for (const subclause of clause.subclauses) {
            output += `${clause.number}.${subclause.number} ${subclause.content}\n`;
          }
          output += '\n';
        }
      }
    } else {
      // Add sections
      output += `CONTENT:\n\n`;
      for (const section of result.structuredContent.sections) {
        if (section.heading) {
          const prefix = '='.repeat(4 - (section.level || 1));
          output += `${prefix} ${section.heading} ${prefix}\n\n`;
        }
        output += `${section.content}\n\n`;
      }
    }
    
    // Add legal references if available
    if (result.structuredContent.legalReferences && result.structuredContent.legalReferences.length > 0) {
      output += `LEGAL REFERENCES:\n`;
      for (const ref of result.structuredContent.legalReferences) {
        output += `- ${ref}\n`;
      }
      output += '\n';
    }
    
    // Add legal terms if available
    if (result.metadata.legalTerms && result.metadata.legalTerms.length > 0) {
      output += `LEGAL TERMS:\n`;
      for (const term of result.metadata.legalTerms) {
        output += `- ${term}\n`;
      }
      output += '\n';
    }
    
    // Add signatures if available
    if (result.structuredContent.signatures && result.structuredContent.signatures.length > 0) {
      output += `SIGNATURES:\n`;
      for (const sig of result.structuredContent.signatures) {
        output += `${sig.name || 'Party'} ${sig.position ? `(${sig.position})` : ''} ${sig.date ? `Date: ${sig.date}` : ''}\n`;
      }
      output += '\n';
    }
  } else {
    // Just add the raw text
    output += `CONTENT:\n\n${result.text}\n`;
  }
  
  return output;
}

/**
 * Get metadata as JSON
 */
function getMetadataAsJSON(result: OCRResult): string {
  const metadata = {
    fileInfo: {
      name: result.metadata.fileName,
      size: result.metadata.fileSize,
      type: result.metadata.fileType,
      format: result.metadata.format,
      created: result.metadata.creationDate,
      modified: result.metadata.lastModified
    },
    documentInfo: {
      type: result.metadata.documentType,
      pageCount: result.metadata.pageCount,
      wordCount: result.metadata.totalWords,
      charCount: result.metadata.totalChars,
      confidentialityLevel: result.metadata.confidentialityLevel
    },
    ocrInfo: {
      confidence: result.confidence,
      parties: result.metadata.parties,
      dates: result.metadata.dates,
      keywords: result.metadata.keywords
    },
    keyInformation: result.structuredContent?.keyInformation || {}
  };
  
  return JSON.stringify(metadata, null, 2);
}

/**
 * Extract legal terms from text
 */
function extractLegalTerms(text: string): string[] {
  const textLower = text.toLowerCase();
  const foundTerms: string[] = [];
  
  for (const term of LEGAL_TERMS) {
    if (textLower.includes(term.toLowerCase())) {
      foundTerms.push(term);
    }
  }
  
  return foundTerms;
}

/**
 * Analyze text content to extract structured information
 */
function analyzeTextContent(text: string, filename: string): StructuredContent {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const result: StructuredContent = {
    sections: [],
    tables: [],
    signatures: [],
    legalReferences: [],
    definitions: {},
    keyInformation: {},
    clauses: []
  };
  
  // Try to extract a title (usually the first non-empty line)
  if (lines.length > 0) {
    const potentialTitle = lines[0].trim();
    if (potentialTitle.length > 3 && potentialTitle.length < 100) {
      result.title = potentialTitle;
    }
  }
  
  // Extract clauses and sections
  extractClausesAndSections(lines, result);
  
  // Basic section detection if no clauses were found
  if (result.clauses.length === 0) {
    let currentSection = { content: '', level: 1 };
    let currentHeading = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line looks like a heading
      if (line.length < 100 && 
          (line.toUpperCase() === line || 
           line.match(/^[A-Z0-9\s.]{3,}$/) || 
           line.match(/^\d+\.\s+[A-Z]/) ||
           line.match(/^[IVXLCDM]+\.\s+[A-Z]/))) {
        
        // Save the previous section if it has content
        if (currentSection.content.trim().length > 0) {
          result.sections.push({
            heading: currentHeading,
            content: currentSection.content.trim(),
            level: currentSection.level
          });
        }
        
        // Start a new section
        currentHeading = line;
        currentSection = { content: '', level: determineHeadingLevel(line) };
        
        // Extract key information from headings
        extractKeyInformation(line, lines.slice(i+1, i+3).join(' '), result.keyInformation);
        
        continue;
      }
      
      // Look for legal references
      if (line.includes('Section') || line.includes('Article') || line.match(/\b\d+\s*U\.S\.C\.\s*§\s*\d+\b/)) {
        const legalRef = line.length < 150 ? line : line.substring(0, 147) + '...';
        if (!result.legalReferences.includes(legalRef)) {
          result.legalReferences.push(legalRef);
        }
      }
      
      // Look for definitions
      const defMatch = line.match(/^["']?([A-Za-z\s]+)["']?\s+means\s+(.+)$/i);
      if (defMatch) {
        result.definitions[defMatch[1].trim()] = defMatch[2].trim();
      }
      
      // Look for signatures
      if (line.toLowerCase().includes('signature') || 
          line.toLowerCase().includes('signed by') ||
          line.match(/^[Xx][\s_]{10,}$/)) {
        result.signatures.push({
          name: extractNameFromContext(lines.slice(Math.max(0, i-2), i+3).join(' ')),
          position: extractPositionFromContext(lines.slice(Math.max(0, i-2), i+3).join(' ')),
          date: extractDateFromContext(lines.slice(Math.max(0, i-2), i+3).join(' '))
        });
      }
      
      // Add to current section content
      currentSection.content += line + '\n';
    }
    
    // Add the last section
    if (currentSection.content.trim().length > 0) {
      result.sections.push({
        heading: currentHeading,
        content: currentSection.content.trim(),
        level: currentSection.level
      });
    }
  }
  
  // Extract document-wide key information
  extractDocumentKeyInformation(text, filename, result.keyInformation);
  
  return result;
}

/**
 * Extract clauses and sections from text
 */
function extractClausesAndSections(lines: string[], result: StructuredContent): void {
  let currentClause: { number: string; title?: string; content: string; subclauses?: { number: string; content: string }[] } | null = null;
  let inClauseSection = false;
  let currentText = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Look for main clause patterns
    const clauseMatch = line.match(/^(?:CLAUSE|Article|Section)\s+(\d+|[IVXLCDM]+)(?:[\.\:])?\s*(.*)$/i);
    
    if (clauseMatch) {
      // Save previous clause if exists
      if (currentClause) {
        result.clauses.push(currentClause);
      }
      
      // Start new clause
      const clauseNumber = clauseMatch[1];
      let clauseTitle = clauseMatch[2] ? clauseMatch[2].trim() : '';
      
      // If the title is in the next line
      if (!clauseTitle && i + 1 < lines.length && !lines[i + 1].match(/^\d/)) {
        clauseTitle = lines[i + 1].trim();
        i++; // Skip the title line
      }
      
      currentClause = {
        number: clauseNumber,
        title: clauseTitle || undefined,
        content: '',
        subclauses: []
      };
      
      inClauseSection = true;
      currentText = '';
      continue;
    }
    
    // Look for subclause patterns when in a clause
    if (inClauseSection && currentClause) {
      const subclauseMatch = line.match(/^(\d+\.\d+|\([a-z]\)|\d+\)[a-z]?)\s+(.+)$/i);
      
      if (subclauseMatch) {
        // If we have accumulated text for the main clause, add it
        if (currentText.trim() && !currentClause.content) {
          currentClause.content = currentText.trim();
          currentText = '';
        }
        
        // Add subclause
        if (!currentClause.subclauses) {
          currentClause.subclauses = [];
        }
        
        currentClause.subclauses.push({
          number: subclauseMatch[1],
          content: subclauseMatch[2]
        });
        continue;
      }
    }
    
    // If we're in a clause section, add to current text
    if (inClauseSection && currentClause) {
      currentText += line + '\n';
    } else {
      // For non-clause sections, check if it looks like a section heading
      const isSectionHeading = (
        line.length < 100 && 
        (line.toUpperCase() === line || 
         line.match(/^[A-Z0-9\s.]{3,}$/) || 
         line.match(/^[IVXLCDM]+\.\s+[A-Z]/))
      );
      
      if (isSectionHeading) {
        // Add a new section
        let sectionContent = '';
        let j = i + 1;
        
        // Collect content until next section heading
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          const isNextSectionHeading = (
            nextLine.length < 100 && 
            (nextLine.toUpperCase() === nextLine || 
             nextLine.match(/^[A-Z0-9\s.]{3,}$/) || 
             nextLine.match(/^[IVXLCDM]+\.\s+[A-Z]/))
          );
          
          if (isNextSectionHeading) {
            break;
          }
          
          sectionContent += nextLine + '\n';
          j++;
        }
        
        result.sections.push({
          heading: line,
          content: sectionContent.trim(),
          level: determineHeadingLevel(line)
        });
        
        i = j - 1; // Adjust loop index
      }
    }
  }
  
  // Add the last clause if exists
  if (currentClause) {
    if (currentText.trim() && !currentClause.content) {
      currentClause.content = currentText.trim();
    }
    result.clauses.push(currentClause);
  }
}

/**
 * Determine heading level based on characteristics
 */
function determineHeadingLevel(heading: string): number {
  if (heading.match(/^[IVXLCDM]+\.\s+/)) return 1; // Roman numerals
  if (heading.match(/^\d+\.\d+\.\s+/)) return 3; // x.y.z format
  if (heading.match(/^\d+\.\s+/)) return 2; // x. format
  if (heading.match(/^[a-z]\)\s+/)) return 4; // a) format
  if (heading.toUpperCase() === heading && heading.length < 20) return 1; // ALL CAPS short headings
  return 2; // Default level
}

/**
 * Extract key information from headings and their context
 */
function extractKeyInformation(heading: string, context: string, keyInfo: Record<string, string>): void {
  const combinedText = (heading + ' ' + context).toLowerCase();
  
  // Extract dates
  const dateMatch = combinedText.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
  if (dateMatch && !keyInfo['Document Date']) {
    keyInfo['Document Date'] = dateMatch[1];
  }
  
  // Extract common key information based on heading
  const headingLower = heading.toLowerCase();
  
  if (headingLower.includes('effective date') || headingLower.includes('commencement date')) {
    const dateMatch = context.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
    if (dateMatch) {
      keyInfo['Effective Date'] = dateMatch[1];
    }
  }
  
  if (headingLower.includes('part')) {
    keyInfo['Has Parts'] = 'Yes';
  }
  
  if (headingLower.includes('term') || headingLower.includes('duration')) {
    const yearMatch = context.match(/(\d+)\s*(?:year|yr)/i);
    if (yearMatch) {
      keyInfo['Term Duration'] = `${yearMatch[1]} year(s)`;
    }
  }
}

/**
 * Extract document-wide key information
 */
function extractDocumentKeyInformation(text: string, filename: string, keyInfo: Record<string, string>): void {
  const textLower = text.toLowerCase();
  
  // Try to determine document type from content
  if (textLower.includes('agreement') && textLower.includes('between')) {
    keyInfo['Document Type'] = 'Agreement';
  } else if (textLower.includes('invoice') || textLower.includes('amount due')) {
    keyInfo['Document Type'] = 'Invoice';
    
    // Try to extract invoice number
    const invoiceMatch = text.match(/(?:invoice|reference|ref)(?:\s+no(?:\.)?)?[:.\s]+([A-Z0-9\-]{3,})/i);
    if (invoiceMatch) {
      keyInfo['Invoice Number'] = invoiceMatch[1];
    }
    
    // Try to extract total amount
    const amountMatch = text.match(/(?:total|amount|sum)(?:\s+due)?[:.\s]+[$€£]?\s*([0-9,]+\.[0-9]{2})/i);
    if (amountMatch) {
      keyInfo['Total Amount'] = amountMatch[1];
    }
  } else if (textLower.includes('contract') || (textLower.includes('terms') && textLower.includes('conditions'))) {
    keyInfo['Document Type'] = 'Contract';
  } else if (textLower.includes('policy') && (textLower.includes('insurance') || textLower.includes('covered'))) {
    keyInfo['Document Type'] = 'Insurance Policy';
  } else if (textLower.includes('receipt')) {
    keyInfo['Document Type'] = 'Receipt';
  }
  
  // Look for parties in the document
  const partiesMatch = text.match(/between\s+([^.]{3,50})\s+and\s+([^.]{3,50})/i);
  if (partiesMatch) {
    keyInfo['Party A'] = partiesMatch[1].trim();
    keyInfo['Party B'] = partiesMatch[2].trim();
  }
  
  // Look for dates
  const dateMatches = text.match(/(?:dated|date)[:.\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  if (dateMatches && !keyInfo['Document Date']) {
    keyInfo['Document Date'] = dateMatches[1];
  }
}

/**
 * Extract a name from surrounding context of a signature
 */
function extractNameFromContext(context: string): string | undefined {
  // Look for patterns like "Name: John Smith" or "John Smith, CEO"
  const nameMatch = context.match(/name:\s*([A-Za-z\s.]{2,30})/i) || 
                    context.match(/signed by:\s*([A-Za-z\s.]{2,30})/i) ||
                    context.match(/([A-Za-z]{2,20}\s+[A-Za-z]{2,20}),\s+(?:CEO|President|Director|Manager)/i);
  
  return nameMatch ? nameMatch[1].trim() : undefined;
}

/**
 * Extract a job position from surrounding context of a signature
 */
function extractPositionFromContext(context: string): string | undefined {
  // Look for patterns like "Position: CEO" or "John Smith, CEO"
  const positionMatch = context.match(/position:\s*([A-Za-z\s.]{2,30})/i) || 
                         context.match(/title:\s*([A-Za-z\s.]{2,30})/i) ||
                         context.match(/[A-Za-z\s.]{2,30},\s+([A-Za-z\s&]{2,30})/i);
  
  return positionMatch ? positionMatch[1].trim() : undefined;
}

/**
 * Extract a date from surrounding context of a signature
 */
function extractDateFromContext(context: string): string | undefined {
  // Look for date patterns
  const dateMatch = context.match(/date:\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i) ||
                    context.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
  
  return dateMatch ? dateMatch[1].trim() : undefined;
}

/**
 * Infer document type from filename and mime type
 */
function inferDocumentType(filename: string, mimeType: string): string {
  const filenameLower = filename.toLowerCase();
  
  if (filenameLower.includes('invoice')) {
    return 'Invoice';
  } else if (filenameLower.includes('receipt')) {
    return 'Receipt';
  } else if (filenameLower.includes('contract')) {
    return 'Contract';
  } else if (filenameLower.includes('agreement')) {
    return 'Agreement';
  } else if (filenameLower.includes('letter')) {
    return 'Letter';
  } else if (filenameLower.includes('policy')) {
    return 'Policy Document';
  } else if (filenameLower.includes('report')) {
    return 'Report';
  } else if (filenameLower.includes('statement')) {
    return 'Statement';
  } else if (filenameLower.includes('form')) {
    return 'Form';
  } else if (mimeType.includes('image')) {
    return 'Image';
  } else if (mimeType.includes('pdf')) {
    return 'PDF Document';
  } else if (mimeType.includes('word') || mimeType.includes('document')) {
    return 'Word Document';
  }
  
  return 'Document';
}

/**
 * Estimate page count based on file size and type
 */
function estimatePageCount(fileSize: number, mimeType: string): number {
  // Very rough estimates
  if (mimeType.includes('image')) {
    return 1;
  } else if (mimeType.includes('pdf')) {
    // Rough estimate: 1 page per 50KB
    return Math.max(1, Math.round(fileSize / (50 * 1024)));
  } else if (mimeType.includes('word') || mimeType.includes('document')) {
    // Rough estimate: 1 page per 30KB
    return Math.max(1, Math.round(fileSize / (30 * 1024)));
  }
  
  return 1;
}

export default {
  extractText,
  extractFileMetadata,
  saveExtractedText,
  convertToJSON,
  exportAsText,
  getMetadataAsJSON
};
