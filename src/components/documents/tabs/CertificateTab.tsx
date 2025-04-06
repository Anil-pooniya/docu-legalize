
import React from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon, QrCodeIcon } from "lucide-react";
import Section65BCertificate from "../../certificates/Section65BCertificate";
import { CertificateData } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import QRCode from "react-qr-code";

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
