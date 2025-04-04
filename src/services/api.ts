
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
  
  return fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header as the browser will set it with boundary parameter
  }).then(response => {
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    return response.json();
  });
}

/**
 * Extract metadata from a document
 */
async function extractMetadata(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  return fetch(`${API_URL}/extract-metadata`, {
    method: 'POST',
    body: formData,
  }).then(response => {
    if (!response.ok) {
      throw new Error(`Metadata extraction failed: ${response.status}`);
    }
    return response.json();
  });
}

/**
 * Perform OCR on a document
 */
async function performOCR(file: File, options?: { enhanceImage?: boolean; language?: string }) {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options) {
    formData.append('options', JSON.stringify(options));
  }
  
  return fetch(`${API_URL}/ocr`, {
    method: 'POST',
    body: formData,
  }).then(response => {
    if (!response.ok) {
      throw new Error(`OCR processing failed: ${response.status}`);
    }
    return response.json();
  });
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
