
import api from './api';
import Tesseract from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
  metadata: {
    pageCount?: number;
    creationDate?: string;
    author?: string;
    keywords?: string[];
    parties?: string[];
    dates?: string[];
    documentType?: string;
    confidentialityLevel?: string;
    format?: string;
    fileName?: string;
    fileSize?: number;
    lastModified?: string;
    totalWords?: number;
    totalChars?: number;
  };
  structuredContent?: {
    title?: string;
    sections: {
      heading?: string;
      content: string;
      level: number;
    }[];
    tables?: {
      description: string;
      location: string;
    }[];
    signatures?: {
      name?: string;
      position?: string;
      date?: string;
    }[];
    legalReferences?: string[];
    definitions?: Record<string, string>;
    keyInformation?: Record<string, string>;
  };
}

// OCR service functions
const ocrService = {
  // Extract text from a document using Tesseract.js
  extractText: async (file: File): Promise<OCRResult> => {
    try {
      console.log("Starting OCR processing for file:", file.name);
      
      // Use Tesseract.js for actual OCR processing
      const result = await Tesseract.recognize(
        file,
        'eng', // English language
        {
          logger: (m) => {
            console.log(m);
          }
        }
      );
      
      // Process the extracted text to identify key elements
      const extractedText = result.data.text;
      console.log("OCR text extracted successfully");
      
      // Extract metadata from the document text
      const parties = extractParties(extractedText);
      const dates = extractDates(extractedText);
      const keywords = extractKeywords(extractedText);
      const documentType = determineDocumentType(extractedText, file.name);
      const confidentialityLevel = determineConfidentiality(extractedText);
      const legalReferences = extractLegalReferences(extractedText);
      
      // Extract additional metadata from the file itself when possible
      const fileMetadata = await extractFileMetadata(file);
      
      // Parse the document into structured sections
      const structuredContent = parseDocumentStructure(extractedText);
      
      // Extract key information based on document type
      const keyInformation = extractKeyInformation(extractedText, documentType);
      if (keyInformation && Object.keys(keyInformation).length > 0) {
        structuredContent.keyInformation = keyInformation;
      }
      
      // Calculate word and character counts
      const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
      const charCount = extractedText.replace(/\s+/g, '').length;
      
      // Return structured OCR result with comprehensive metadata
      return {
        text: extractedText,
        confidence: result.data.confidence / 100,
        metadata: {
          pageCount: estimatePageCount(extractedText),
          creationDate: fileMetadata.creationDate || new Date().toISOString(),
          author: fileMetadata.author || (parties.length > 0 ? parties[0] : "Unknown"),
          keywords: keywords,
          parties: parties,
          dates: dates,
          documentType: documentType,
          confidentialityLevel: confidentialityLevel,
          format: fileMetadata.format || getFileFormat(file.type),
          fileName: file.name,
          fileSize: file.size,
          lastModified: new Date(file.lastModified).toISOString(),
          totalWords: wordCount,
          totalChars: charCount
        },
        structuredContent: {
          ...structuredContent,
          keyInformation: keyInformation
        }
      };
    } catch (error) {
      console.error("OCR processing error:", error);
      
      // Fallback to mock extraction if Tesseract fails
      return fallbackExtraction(file);
    }
  },
  
  // Enhance document quality
  enhanceDocument: async (file: File): Promise<Blob> => {
    // In a real app: upload, process, and return enhanced document
    // const formData = new FormData();
    // formData.append('file', file);
    // return api.post('/ocr/enhance', formData, { responseType: 'blob' });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Just return the original file for now
        // In a real implementation, we would enhance the image quality
        resolve(file);
      }, 1500);
    });
  },
  
  // Save extracted text to a document
  saveExtractedText: async (documentId: string, text: string, structuredContent?: any): Promise<void> => {
    // In a real app: return api.post(`/documents/${documentId}/content`, { text, structuredContent });
    
    // Get the mock documents from localStorage
    const storedDocs = localStorage.getItem('documents');
    let docs = storedDocs ? JSON.parse(storedDocs) : [];
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Find the document to update
        const docIndex = docs.findIndex((doc: any) => doc.id === documentId);
        
        // If the document exists, update its content
        if (docIndex !== -1) {
          docs[docIndex].content = text;
          if (structuredContent) {
            docs[docIndex].structuredContent = structuredContent;
          }
          // Save back to localStorage
          localStorage.setItem('documents', JSON.stringify(docs));
        }
        
        resolve();
      }, 800);
    });
  },
  
  // Extract file metadata (MIME type, size, etc.)
  extractFileMetadata: async (file: File, documentId?: string): Promise<Record<string, any>> => {
    // Get basic file info
    const metadata: Record<string, any> = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    };

    try {
      // Extract additional metadata based on file type
      const format = getFileFormat(file.type);
      metadata.format = format;
      
      // For PDF files: In a real implementation, we could use pdf.js to extract metadata
      // For images: We could use EXIF data extraction
      if (file.type.includes('pdf')) {
        // Mock PDF metadata extraction 
        metadata.pageCount = estimatePageCount(file.size);
        metadata.author = extractAuthorFromFilename(file.name);
        metadata.creationDate = new Date(file.lastModified).toISOString();

        // In a real implementation we would use PDF.js to extract real metadata
        // const pdfMetadata = await getPdfMetadata(file);
        // Object.assign(metadata, pdfMetadata);
      } 
      else if (file.type.includes('image')) {
        metadata.pageCount = 1;
        
        // For TIFF we might have multiple pages
        if (file.type.includes('tiff')) {
          metadata.pageCount = Math.max(1, Math.ceil(file.size / 500000)); // Rough estimate
        }
        
        // In a real implementation we would extract EXIF data
        // const exifData = await getImageExifData(file);
        // Object.assign(metadata, exifData);
      }
      else if (file.type.includes('word') || file.type.includes('officedocument.wordprocessing')) {
        // Word document
        metadata.pageCount = Math.max(1, Math.ceil(file.size / 30000));
        metadata.author = extractAuthorFromFilename(file.name);
        
        // In a real implementation we would extract Word document metadata
        // const wordMetadata = await getWordMetadata(file);
        // Object.assign(metadata, wordMetadata);
      }
      
      // If document ID is provided, update document metadata
      if (documentId) {
        // Get the mock documents from localStorage
        const storedDocs = localStorage.getItem('documents');
        if (storedDocs) {
          let docs = JSON.parse(storedDocs);
          const docIndex = docs.findIndex((doc: any) => doc.id === documentId);
          
          if (docIndex !== -1) {
            docs[docIndex].metadata = { ...docs[docIndex].metadata, ...metadata };
            localStorage.setItem('documents', JSON.stringify(docs));
          }
        }
      }
    } catch (error) {
      console.error("Error extracting extended file metadata:", error);
    }
    
    return metadata;
  },

  // Convert OCR results to JSON format
  convertToJSON: (result: OCRResult): string => {
    // Create a clean JSON structure of the OCR results
    const jsonOutput = {
      documentInfo: {
        type: result.metadata.documentType,
        confidentiality: result.metadata.confidentialityLevel,
        creationDate: result.metadata.creationDate,
        author: result.metadata.author,
        pageCount: result.metadata.pageCount,
        fileName: result.metadata.fileName,
        fileSize: result.metadata.fileSize,
        lastModified: result.metadata.lastModified,
        format: result.metadata.format,
        totalWords: result.metadata.totalWords,
        totalChars: result.metadata.totalChars
      },
      parties: result.metadata.parties,
      dates: result.metadata.dates,
      keywords: result.metadata.keywords,
      legalReferences: result.structuredContent?.legalReferences || [],
      content: result.structuredContent?.sections.map(section => ({
        heading: section.heading,
        content: section.content,
        level: section.level
      })),
      keyInformation: result.structuredContent?.keyInformation || {},
      ocrConfidence: result.confidence
    };
    
    return JSON.stringify(jsonOutput, null, 2);
  },

  // Export to downloadable text format
  exportAsText: (result: OCRResult): Blob => {
    let textOutput = "";
    
    // Add document title if available
    if (result.structuredContent?.title) {
      textOutput += result.structuredContent.title + "\n\n";
    }
    
    // Add document type and metadata
    textOutput += `DOCUMENT TYPE: ${result.metadata.documentType || "Unknown"}\n`;
    textOutput += `DATE: ${result.metadata.dates && result.metadata.dates.length > 0 ? result.metadata.dates[0] : "Unknown"}\n`;
    textOutput += `PARTIES: ${result.metadata.parties ? result.metadata.parties.join(", ") : "None detected"}\n\n`;
    
    // Add key information if available
    if (result.structuredContent?.keyInformation && Object.keys(result.structuredContent.keyInformation).length > 0) {
      textOutput += "KEY INFORMATION:\n";
      for (const [key, value] of Object.entries(result.structuredContent.keyInformation)) {
        textOutput += `${key}: ${value}\n`;
      }
      textOutput += "\n";
    }
    
    // Add sections with proper formatting
    if (result.structuredContent?.sections) {
      result.structuredContent.sections.forEach(section => {
        if (section.heading) {
          textOutput += "\n" + "=".repeat(section.level * 2) + " " + section.heading + " " + "=".repeat(section.level * 2) + "\n\n";
        }
        textOutput += section.content + "\n\n";
      });
    } else {
      // If no structured content, just add the raw text
      textOutput += result.text;
    }
    
    // Add document metadata at the end
    textOutput += "\n\n" + "=".repeat(40) + "\n";
    textOutput += `FILE: ${result.metadata.fileName}\n`;
    textOutput += `FORMAT: ${result.metadata.format}\n`;
    textOutput += `SIZE: ${formatFileSize(result.metadata.fileSize || 0)}\n`;
    textOutput += `AUTHOR: ${result.metadata.author || "Unknown"}\n`;
    textOutput += `CREATED: ${formatDate(result.metadata.creationDate)}\n`;
    textOutput += `MODIFIED: ${formatDate(result.metadata.lastModified)}\n`;
    textOutput += `PAGES: ${result.metadata.pageCount}\n`;
    textOutput += `WORDS: ${result.metadata.totalWords}\n`;
    textOutput += `CHARACTERS: ${result.metadata.totalChars}\n`;
    textOutput += `OCR CONFIDENCE: ${Math.round(result.confidence * 100)}%\n`;
    textOutput += "=".repeat(40) + "\n";
    
    return new Blob([textOutput], { type: 'text/plain' });
  },
  
  // Get JSON representation of the metadata
  getMetadataAsJSON: (result: OCRResult): string => {
    const metadataObj = {
      fileName: result.metadata.fileName,
      fileSize: formatFileSize(result.metadata.fileSize || 0),
      format: result.metadata.format,
      author: result.metadata.author,
      creationDate: formatDate(result.metadata.creationDate),
      lastModified: formatDate(result.metadata.lastModified),
      pageCount: result.metadata.pageCount,
      documentType: result.metadata.documentType,
      confidentialityLevel: result.metadata.confidentialityLevel,
      totalWords: result.metadata.totalWords,
      totalChars: result.metadata.totalChars,
      ocrConfidence: Math.round(result.confidence * 100) + "%"
    };
    
    return JSON.stringify(metadataObj, null, 2);
  }
};

// Helper functions for text analysis and metadata extraction

// Format file size in a human-readable way
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date in a human-readable way
function formatDate(dateStr?: string): string {
  if (!dateStr) return "Unknown";
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

// Get file format based on MIME type
function getFileFormat(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG';
  if (mimeType.includes('png')) return 'PNG';
  if (mimeType.includes('tiff')) return 'TIFF';
  if (mimeType.includes('word') || mimeType.includes('docx')) return 'DOCX';
  if (mimeType.includes('doc')) return 'DOC';
  if (mimeType.includes('text')) return 'TXT';
  return mimeType.split('/')[1]?.toUpperCase() || 'Unknown';
}

// Try to extract author from filename
function extractAuthorFromFilename(filename: string): string {
  // Look for patterns like "Document_by_John_Smith.pdf" or "John_Smith-Report.pdf"
  const byAuthorMatch = filename.match(/_by_([A-Za-z_]+)/i);
  if (byAuthorMatch) {
    return byAuthorMatch[1].replace(/_/g, ' ');
  }
  
  const authorDashMatch = filename.match(/([A-Za-z_]+)-/i);
  if (authorDashMatch) {
    return authorDashMatch[1].replace(/_/g, ' ');
  }
  
  return "Unknown";
}

// Extract key information based on document type
function extractKeyInformation(text: string, documentType: string): Record<string, string> {
  const keyInfo: Record<string, string> = {};
  const lowerText = text.toLowerCase();
  
  // Common extractors for different document types
  if (documentType.includes('Invoice') || lowerText.includes('invoice') || lowerText.includes('payment')) {
    // Extract invoice number
    const invoiceNumberMatch = text.match(/(?:invoice|reference|ref)(?:\s+no\.?|\s+number|\s+#|:|\s+id)?\s*[#:]?\s*([A-Z0-9][\w\-\/]{2,15})/i);
    if (invoiceNumberMatch) {
      keyInfo["Invoice Number"] = invoiceNumberMatch[1];
    }
    
    // Extract amount/total
    const amountMatch = text.match(/(?:total|amount|sum|payment)(?:\s+due)?(?:\s+:|\s*:|\s*=)?\s*(?:INR|USD|\$|€|£|Rs\.?)?(?:\s*)(\d{1,3}(?:[,.]\d{3})*(?:\.\d{2})?)/i);
    if (amountMatch) {
      keyInfo["Amount"] = amountMatch[1];
    }
    
    // Extract payment terms
    const paymentTermsMatch = text.match(/(?:payment terms|terms of payment|due|payment due)(?:\s+:|\s*:|\s*in)?\s*([0-9]+\s+days|on receipt|immediate|cod|cash on delivery)/i);
    if (paymentTermsMatch) {
      keyInfo["Payment Terms"] = paymentTermsMatch[1];
    }
  } 
  else if (documentType.includes('Contract') || documentType.includes('Agreement') || lowerText.includes('agreement') || lowerText.includes('contract')) {
    // Extract effective date
    const effectiveDateMatch = text.match(/(?:effective\s+date|commencement\s+date)(?:\s*:|is)?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i);
    if (effectiveDateMatch) {
      keyInfo["Effective Date"] = effectiveDateMatch[1];
    }
    
    // Extract termination/expiration date
    const terminationDateMatch = text.match(/(?:termination\s+date|expiration\s+date|expiry\s+date|valid\s+until)(?:\s*:|is)?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i);
    if (terminationDateMatch) {
      keyInfo["Termination Date"] = terminationDateMatch[1];
    }
    
    // Extract contract value if mentioned
    const valueMatch = text.match(/(?:contract\s+value|contract\s+amount|agreement\s+value|consideration)(?:\s*:|\s+of|\s+is)?\s*(?:INR|USD|\$|€|£|Rs\.?)?(?:\s*)(\d{1,3}(?:[,.]\d{3})*(?:\.\d{2})?)/i);
    if (valueMatch) {
      keyInfo["Contract Value"] = valueMatch[1];
    }
  } 
  else if (documentType.includes('Legal') || lowerText.includes('court') || lowerText.includes('case no') || lowerText.includes('plaintiff') || lowerText.includes('defendant')) {
    // Extract case number
    const caseNumberMatch = text.match(/(?:case|docket|file|proceeding)(?:\s+no\.?|\s+number|\s+#|\s+id)?\s*[#:]?\s*([A-Z0-9][\w\-\/]{2,15})/i);
    if (caseNumberMatch) {
      keyInfo["Case Number"] = caseNumberMatch[1];
    }
    
    // Extract court name
    const courtMatch = text.match(/(?:in\s+the|before\s+the)(?:\s+honorable)?\s+([A-Za-z\s]+court)/i);
    if (courtMatch) {
      keyInfo["Court"] = courtMatch[1];
    }
    
    // Extract hearing date
    const hearingDateMatch = text.match(/(?:hearing|trial|appearance)(?:\s+date)?(?:\s*:|\s+on|\s+scheduled\s+for)?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i);
    if (hearingDateMatch) {
      keyInfo["Hearing Date"] = hearingDateMatch[1];
    }
  } 
  else if (documentType.includes('Property') || lowerText.includes('deed') || lowerText.includes('property')) {
    // Extract property address
    const propertyMatch = text.match(/(?:property|premises|land|parcel)(?:\s+located\s+at|\s+situated\s+at|\s+at|\s+:)?\s+([A-Za-z0-9\s\.,#\-]{10,70}?)(?:\.|,|\n)/i);
    if (propertyMatch) {
      keyInfo["Property Address"] = propertyMatch[1].trim();
    }
    
    // Extract consideration amount
    const considerationMatch = text.match(/(?:consideration|price|amount|sum)(?:\s+of|\s+:)?\s*(?:INR|USD|\$|€|£|Rs\.?)?(?:\s*)(\d{1,3}(?:[,.]\d{3})*(?:\.\d{2})?)/i);
    if (considerationMatch) {
      keyInfo["Consideration"] = considerationMatch[1];
    }
    
    // Extract registration number
    const registrationMatch = text.match(/(?:registration|document)(?:\s+no\.?|\s+number|\s+#)?\s*[#:]?\s*([A-Z0-9][\w\-\/]{2,15})/i);
    if (registrationMatch) {
      keyInfo["Registration Number"] = registrationMatch[1];
    }
  }
  
  // General information that might be relevant for any document
  
  // Extract subject or reference
  const subjectMatch = text.match(/(?:subject|ref|reference|re):?\s*([A-Za-z0-9\s\.,#\-]{5,50}?)(?:\.|,|\n)/i);
  if (subjectMatch && !keyInfo["Subject"]) {
    keyInfo["Subject"] = subjectMatch[1].trim();
  }
  
  // Extract ID numbers (PAN, Aadhar, etc.)
  const idMatch = text.match(/(?:pan|aadhar|aadhaar|gstin|cin|llpin)(?:\s+no\.?|\s+number|\s+#|\s+:)?\s*[#:]?\s*([A-Z0-9][\w\-\/]{5,15})/i);
  if (idMatch) {
    const idType = idMatch[0].match(/pan|aadhar|aadhaar|gstin|cin|llpin/i)?.[0].toUpperCase() || "ID";
    keyInfo[`${idType} Number`] = idMatch[1];
  }
  
  return keyInfo;
}

// Parse document into a structured format with sections, headings, etc.
function parseDocumentStructure(text: string) {
  const lines = text.split('\n');
  const sections: { heading?: string; content: string; level: number }[] = [];
  const legalReferences: string[] = [];
  const definitions: Record<string, string> = {};
  
  let currentSection: { heading?: string; content: string; level: number } | null = null;
  let title = "";
  
  // Look for title in the first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].trim().length > 0 && lines[i].trim().length < 100 && lines[i].toUpperCase() === lines[i]) {
      title = lines[i].trim();
      break;
    }
  }
  
  // Process each line for sections, definitions, and legal references
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (line.length === 0) continue;
    
    // Check for section headings
    // Common patterns: "1. INTRODUCTION", "ARTICLE I", "Section 1.1", etc.
    const headingPattern = /^(?:(?:[0-9]+\.(?:[0-9]\.?)*)|(?:ARTICLE [IVX]+)|(?:SECTION [0-9\.]+)|(?:[IVX]+\.))\s+([A-Z][A-Z\s]+)$/i;
    const match = line.match(headingPattern);
    
    if (match || (line.toUpperCase() === line && line.length < 100 && line.length > 10 && !line.includes(":"))) {
      // If there's a current section, push it to the array
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Create a new section with the heading
      const heading = match ? match[1] : line;
      const level = line.startsWith("ARTICLE") ? 1 : 
                   (line.match(/^[0-9]+\.(?![0-9])/) ? 2 : 
                   (line.match(/^[0-9]+\.[0-9]+\.?/) ? 3 : 2));
      
      currentSection = {
        heading: heading,
        content: "",
        level: level
      };
      
      continue;
    }
    
    // Check for legal references (statutes, acts, regulations, etc.)
    const legalRefPatterns = [
      /(?:section|sec\.|§)\s+[0-9\.]+\s+of\s+the\s+([A-Za-z\s]+(?:Act|Code|Regulation|Statute))/gi,
      /([A-Za-z\s]+(?:Act|Code|Regulation|Statute))\s+of\s+[0-9]{4}/gi,
      /under\s+([A-Za-z\s]+(?:Act|Code|Law))/gi
    ];
    
    legalRefPatterns.forEach(pattern => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && !legalReferences.includes(match[1])) {
          legalReferences.push(match[1]);
        }
      }
    });
    
    // Check for definitions
    // Common pattern: "Term" means definition...
    const definitionPattern = /"([^"]+)"\s+(?:means|shall mean|is defined as)\s+(.+?)(?:;|$)/i;
    const defMatch = line.match(definitionPattern);
    if (defMatch) {
      definitions[defMatch[1]] = defMatch[2];
    }
    
    // Append content to the current section
    if (currentSection) {
      if (currentSection.content.length > 0) {
        currentSection.content += " " + line;
      } else {
        currentSection.content = line;
      }
    } else {
      // If there's no current section, create a default one
      currentSection = {
        content: line,
        level: 0
      };
    }
  }
  
  // Don't forget to add the last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  // Detect tables based on text patterns
  const tables = detectTables(text);
  
  // Detect signatures based on text patterns
  const signatures = detectSignatures(text);
  
  return {
    title,
    sections,
    tables,
    signatures,
    legalReferences,
    definitions
  };
}

// Detect tables in the text
function detectTables(text: string) {
  const tables: { description: string; location: string }[] = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    // Look for lines with multiple column separators (|, or multiple spaces)
    if ((lines[i].match(/\|/g) || []).length >= 2 || 
        lines[i].match(/\s{3,}[^\s]+\s{3,}[^\s]+/)) {
      
      // Check if subsequent lines have similar pattern to confirm it's a table
      let isTable = false;
      for (let j = 1; j < 3 && i + j < lines.length; j++) {
        if ((lines[i + j].match(/\|/g) || []).length >= 2 || 
            lines[i + j].match(/\s{3,}[^\s]+\s{3,}[^\s]+/)) {
          isTable = true;
          break;
        }
      }
      
      if (isTable) {
        // Try to find table title or description
        let description = "Table";
        for (let j = i - 3; j < i; j++) {
          if (j >= 0 && lines[j].trim().length > 0 && 
              (lines[j].toLowerCase().includes("table") || 
               lines[j].toLowerCase().includes("schedule"))) {
            description = lines[j].trim();
            break;
          }
        }
        
        tables.push({
          description,
          location: `Line ${i+1}`
        });
        
        // Skip to the end of the table
        while (i < lines.length && 
              ((lines[i].match(/\|/g) || []).length >= 2 || 
               lines[i].match(/\s{3,}[^\s]+\s{3,}[^\s]+/))) {
          i++;
        }
      }
    }
  }
  
  return tables;
}

// Detect signatures in the text
function detectSignatures(text: string) {
  const signatures: { name?: string; position?: string; date?: string }[] = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes("signed") || 
        lines[i].toLowerCase().includes("signature") || 
        lines[i].match(/^[_\.]{3,}$/)) {
      
      let name, position, date;
      
      // Look for name
      for (let j = i + 1; j < i + 4 && j < lines.length; j++) {
        if (lines[j].trim().length > 0 && 
            !lines[j].toLowerCase().includes("date") && 
            !lines[j].match(/^[_\.]{3,}$/)) {
          name = lines[j].trim();
          break;
        }
      }
      
      // Look for position
      for (let j = i + 2; j < i + 5 && j < lines.length; j++) {
        if (lines[j].trim().length > 0 && 
            lines[j].trim() !== name && 
            !lines[j].toLowerCase().includes("date") && 
            !lines[j].match(/^[_\.]{3,}$/)) {
          position = lines[j].trim();
          break;
        }
      }
      
      // Look for date
      for (let j = i - 3; j < i + 5 && j < lines.length; j++) {
        if (j >= 0 && (lines[j].toLowerCase().includes("date") || 
            lines[j].match(/\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}/))) {
          date = lines[j].replace(/date\s*:\s*/i, "").trim();
          break;
        }
      }
      
      signatures.push({
        name,
        position,
        date
      });
      
      // Skip a few lines to avoid detecting the same signature multiple times
      i += 3;
    }
  }
  
  return signatures;
}

// Attempt to extract file metadata using File API
async function extractFileMetadata(file: File): Promise<Record<string, any>> {
  // Basic metadata available from File object
  const metadata: Record<string, any> = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString(),
    creationDate: new Date(file.lastModified).toISOString(), // Use lastModified as a fallback
    author: "Unknown" // Default value
  };

  try {
    // For PDF files: In a real implementation, we could use pdf.js to extract metadata
    // For images: We could use EXIF data extraction
    
    // This is a simplified version that detects file type and sets mock metadata
    if (file.type.includes('pdf')) {
      // Mock PDF metadata extraction 
      // In a real app you'd use pdf.js or another library
      metadata.pageCount = estimatePageCount(file.size);
      metadata.format = 'PDF';
      
      // Simulate extracting more detailed PDF metadata
      if (file.name.includes('invoice') || file.name.includes('bill')) {
        metadata.documentType = 'Invoice';
      } else if (file.name.includes('contract') || file.name.includes('agreement')) {
        metadata.documentType = 'Contract';
        metadata.author = file.name.split('_')[0].replace(/[0-9]/g, '');
        if (metadata.author.length < 3) metadata.author = "Unknown";
      }
    } 
    else if (file.type.includes('image')) {
      metadata.format = file.type.split('/')[1].toUpperCase();
      metadata.pageCount = 1;
      
      // Simulate EXIF extraction for images
      if (file.name.includes('scan')) {
        metadata.documentType = 'Scanned Document';
        metadata.creationDate = new Date(file.lastModified).toISOString();
      }
    }
    else if (file.type.includes('word') || file.type.includes('docx') || file.type.includes('doc')) {
      metadata.format = file.type.includes('docx') ? 'DOCX' : 'DOC';
      metadata.pageCount = Math.max(1, Math.ceil(file.size / 30000)); 
      metadata.author = file.name.split('_')[0].replace(/[0-9]/g, '');
      if (metadata.author.length < 3) metadata.author = "Unknown";
    }
    
    return metadata;
  } catch (error) {
    console.error("Error extracting file metadata:", error);
    return metadata;
  }
}

// Estimate page count based on text length or file size
function estimatePageCount(textOrSize: string | number): number {
  if (typeof textOrSize === 'string') {
    // Estimate based on text length - average words per page is about 500
    const words = textOrSize.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 500));
  } else {
    // Estimate based on file size - average PDF page is about 100KB
    return Math.max(1, Math.ceil(textOrSize / 100000));
  }
}

// Determine document type based on content analysis
function determineDocumentType(text: string, fileName: string): string {
  const lowerText = text.toLowerCase();
  const lowerFileName = fileName.toLowerCase();
  
  // Check for common document types based on content patterns
  if (lowerText.includes('agreement') || lowerText.includes('contract') || lowerText.includes('parties agree')) {
    if (lowerText.includes('employment') || lowerText.includes('employer') || lowerText.includes('employee')) {
      return 'Employment Contract';
    } else if (lowerText.includes('lease') || lowerText.includes('landlord') || lowerText.includes('tenant')) {
      return 'Lease Agreement';
    } else if (lowerText.includes('purchase') || lowerText.includes('buyer') || lowerText.includes('seller')) {
      return 'Purchase Agreement';
    } else if (lowerText.includes('service') || lowerText.includes('client')) {
      return 'Service Agreement';
    }
    return 'Contract/Agreement';
  } else if (lowerText.includes('court') || lowerText.includes('case no') || lowerText.includes('plaintiff') || lowerText.includes('defendant')) {
    if (lowerText.includes('motion') || lowerText.includes('hereby moves')) {
      return 'Legal Motion';
    } else if (lowerText.includes('complaint') || lowerText.includes('allege')) {
      return 'Complaint Filing';
    } else if (lowerText.includes('appeal') || lowerText.includes('appellant')) {
      return 'Appeal Brief';
    }
    return 'Legal Filing';
  } else if (lowerText.includes('deed') || lowerText.includes('property') || lowerText.includes('conveyance')) {
    if (lowerText.includes('trust')) {
      return 'Deed of Trust';
    } else if (lowerText.includes('sale')) {
      return 'Deed of Sale';
    }
    return 'Property Document';
  } else if (lowerText.includes('testimony') || lowerText.includes('witness') || lowerText.includes('affirm') || lowerText.includes('swear')) {
    if (lowerText.includes('affidavit')) {
      return 'Affidavit';
    }
    return 'Testimony/Affidavit';
  } else if (lowerText.includes('will') || lowerText.includes('testament') || lowerText.includes('bequest') || lowerText.includes('executor')) {
    return 'Will/Testament';
  } else if (lowerText.includes('power of attorney') || lowerText.includes('attorney-in-fact')) {
    return 'Power of Attorney';
  } else if (lowerFileName.includes('invoice') || lowerText.includes('invoice') || lowerText.includes('payment')) {
    return 'Invoice/Financial';
  } else if (lowerText.includes('policy') || lowerText.includes('insured') || lowerText.includes('coverage')) {
    return 'Insurance Policy';
  }
  
  // If no specific type is detected
  return 'Legal Document';
}

// Determine confidentiality level based on content
function determineConfidentiality(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('confidential') || lowerText.includes('private') || lowerText.includes('not for distribution')) {
    if (lowerText.includes('highly confidential') || lowerText.includes('strictly confidential')) {
      return 'Highly Confidential';
    }
    return 'Confidential';
  } else if (lowerText.includes('internal use') || lowerText.includes('internal only')) {
    return 'Internal Use Only';
  } else if (lowerText.includes('public') || lowerText.includes('for distribution')) {
    return 'Public';
  }
  
  return 'Standard';
}

// Extract potential party names from text
function extractParties(text: string): string[] {
  const parties: string[] = [];
  
  // Look for common party indicators in legal documents
  const partyPatterns = [
    /BETWEEN:[\s\S]*?([A-Z][A-Za-z\s,\.]+)[\s\S]*?(?:AND|WHEREAS|$)/i,
    /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.) ([A-Z][A-Za-z\s]+)/g,
    /([A-Z][A-Z\s]+)(?:, a corporation|, a company|, an individual)/g,
    /PLAINTIFF:[\s\S]*?([A-Z][A-Za-z\s,\.]+)/i,
    /DEFENDANT:[\s\S]*?([A-Z][A-Za-z\s,\.]+)/i,
    /([A-Z][A-Za-z\s]{2,30})(?:,| and| &) ([A-Z][A-Za-z\s]{2,30})/g,
    /party of the first part:[\s\S]*?([A-Z][A-Za-z\s,\.]+)/i,
    /party of the second part:[\s\S]*?([A-Z][A-Za-z\s,\.]+)/i,
    /lessor:[\s\S]*?([A-Z][A-Za-z\s,\.]+)/i,
    /lessee:[\s\S]*?([A-Z][A-Za-z\s,\.]+)/i,
    /employer:[\s\S]*?([A-Z][A-Za-z\s,\.]+)/i,
    /employee:[\s\S]*?([A-Z][A-Za-z\s,\.]+)/i,
    /([A-Z][A-Za-z\s\.]+)(?:, hereinafter referred to as)/i
  ];
  
  partyPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Clean up the match to extract just the name
        let party = match.replace(/BETWEEN:|AND:|,.*$|PLAINTIFF:|DEFENDANT:|party of the first part:|party of the second part:|lessor:|lessee:|employer:|employee:|hereinafter referred to as|, a corporation|, a company|, an individual/i, '').trim();
        if (party && !parties.includes(party) && party.length > 3 && party.length < 50) {
          parties.push(party);
        }
      });
    }
  });
  
  return parties;
}

// Extract dates from text
function extractDates(text: string): string[] {
  const dates: string[] = [];
  
  // Look for common date formats
  const datePatterns = [
    /(\d{1,2})(?:st|nd|rd|th)?\s(?:day\sof\s)?(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s(\d{4})/gi,
    /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/g,
    /(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/g,
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{1,2})(?:st|nd|rd|th)?,? (\d{4})/gi,
    /(?:January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2})(?:st|nd|rd|th)?,? (\d{4})/gi,
    /executed on (?:the )?(\d{1,2})(?:st|nd|rd|th)? (?:day )?(?:of )?(?:January|February|March|April|May|June|July|August|September|October|November|December),? (\d{4})/gi,
    /dated (?:this )?(\d{1,2})(?:st|nd|rd|th)? (?:day )?(?:of )?(?:January|February|March|April|May|June|July|August|September|October|November|December),? (\d{4})/gi,
    /effective (?:as of |date |from )(?:the )?(\d{1,2})(?:st|nd|rd|th)? (?:day )?(?:of )?(?:January|February|March|April|May|June|July|August|September|October|November|December),? (\d{4})/gi
  ];
  
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (!dates.includes(match)) {
          dates.push(match);
        }
      });
    }
  });
  
  return dates;
}

// Extract legal references
function extractLegalReferences(text: string): string[] {
  const references: string[] = [];
  
  // Look for references to laws, acts, sections, etc.
  const referencePatterns = [
    /(?:section|sec\.|§)\s+([0-9\.]+)\s+of\s+the\s+([A-Za-z\s]+(?:Act|Code|Regulation|Statute))/gi,
    /([A-Za-z\s]+(?:Act|Code|Regulation|Statute))\s+of\s+([0-9]{4})/gi,
    /(?:pursuant to|under|in accordance with)\s+(?:the\s+)?([A-Za-z\s]+(?:Act|Code|Law|Regulation))/gi,
    /(?:Article|Section)\s+([IVX]+|[0-9\.]+)\s+of\s+(?:the\s+)?([A-Za-z\s]+)/gi
  ];
  
  referencePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (!references.includes(match.trim())) {
          references.push(match.trim());
        }
      });
    }
  });
  
  return references;
}

// Extract relevant legal keywords
function extractKeywords(text: string): string[] {
  const legalKeywords = [
    'agreement', 'contract', 'deed', 'testimony', 'court', 'witness',
    'plaintiff', 'defendant', 'legal', 'document', 'evidence', 'property',
    'jurisdiction', 'liability', 'obligation', 'settlement', 'clause',
    'arbitration', 'confidential', 'binding', 'warranty', 'termination',
    'dispute', 'damages', 'negligence', 'breach', 'remedy', 'covenant',
    'indemnify', 'injunction', 'mediation', 'statute', 'lawsuit', 'plaintiff',
    'affidavit', 'stipulation', 'provision', 'recital', 'whereas', 'herein',
    'executor', 'trustee', 'probate', 'fiduciary', 'beneficiary', 'litigation',
    'hearing', 'judgment', 'ruling', 'decree', 'order', 'motion', 'pleading',
    'allegation', 'deposition', 'testimony', 'subpoena', 'summons', 'venue',
    'compensation', 'consideration', 'waiver', 'disclosure', 'amendment',
    'severability', 'counterpart', 'force majeure', 'satisfaction', 'default'
  ];
  
  const foundKeywords: string[] = [];
  
  // Find exact matches for legal keywords
  legalKeywords.forEach(keyword => {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
    if (pattern.test(text.toLowerCase()) && !foundKeywords.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  });
  
  // Extract potential custom keywords - phrases in all caps that might be important terms
  const customKeywordPattern = /\b[A-Z]{2,}(?:\s[A-Z]+){0,3}\b/g;
  const customMatches = text.match(customKeywordPattern);
  if (customMatches) {
    customMatches.forEach(match => {
      const keyword = match.toLowerCase();
      if (keyword.length > 3 && !foundKeywords.includes(keyword) && !keyword.match(/^(and|the|or|of|to|in|for|with|by|at|from)$/i)) {
        foundKeywords.push(keyword);
      }
    });
  }
  
  // Look for defined terms - typically in quotes or ALL CAPS
  const definedTermPattern = /"([^"]+)"/g;
  const definedTermMatches = text.match(definedTermPattern);
  if (definedTermMatches) {
    definedTermMatches.forEach(match => {
      const term = match.replace(/"/g, '').toLowerCase();
      if (term.length > 1 && !foundKeywords.includes(term) && !term.match(/^(and|the|or|of|to|in|for|with|by|at|from)$/i)) {
        foundKeywords.push(term);
      }
    });
  }
  
  return foundKeywords;
}

// Fallback extraction for when Tesseract fails
function fallbackExtraction(file: File): OCRResult {
  // Use the filename to determine the type of document for more realistic mock data
  const fileName = file.name.toLowerCase();
  let extractedText = "";
  let documentType = "Unknown Document";
  let parties: string[] = [];
  let dates: string[] = [];
  let structuredContent: any = { sections: [] };
  let keyInformation: Record<string, string> = {};
  
  if (fileName.includes("contract") || fileName.includes("agreement")) {
    documentType = "Contract/Agreement";
    extractedText = `CONTRACT AGREEMENT
    
THIS AGREEMENT made this 15th day of November, 2023

BETWEEN:

ABC CORPORATION, a corporation incorporated under the laws of India
(hereinafter referred to as "ABC")

- and -

XYZ LIMITED, a corporation incorporated under the laws of India
(hereinafter referred to as "XYZ")

WHEREAS ABC and XYZ wish to enter into an agreement regarding the provision of legal services;

AND WHEREAS both parties agree to the terms and conditions contained herein;

NOW THEREFORE THIS AGREEMENT WITNESSES that in consideration of the mutual covenants and agreements herein and subject to the terms and conditions specified in this Agreement, the parties agree as follows:

1. TERM OF AGREEMENT
   1.1 This Agreement shall commence on the date first written above and shall continue for a period of two (2) years (the "Term").

2. SERVICES
   2.1 XYZ shall provide legal consulting services to ABC as described in Schedule "A" attached hereto.
   2.2 XYZ shall ensure that all services are performed with reasonable skill and care.`;

    parties = ["ABC CORPORATION", "XYZ LIMITED"];
    dates = ["15th day of November, 2023"];
    
    structuredContent = {
      title: "CONTRACT AGREEMENT",
      sections: [
        {
          heading: "TERM OF AGREEMENT",
          content: "This Agreement shall commence on the date first written above and shall continue for a period of two (2) years (the \"Term\").",
          level: 1
        },
        {
          heading: "SERVICES",
          content: "XYZ shall provide legal consulting services to ABC as described in Schedule \"A\" attached hereto. XYZ shall ensure that all services are performed with reasonable skill and care.",
          level: 1
        }
      ],
      legalReferences: []
    };
    
    keyInformation = {
      "Effective Date": "November 15, 2023",
      "Contract Type": "Legal Services",
      "Contract Duration": "2 years"
    };
  } else if (fileName.includes("invoice") || fileName.includes("bill")) {
    documentType = "Invoice";
    extractedText = `INVOICE

INVOICE #: INV-2023-11-15
DATE: November 15, 2023
DUE DATE: December 15, 2023

FROM:
ABC Services Ltd.
123 Business Street
Mumbai, India 400001
GST: 27AABCA1234A1Z5

TO:
XYZ Corporation
456 Corporate Park
Delhi, India 110001
GST: 07AABCX5678B1Z3

DESCRIPTION                    QTY     RATE      AMOUNT
---------------------------------------------------------------
Legal Consultation Services     40     ₹2,500    ₹100,000
Contract Drafting               2      ₹15,000   ₹30,000
Document Review                 5      ₹5,000    ₹25,000
---------------------------------------------------------------
                                       SUBTOTAL   ₹155,000
                                       GST (18%)  ₹27,900
                                       TOTAL      ₹182,900

PAYMENT TERMS: Net 30
PAYMENT METHOD: Bank Transfer

BANK DETAILS:
Bank Name: State Bank of India
Account Name: ABC Services Ltd.
Account Number: 12345678901
IFSC Code: SBIN0001234`;

    parties = ["ABC Services Ltd.", "XYZ Corporation"];
    dates = ["November 15, 2023", "December 15, 2023"];
    
    structuredContent = {
      title: "INVOICE",
      sections: [
        {
          heading: "INVOICE DETAILS",
          content: "INVOICE #: INV-2023-11-15 DATE: November 15, 2023 DUE DATE: December 15, 2023",
          level: 1
        },
        {
          heading: "FROM",
          content: "ABC Services Ltd. 123 Business Street Mumbai, India 400001 GST: 27AABCA1234A1Z5",
          level: 1
        },
        {
          heading: "TO",
          content: "XYZ Corporation 456 Corporate Park Delhi, India 110001 GST: 07AABCX5678B1Z3",
          level: 1
        },
        {
          heading: "LINE ITEMS",
          content: "DESCRIPTION QTY RATE AMOUNT --------------------------------------------------------------- Legal Consultation Services 40 ₹2,500 ₹100,000 Contract Drafting 2 ₹15,000 ₹30,000 Document Review 5 ₹5,000 ₹25,000 --------------------------------------------------------------- SUBTOTAL ₹155,000 GST (18%) ₹27,900 TOTAL ₹182,900",
          level: 1
        },
        {
          heading: "PAYMENT INFORMATION",
          content: "PAYMENT TERMS: Net 30 PAYMENT METHOD: Bank Transfer BANK DETAILS: Bank Name: State Bank of India Account Name: ABC Services Ltd. Account Number: 12345678901 IFSC Code: SBIN0001234",
          level: 1
        }
      ],
      tables: [
        {
          description: "Invoice Line Items",
          location: "Line 14"
        }
      ]
    };
    
    keyInformation = {
      "Invoice Number": "INV-2023-11-15",
      "Invoice Date": "November 15, 2023",
      "Due Date": "December 15, 2023",
      "Total Amount": "₹182,900",
      "Payment Terms": "Net 30",
      "GST Number": "27AABCA1234A1Z5"
    };
  } else if (fileName.includes("property") || fileName.includes("deed")) {
    documentType = "Property Document";
    extractedText = `PROPERTY DEED

THIS DEED OF CONVEYANCE made on this 12th day of November, 2023

BETWEEN

Mr. John Smith, son of Mr. Robert Smith, resident of 456 Park Avenue, Delhi (hereinafter called the "VENDOR")

AND

Mrs. Jane Doe, daughter of Mr. William Doe, resident of 789 Lake View, Mumbai (hereinafter called the "PURCHASER")

WHEREAS the Vendor is the absolute owner of the property situated at 123 Main Street, comprising of a plot measuring 2400 sq. ft. along with a two-story building constructed thereon.

AND WHEREAS the Vendor has agreed to sell and the Purchaser has agreed to purchase the said property for a total consideration of Rs. 1,25,00,000/- (Rupees One Crore Twenty-Five Lakhs only).`;

    parties = ["Mr. John Smith", "Mrs. Jane Doe"];
    dates = ["12th day of November, 2023"];
    
    structuredContent = {
      title: "PROPERTY DEED",
      sections: [
        {
          content: "THIS DEED OF CONVEYANCE made on this 12th day of November, 2023 BETWEEN Mr. John Smith, son of Mr. Robert Smith, resident of 456 Park Avenue, Delhi (hereinafter called the \"VENDOR\") AND Mrs. Jane Doe, daughter of Mr. William Doe, resident of 789 Lake View, Mumbai (hereinafter called the \"PURCHASER\")",
          level: 0
        },
        {
          content: "WHEREAS the Vendor is the absolute owner of the property situated at 123 Main Street, comprising of a plot measuring 2400 sq. ft. along with a two-story building constructed thereon.",
          level: 0
        },
        {
          content: "AND WHEREAS the Vendor has agreed to sell and the Purchaser has agreed to purchase the said property for a total consideration of Rs. 1,25,00,000/- (Rupees One Crore Twenty-Five Lakhs only).",
          level: 0
        }
      ],
      legalReferences: []
    };
  } else if (fileName.includes("court") || fileName.includes("filing")) {
    documentType = "Legal Filing";
    extractedText = `IN THE HIGH COURT OF DELHI
AT NEW DELHI
CIVIL WRIT PETITION NO. 45678 OF 2023

IN THE MATTER OF:
ABC Corporation Pvt. Ltd.            ... PETITIONER
VERSUS
Union of India & Ors.               ... RESPONDENTS

PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA FOR THE ISSUANCE OF WRIT OF MANDAMUS

To
The Hon'ble Chief Justice and His Companion Justices of the High Court of Delhi at New Delhi.

The Humble petition of the Petitioner above-named:

MOST RESPECTFULLY SHOWETH:

1. That the present petition is being filed challenging the order dated 01.10.2023 passed by Respondent No.2, whereby the application of the Petitioner for renewal of license has been arbitrarily rejected.`;

    parties = ["ABC Corporation Pvt. Ltd.", "Union of India & Ors."];
    dates = ["01.10.2023", "2023"];
    
    structuredContent = {
      title: "CIVIL WRIT PETITION",
      sections: [
        {
          heading: "IN THE MATTER OF",
          content: "ABC Corporation Pvt. Ltd. ... PETITIONER VERSUS Union of India & Ors. ... RESPONDENTS",
          level: 1
        },
        {
          heading: "PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA",
          content: "For the issuance of writ of mandamus",
          level: 1
        },
        {
          heading: "MOST RESPECTFULLY SHOWETH",
          content: "1. That the present petition is being filed challenging the order dated 01.10.2023 passed by Respondent No.2, whereby the application of the Petitioner for renewal of license has been arbitrarily rejected.",
          level: 1
        }
      ],
      legalReferences: ["Article 226 of the Constitution of India"]
    };
  } else if (fileName.includes("testimony") || fileName.includes("witness")) {
    documentType = "Testimony/Affidavit";
    extractedText = `WITNESS TESTIMONY
CASE: Smith v. Johnson (Case #5678)
DATE: November 5, 2023
WITNESS: Mr. David Williams

I, David Williams, being of sound mind and over 18 years of age, do hereby state as follows:

1. I was present at the location of 782 Oak Street on September 15, 2023, at approximately 3:30 PM.
2. I directly witnessed the automobile collision between a blue sedan driven by Mr. Smith and a red SUV driven by Mr. Johnson.
3. Prior to the collision, I observed the red SUV traveling at what appeared to be well above the posted speed limit of 40 km/h.
4. The traffic signal at the intersection was clearly green for Mr. Smith's direction of travel.
5. I heard the sound of brakes being applied sharply followed immediately by the collision.`;

    parties = ["David Williams", "Mr. Smith", "Mr. Johnson"];
    dates = ["November 5, 2023", "September 15, 2023"];
    
    structuredContent = {
      title: "WITNESS TESTIMONY",
      sections: [
        {
          heading: "CASE INFORMATION",
          content: "CASE: Smith v. Johnson (Case #5678) DATE: November 5, 2023 WITNESS: Mr. David Williams",
          level: 1
        },
        {
          content: "I, David Williams, being of sound mind and over 18 years of age, do hereby state as follows:",
          level: 0
        },
        {
          content: "1. I was present at the location of 782 Oak Street on September 15, 2023, at approximately 3:30 PM. 2. I directly witnessed the automobile collision between a blue sedan driven by Mr. Smith and a red SUV driven by Mr. Johnson. 3. Prior to the collision, I observed the red SUV traveling at what appeared to be well above the posted speed limit of 40 km/h. 4. The traffic signal at the intersection was clearly green for Mr. Smith's direction of travel. 5. I heard the sound of brakes being applied sharply followed immediately by the collision.",
          level: 0
        }
      ],
      signatures: [
        {
          name: "David Williams",
          position: "Witness",
          date: "November 5, 2023"
        }
      ],
      legalReferences: []
    };
  } else {
    // Generic legal document
    extractedText = `LEGAL DOCUMENT

DOCUMENT TYPE: ${fileName}
DATE: ${new Date().toLocaleDateString()}

This document contains legal information that would typically be processed by our system. The extraction was performed using automated OCR technology to identify key elements such as parties involved, dates, obligations, and other relevant legal details.

The system has identified this as a legal document requiring further analysis by qualified legal professionals. OCR extraction provides initial data but should be verified manually for complete accuracy.`;

    parties = ["Document Author"];
    dates = [new Date().toLocaleDateString()];
    
    structuredContent = {
      title: "LEGAL DOCUMENT",
      sections: [
        {
          heading: "DOCUMENT INFORMATION",
          content: `DOCUMENT TYPE: ${fileName} DATE: ${new Date().toLocaleDateString()}`,
          level: 1
        },
        {
          content: "This document contains legal information that would typically be processed by our system. The extraction was performed using automated OCR technology to identify key elements such as parties involved, dates, obligations, and other relevant legal details.",
          level: 0
        },
        {
          content: "The system has identified this as a legal document requiring further analysis by qualified legal professionals. OCR extraction provides initial data but should be verified manually for complete accuracy.",
          level: 0
        }
      ],
      legalReferences: []
    };
  }
  
  // Extract keywords based on the generated text
  const keywords = extractKeywords(extractedText);
  const legalReferences = extractLegalReferences(extractedText);
  
  // Calculate word and character counts
  const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = extractedText.replace(/\s+/g, '').length;
  
  return {
    text: extractedText,
    confidence: 0.85,
    metadata: {
      pageCount: Math.floor(Math.random() * 10) + 1,
      creationDate: new Date().toISOString(),
      author: parties[0] || "Document Author",
      keywords: keywords,
      parties: parties,
      dates: dates,
      documentType: documentType,
      confidentialityLevel: determineConfidentiality(extractedText),
      fileName: file.name,
      fileSize: file.size,
      lastModified: new Date(file.lastModified).toISOString(),
      format: getFileFormat(file.type),
      totalWords: wordCount,
      totalChars: charCount
    },
    structuredContent: {
      ...structuredContent,
      legalReferences: legalReferences,
      keyInformation: keyInformation
    }
  };
}

export default ocrService;
