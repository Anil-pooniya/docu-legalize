
import api from './api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  verified: boolean;
  content?: string;
  metadata?: Record<string, any>;
}

// In a real application, these would call actual API endpoints
// For now, we'll use mock data similar to what we have in DocumentList.tsx

const MOCK_DOCUMENTS = [
  {
    id: "1",
    name: "Contract Agreement - ABC Corp.pdf",
    type: "pdf",
    size: "2.4 MB",
    date: "2023-11-15",
    verified: true,
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
  },
  {
    id: "3",
    name: "Court Filing - Case #45678.pdf",
    type: "pdf",
    size: "3.1 MB",
    date: "2023-11-08",
    verified: false,
  },
  {
    id: "4",
    name: "Client Testimony - Smith v. Johnson.pdf",
    type: "pdf",
    size: "1.5 MB",
    date: "2023-11-05",
    verified: true,
  },
  {
    id: "5",
    name: "Evidence Photo #1 - Accident Scene.jpg",
    type: "image",
    size: "2.2 MB",
    date: "2023-11-01",
    verified: false,
  },
];

// Document service functions
const documentService = {
  // Get all documents
  getAllDocuments: async (): Promise<Document[]> => {
    // In a real app: return api.get('/documents');
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_DOCUMENTS), 500);
    });
  },
  
  // Get a document by ID
  getDocumentById: async (id: string): Promise<Document> => {
    // In a real app: return api.get(`/documents/${id}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const document = MOCK_DOCUMENTS.find(doc => doc.id === id);
        if (document) {
          resolve(document);
        } else {
          reject(new Error('Document not found'));
        }
      }, 500);
    });
  },
  
  // Upload a document
  uploadDocument: async (file: File): Promise<Document> => {
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
        };
        
        // In a real app, we would process the file for OCR here
        // and update the backend database
        
        resolve(newDoc);
      }, 1500);
    });
  },
  
  // Verify a document
  verifyDocument: async (id: string): Promise<Document> => {
    // In a real app: return api.put(`/documents/${id}/verify`, { verified: true });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const docIndex = MOCK_DOCUMENTS.findIndex(doc => doc.id === id);
        if (docIndex >= 0) {
          const updatedDoc = { ...MOCK_DOCUMENTS[docIndex], verified: true };
          resolve(updatedDoc);
        } else {
          reject(new Error('Document not found'));
        }
      }, 500);
    });
  },
  
  // Generate a Section 65B certificate
  generateCertificate: async (id: string): Promise<{ certificateId: string, documentId: string, issueDate: string }> => {
    // In a real app: return api.post(`/documents/${id}/certificate`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          certificateId: `CERT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          documentId: id,
          issueDate: new Date().toISOString(),
        });
      }, 800);
    });
  }
};

// React Query hooks for documents
export const useDocuments = () => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['documents'],
    queryFn: documentService.getAllDocuments,
    onError: (error) => {
      toast({
        title: "Error fetching documents",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });
};

export const useDocument = (id: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentService.getDocumentById(id),
    enabled: !!id,
    onError: (error) => {
      toast({
        title: "Error fetching document",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: documentService.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
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
  
  return useMutation({
    mutationFn: documentService.verifyDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
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
  
  return useMutation({
    mutationFn: documentService.generateCertificate,
    onSuccess: () => {
      toast({
        title: "Certificate generated",
        description: "Section 65B certificate has been generated successfully.",
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

export default documentService;
