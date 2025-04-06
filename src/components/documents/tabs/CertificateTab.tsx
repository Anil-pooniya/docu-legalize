
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import Section65BCertificate from "../../certificates/Section65BCertificate";
import { CertificateData } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import QRCode from "react-qr-code";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface CertificateTabProps {
  certificateData: CertificateData;
  certificateRef: React.RefObject<HTMLDivElement>;
  onDownloadCertificateAsPDF: () => void;
}

const CertificateTab: React.FC<CertificateTabProps> = ({
  certificateData,
  certificateRef,
  onDownloadCertificateAsPDF
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    try {
      setIsGenerating(true);
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your certificate...",
      });

      // Create a clone of the certificate container to avoid modifying the visible one
      const certificateContainer = certificateRef.current.cloneNode(true) as HTMLElement;
      document.body.appendChild(certificateContainer);
      certificateContainer.style.position = 'absolute';
      certificateContainer.style.left = '-9999px';
      certificateContainer.style.transform = 'none'; // Remove any scaling

      // Generate the PDF
      const canvas = await html2canvas(certificateContainer, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      document.body.removeChild(certificateContainer);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Calculate dimensions to fit the image properly on the PDF page
      const imgWidth = 210; // A4 width in mm (210mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`Certificate_${certificateData.id}.pdf`);
      
      setIsGenerating(false);
      toast({
        title: "Certificate downloaded",
        description: "Your certificate has been successfully downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
      toast({
        title: "Download failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <div 
        ref={certificateRef} 
        className={`certificate-container ${isMobile ? 'scale-90 origin-top' : ''}`}
      >
        <Section65BCertificate
          documentName={certificateData.documentName}
          generatedDate={certificateData.date}
          verificationId={certificateData.id}
        />
        
        {/* Add QR code for verification */}
        <div className="mt-4 flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-2">Scan to verify certificate:</p>
          <div className="bg-white p-2 rounded-md">
            <QRCode 
              value={`https://doculegalize.com/verify/${certificateData.id}`} 
              size={100}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <Button 
          className="bg-legal-primary hover:bg-legal-dark"
          onClick={handleDownloadPDF}
          disabled={isGenerating}
        >
          <DownloadIcon className="h-4 w-4 mr-1.5" />
          {isGenerating ? "Generating PDF..." : "Download as PDF"}
        </Button>
      </div>
    </div>
  );
};

export default CertificateTab;
