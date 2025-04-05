
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, FileSearch, Loader2 } from "lucide-react";
import { OCRMetadata } from "../types";

interface DocumentPreviewTabProps {
  documentType: string;
  onExtractText: () => void;
  isExtracting: boolean;
  ocrMetadata?: OCRMetadata | null;
}

const DocumentPreviewTab: React.FC<DocumentPreviewTabProps> = ({ 
  documentType, 
  onExtractText, 
  isExtracting,
  ocrMetadata
}) => {
  return (
    <>
      <div className="document-preview border rounded-md overflow-hidden flex items-center justify-center p-6 h-96">
        {documentType === "pdf" ? (
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto text-red-500 opacity-50 mb-4" />
            <p className="text-gray-500 text-sm">PDF document preview.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={onExtractText}
              disabled={isExtracting}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Extracting Text with OCR...
                </>
              ) : (
                <>
                  <FileSearch className="h-4 w-4 mr-1.5" />
                  Extract Text with OCR
                </>
              )}
            </Button>
          </div>
        ) : documentType === "image" ? (
          <div className="text-center">
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <FileText className="h-16 w-16 mx-auto text-blue-500 opacity-50 mb-4" />
              <p className="text-gray-500 text-sm">Image document preview.</p>
            </div>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={onExtractText}
              disabled={isExtracting}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Extracting Text with OCR...
                </>
              ) : (
                <>
                  <FileSearch className="h-4 w-4 mr-1.5" />
                  Extract Text with OCR
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto text-legal-primary opacity-50 mb-4" />
            <p className="text-gray-500 text-sm">Document preview would be displayed here.</p>
            <p className="text-gray-500 text-sm mt-1">PDF and image viewers would be implemented here.</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Page <strong>1</strong> of <strong>{ocrMetadata?.pageCount || 4}</strong>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default DocumentPreviewTab;
