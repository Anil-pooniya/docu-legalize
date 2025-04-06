
import api from './api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  verified: boolean;
  content?: string;
  metadata?: Record<string, any>;
  userId?: string; // Add userId to associate documents with users
}

// Get documents from localStorage or initialize with mock data if not found
const getInitialDocuments = (): Document[] => {
  const storedDocs = localStorage.getItem('documents');
  if (storedDocs) {
    return JSON.parse(storedDocs);
  }

  // Default mock documents
  const defaultDocs = [
    {
      id: "1",
      name: "Contract Agreement - ABC Corp.pdf",
      type: "pdf",
      size: "2.4 MB",
      date: "2023-11-15",
      verified: true,
      userId: "demo-user", // Add a default userId for mock data
      content: `
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
      `,
    },
    {
      id: "2",
      name: "Property Deed - 123 Main St.jpg",
      type: "image",
      size: "1.8 MB",
      date: "2023-11-12",
      verified: true,
      userId: "demo-user", // Add a default userId for mock data
    },
    {
      id: "3",
      name: "Court Filing - Case #45678.pdf",
      type: "pdf",
      size: "3.1 MB",
      date: "2023-11-08",
      verified: false,
      userId: "demo-user", // Add a default userId for mock data
    },
    {
      id: "4",
      name: "Client Testimony - Smith v. Johnson.pdf",
      type: "pdf",
      size: "1.5 MB",
      date: "2023-11-05",
      verified: true,
      userId: "demo-user", // Add a default userId for mock data
    },
    {
      id: "5",
      name: "Evidence Photo #1 - Accident Scene.jpg",
      type: "image",
      size: "2.2 MB",
      date: "2023-11-01",
      verified: false,
      userId: "demo-user", // Add a default userId for mock data
    },
  ];
  
  // Store the default documents
  localStorage.setItem('documents', JSON.stringify(defaultDocs));
  return defaultDocs;
};

// Modified to let the array be updated
let MOCK_DOCUMENTS: Document[] = getInitialDocuments();

// Helper function to persist documents to localStorage
const persistDocuments = () => {
  localStorage.setItem('documents', JSON.stringify(MOCK_DOCUMENTS));
};

// Document service functions
const documentService = {
  // Get all documents for the current user
  getAllDocuments: async (userId: string): Promise<Document[]> => {
    // In a real app: return api.get('/documents');
    return new Promise((resolve) => {
      setTimeout(() => {
        // Filter documents by userId
        const userDocuments = MOCK_DOCUMENTS.filter(doc => doc.userId === userId);
        resolve(userDocuments);
      }, 500);
    });
  },
  
  // Get a document by ID (check if it belongs to the user)
  getDocumentById: async (id: string, userId: string): Promise<Document> => {
    // In a real app: return api.get(`/documents/${id}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const document = MOCK_DOCUMENTS.find(doc => doc.id === id && doc.userId === userId);
        if (document) {
          resolve(document);
        } else {
          reject(new Error('Document not found or access denied'));
        }
      }, 500);
    });
  },
  
  // Delete a document by ID (only if it belongs to the user)
  deleteDocument: async (id: string, userId: string): Promise<void> => {
    // In a real app: return api.delete(`/documents/${id}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const docIndex = MOCK_DOCUMENTS.findIndex(doc => doc.id === id && doc.userId === userId);
        if (docIndex >= 0) {
          // Remove the document from the array
          MOCK_DOCUMENTS.splice(docIndex, 1);
          // Persist changes to localStorage
          persistDocuments();
          resolve();
        } else {
          reject(new Error('Document not found or access denied'));
        }
      }, 500);
    });
  },
  
  // Upload a document
  uploadDocument: async (file: File, userId: string): Promise<Document> => {
    // In a real app, we would use FormData to upload the file
    // const formData = new FormData();
    // formData.append('file', file);
    // return api.post('/documents/upload', formData);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDoc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          date: new Date().toISOString().split('T')[0],
          verified: false,
          userId: userId, // Associate with the current user
          // We're making content optional in the Document interface,
          // so it's okay not to provide it here
        };
        
        // Add the new document to the MOCK_DOCUMENTS array so it shows up in the UI
        MOCK_DOCUMENTS = [newDoc, ...MOCK_DOCUMENTS];
        
        // Persist changes to localStorage
        persistDocuments();
        
        resolve(newDoc);
      }, 1500);
    });
  },
  
  // Verify a document
  verifyDocument: async (id: string, userId: string): Promise<Document> => {
    // In a real app: return api.put(`/documents/${id}/verify`, { verified: true });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const docIndex = MOCK_DOCUMENTS.findIndex(doc => doc.id === id && doc.userId === userId);
        if (docIndex >= 0) {
          const updatedDoc = { ...MOCK_DOCUMENTS[docIndex], verified: true };
          // Update the document in the array
          MOCK_DOCUMENTS[docIndex] = updatedDoc;
          // Persist changes to localStorage
          persistDocuments();
          resolve(updatedDoc);
        } else {
          reject(new Error('Document not found or access denied'));
        }
      }, 500);
    });
  },
  
  // Update document content
  updateDocumentContent: async (id: string, content: string, userId: string): Promise<Document> => {
    // In a real app: return api.put(`/documents/${id}/content`, { content });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const docIndex = MOCK_DOCUMENTS.findIndex(doc => doc.id === id && doc.userId === userId);
        if (docIndex >= 0) {
          const updatedDoc = { ...MOCK_DOCUMENTS[docIndex], content };
          // Update the document in the array
          MOCK_DOCUMENTS[docIndex] = updatedDoc;
          // Persist changes to localStorage
          persistDocuments();
          resolve(updatedDoc);
        } else {
          reject(new Error('Document not found or access denied'));
        }
      }, 500);
    });
  },
  
  // Generate a Section 65B certificate
  generateCertificate: async (id: string, userId: string): Promise<{ 
    certificateId: string;
    documentId: string;
    issueDate: string;
  }> => {
    // In a real app: return api.post(`/documents/${id}/certificate`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if the document belongs to the user first
        const document = MOCK_DOCUMENTS.find(doc => doc.id === id && doc.userId === userId);
        if (!document) {
          reject(new Error('Document not found or access denied'));
          return;
        }

        resolve({
          certificateId: `CERT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          documentId: id,
          issueDate: new Date().toISOString(),
        });
      }, 800);
    });
  },
  
  // Extract text from document
  extractText: async (id: string, userId: string): Promise<{ text: string, documentId: string }> => {
    // In a real app: return api.get(`/documents/${id}/extract`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const document = MOCK_DOCUMENTS.find(doc => doc.id === id && doc.userId === userId);
        if (document) {
          // If document has content, return it, otherwise generate generic text
          const text = document.content || `Extracted text from ${document.name}. This would normally be the result of OCR processing.`;
          resolve({
            text,
            documentId: id
          });
        } else {
          reject(new Error('Document not found or access denied'));
        }
      }, 1500);
    });
  },
  
  // Download document
  downloadDocument: async (id: string, userId: string): Promise<Blob> => {
    // In a real app: return api.get(`/documents/${id}/download`, { responseType: 'blob' });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const document = MOCK_DOCUMENTS.find(doc => doc.id === id && doc.userId === userId);
        if (document) {
          // Create a sample text blob for download
          const content = document.content || `Sample content for ${document.name}`;
          const blob = new Blob([content], { type: 'text/plain' });
          resolve(blob);
        } else {
          reject(new Error('Document not found or access denied'));
        }
      }, 800);
    });
  }
};

// React Query hooks for documents
export const useDocuments = () => {
  const { toast } = useToast();
  const { user } = useAuth(); // Get the current user from AuthContext
  
  return useQuery({
    queryKey: ['documents', user?.id],
    queryFn: () => documentService.getAllDocuments(user?.id || ''),
    staleTime: 60000,
    gcTime: 300000,
    retry: 1,
    enabled: !!user?.id, // Only run the query if user is authenticated
  });
};

export const useDocument = (id: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['document', id, user?.id],
    queryFn: () => documentService.getDocumentById(id, user?.id || ''),
    enabled: !!id && !!user?.id,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (file: File) => documentService.uploadDocument(file, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', user?.id] });
      toast({
        title: "Document uploaded",
        description: "Your document has been successfully uploaded and is being processed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });
};

export const useVerifyDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (id: string) => documentService.verifyDocument(id, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', user?.id] });
      toast({
        title: "Document verified",
        description: "The document has been verified and marked as compliant.",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });
};

export const useGenerateCertificate = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (id: string) => documentService.generateCertificate(id, user?.id || ''),
    onSuccess: (data) => {
      toast({
        title: "Certificate generated",
        description: `Section 65B certificate has been generated successfully. ID: ${data.certificateId}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Certificate generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });
};

export const useExtractText = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (id: string) => documentService.extractText(id, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', user?.id] });
      toast({
        title: "Text extracted",
        description: "Document text has been successfully extracted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Text extraction failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });
};

export const useDownloadDocument = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (id: string) => documentService.downloadDocument(id, user?.id || ''),
    onSuccess: () => {
      toast({
        title: "Download started",
        description: "Your document is being downloaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', user?.id] });
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateDocumentContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => 
      documentService.updateDocumentContent(id, content, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', user?.id] });
      toast({
        title: "Document updated",
        description: "Document content has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });
};

export default documentService;
