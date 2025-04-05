// This file serves as a client for our future backend API
// In a production environment, these would connect to actual server endpoints

/**
 * Base API configuration
 */
const API_URL = import.meta.env.VITE_API_URL || 'https://api.doculegalize.com';

/**
 * Helper function to make API requests
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // Add authorization headers when auth is implemented
    // 'Authorization': `Bearer ${getToken()}`
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Handle HTTP errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  // Return null for 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * Upload a file with enhanced metadata handling
 */
async function uploadFile(file: File, metadata?: Record<string, any>) {
  const formData = new FormData();
  formData.append('file', file);
  
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }
  
  // For now, we'll extract file metadata client-side
  // In a production environment, this would be sent to the server
  return extractLocalFileMetadata(file)
    .then(extractedMetadata => {
      return {
        id: generateUniqueId(),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        metadata: extractedMetadata
      };
    });
}

/**
 * Extract metadata from a document
 */
async function extractMetadata(file: File) {
  return extractLocalFileMetadata(file);
}

/**
 * Perform OCR on a document
 */
async function performOCR(file: File, options?: { enhanceImage?: boolean; language?: string }) {
  // In a real implementation, this would call a server endpoint
  // For now, we'll use Tesseract.js for client-side OCR if it's an image
  
  // Check if the file is an image
  if (file.type.startsWith('image/')) {
    try {
      const Tesseract = await import('tesseract.js');
      // Create a worker with the proper options format
      const worker = await Tesseract.createWorker({
        logger: m => console.log(m),
        langPath: 'https://tessdata.projectnaptha.com/4.0.0'
      });
      
      // Load the English language data
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      // Create a URL for the file
      const imageUrl = URL.createObjectURL(file);
      
      // Recognize text
      const result = await worker.recognize(imageUrl);
      
      // Clean up
      URL.revokeObjectURL(imageUrl);
      await worker.terminate();
      
      return {
        text: result.data.text,
        confidence: result.data.confidence / 100,
        words: result.data.words,
        metadata: await extractLocalFileMetadata(file)
      };
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error('OCR processing failed');
    }
  } else {
    // Mock OCR for non-image files (in a real app, we'd use appropriate libraries)
    const metadata = await extractLocalFileMetadata(file);
    return {
      text: `Content extracted from ${file.name}`,
      confidence: 0.85,
      metadata
    };
  }
}

/**
 * Helper function to extract basic metadata from local files
 */
async function extractLocalFileMetadata(file: File) {
  // Extract basic file metadata
  const metadata: Record<string, any> = {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    lastModified: new Date(file.lastModified).toISOString(),
    format: getFileFormat(file.type),
  };

  // For images, extract dimensions if possible
  if (file.type.startsWith('image/')) {
    try {
      const dimensions = await getImageDimensions(file);
      metadata.width = dimensions.width;
      metadata.height = dimensions.height;
      metadata.dimensions = `${dimensions.width}x${dimensions.height}`;
    } catch (error) {
      console.error('Error extracting image dimensions:', error);
    }
  }

  return metadata;
}

/**
 * Helper function to get image dimensions
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Helper function to get file format from MIME type
 */
function getFileFormat(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG';
  if (mimeType.includes('png')) return 'PNG';
  if (mimeType.includes('tiff')) return 'TIFF';
  if (mimeType.includes('docx')) return 'DOCX';
  if (mimeType.includes('doc')) return 'DOC';
  if (mimeType.includes('text/plain')) return 'TXT';
  return mimeType.split('/')[1]?.toUpperCase() || 'Unknown';
}

/**
 * Generate a unique ID
 */
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default {
  // Wrapper methods for HTTP verbs
  get: (endpoint: string) => fetchAPI(endpoint),
  post: (endpoint: string, data: any) => fetchAPI(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint: string, data: any) => fetchAPI(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint: string) => fetchAPI(endpoint, {
    method: 'DELETE',
  }),
  
  // File handling methods
  uploadFile,
  extractMetadata,
  performOCR
};
