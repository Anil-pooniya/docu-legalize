import api from './api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export interface Certificate {
  id: string;
  documentId: string;
  issuedAt: string;
  expiresAt: string;
  issuerName: string;
  documentHash: string;
  status: 'valid' | 'expired' | 'revoked';
}

// Legal service functions
const legalService = {
  // Generate a Section 65B certificate
  generateCertificate: async (documentId: string, issuerDetails: { 
    name: string;
    designation: string;
    organization: string;
  }): Promise<Certificate> => {
    // In a real app: return api.post('/certificates', { documentId, issuerDetails });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(now.getFullYear() + 5); // 5 years validity
        
        resolve({
          id: `CERT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          documentId,
          issuedAt: now.toISOString(),
          expiresAt: expiryDate.toISOString(),
          issuerName: issuerDetails.name,
          documentHash: `sha256-${Math.random().toString(36).substr(2, 36)}`,
          status: 'valid',
        });
      }, 800);
    });
  },
  
  // Verify a certificate
  verifyCertificate: async (certificateId: string): Promise<{ 
    isValid: boolean; 
    message: string;
  }> => {
    // In a real app: return api.get(`/certificates/${certificateId}/verify`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% valid certificates
        const isValid = Math.random() > 0.05;
        
        resolve({
          isValid,
          message: isValid 
            ? "Certificate is valid and conforms to Section 65B requirements" 
            : "Certificate validation failed. Please regenerate the certificate."
        });
      }, 600);
    });
  },
  
  // Get all certificates
  getAllCertificates: async (): Promise<Certificate[]> => {
    // In a real app: return api.get('/certificates');
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const certificates: Certificate[] = [
          {
            id: "CERT-AB1234",
            documentId: "1",
            issuedAt: "2023-11-15T10:30:00Z",
            expiresAt: "2028-11-15T10:30:00Z",
            issuerName: "John Doe",
            documentHash: "sha256-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
            status: 'valid'
          },
          {
            id: "CERT-CD5678",
            documentId: "2",
            issuedAt: "2023-11-12T14:15:00Z",
            expiresAt: "2028-11-12T14:15:00Z", 
            issuerName: "Jane Smith",
            documentHash: "sha256-z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3h2g1f0",
            status: 'valid'
          }
        ];
        resolve(certificates);
      }, 500);
    });
  }
};

// React Query hooks for certificates
export const useCertificates = () => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['certificates'],
    queryFn: legalService.getAllCertificates,
  });
};

export const useGenerateCertificate = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ documentId, issuerDetails }: { 
      documentId: string; 
      issuerDetails: { name: string; designation: string; organization: string; } 
    }) => legalService.generateCertificate(documentId, issuerDetails),
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

export const useVerifyCertificate = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: legalService.verifyCertificate,
    onSuccess: (data) => {
      toast({
        title: data.isValid ? "Certificate valid" : "Certificate invalid",
        description: data.message,
        variant: data.isValid ? "default" : "destructive",
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

export default legalService;
