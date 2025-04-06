
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon, Loader2, PrinterIcon, DownloadIcon } from "lucide-react";

interface DocumentPreviewHeaderProps {
  name: string;
  date: string;
  size: string;
  verified: boolean;
  onGenerateCertificate: () => void;
  onPrint: () => void;
  onDownload: () => void;
  isCertificateGenerating: boolean;
}

const DocumentPreviewHeader: React.FC<DocumentPreviewHeaderProps> = ({
  name,
  date,
  size,
  verified,
  onGenerateCertificate,
  onPrint,
  onDownload,
  isCertificateGenerating
}) => {
  return (
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-xl text-legal-primary mb-1">{name}</CardTitle>
          <CardDescription>
            Uploaded on {new Date(date).toLocaleDateString()} • {size}
            <span className="ml-2">
              {verified && (
                <Badge className="bg-green-100 text-green-800 border-green-300 font-medium">
                  <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                  Verified
                </Badge>
              )}
            </span>
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          {verified && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onGenerateCertificate}
              disabled={isCertificateGenerating}
            >
              {isCertificateGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Generate Certificate</span>
                </>
              )}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onPrint}>
            <PrinterIcon className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <DownloadIcon className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default DocumentPreviewHeader;
