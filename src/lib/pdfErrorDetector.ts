
/**
 * PDF Error Detector
 * 
 * This module provides utilities for detecting common PDF issues that might prevent 
 * proper text extraction, such as:
 * 
 * 1. Password protection / encryption
 * 2. Scanned content without OCR
 * 3. Corrupted file structure
 * 4. Image-only PDFs
 */

export interface PDFErrorResult {
  isValid: boolean;
  errorCode?: string;
  errorMessage?: string;
  isEncrypted?: boolean;
  isScannedOnly?: boolean;
  isCorrupted?: boolean;
  needsOCR?: boolean;
}

/**
 * Check for common PDF issues
 * 
 * In a real implementation, this would use PDF.js or a similar library
 * to analyze the PDF structure and detect issues
 */
export async function detectPDFIssues(file: File): Promise<PDFErrorResult> {
  try {
    // Read the first few bytes of the file to check for PDF signature
    const fileHeader = await readFileHeader(file, 1024);
    
    // Check if it's a valid PDF at all (should start with %PDF-)
    if (!fileHeader.includes('%PDF-')) {
      return {
        isValid: false,
        errorCode: 'INVALID_FORMAT',
        errorMessage: 'The file does not appear to be a valid PDF document.',
        isCorrupted: true
      };
    }
    
    // Check for encryption
    if (fileHeader.includes('/Encrypt')) {
      return {
        isValid: false,
        errorCode: 'ENCRYPTED',
        errorMessage: 'The PDF is password-protected or encrypted.',
        isEncrypted: true
      };
    }
    
    // Check for evidence of scanned-only content
    if (fileHeader.includes('/XObject') && fileHeader.includes('/Image') && !fileHeader.includes('/Text')) {
      return {
        isValid: false,
        errorCode: 'SCANNED_ONLY',
        errorMessage: 'The PDF contains only scanned images without embedded text.',
        isScannedOnly: true,
        needsOCR: true
      };
    }
    
    // Further analysis would be performed in a real implementation
    
    return { isValid: true };
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    return {
      isValid: false,
      errorCode: 'ANALYSIS_ERROR',
      errorMessage: 'Failed to analyze the PDF structure.',
      isCorrupted: true
    };
  }
}

/**
 * Read the beginning of a file as text
 */
async function readFileHeader(file: File, bytesToRead: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (!e.target || !e.target.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        // Convert to string - this is simplistic and would be more robust in production
        let result: string;
        if (typeof e.target.result === 'string') {
          result = e.target.result;
        } else {
          // Convert ArrayBuffer to string
          const array = new Uint8Array(e.target.result);
          result = String.fromCharCode.apply(null, Array.from(array));
        }
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    // Read just the first part of the file
    const blob = file.slice(0, bytesToRead);
    reader.readAsText(blob);
  });
}

/**
 * Try to extract meaningful error message based on PDF issue
 */
export function getPDFErrorMessage(error: PDFErrorResult): string {
  if (error.isEncrypted) {
    return "Unable to extract text: The PDF is password-protected or encrypted. Please provide an unprotected version of the document.";
  }
  
  if (error.isScannedOnly) {
    return "Unable to extract text: The PDF contains only scanned images without embedded text. Advanced OCR processing will be attempted.";
  }
  
  if (error.isCorrupted) {
    return "Unable to extract text: The PDF file appears to be corrupted or invalid.";
  }
  
  return "Unable to extract text: Invalid PDF structure. This may be due to the PDF being password-protected, corrupted, or containing only scanned images without OCR.";
}

export default {
  detectPDFIssues,
  getPDFErrorMessage
};
