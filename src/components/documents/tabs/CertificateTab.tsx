
import React from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import Section65BCertificate from "../../certificates/Section65BCertificate";
import { CertificateData } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

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
      </div>
      <div className="flex justify-end mt-4">
        <Button 
          className="bg-legal-primary hover:bg-legal-dark"
          onClick={onDownloadCertificateAsPDF}
        >
          <DownloadIcon className="h-4 w-4 mr-1.5" />
          Download as PDF
        </Button>
      </div>
    </div>
  );
};

export default CertificateTab;
