
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadIcon, Info, Database, Calendar, Users, Tag, BookOpen } from "lucide-react";
import { OCRMetadata, StructuredContent } from "../types";

interface MetadataTabProps {
  documentData: {
    name: string;
    date: string;
    type: string;
    size: string;
    verified: boolean;
  };
  ocrMetadata: OCRMetadata | null;
  structuredContent: StructuredContent | null;
  onDownload: () => void;
  formatFileSize: (bytes: number) => string;
}

const MetadataTab: React.FC<MetadataTabProps> = ({
  documentData,
  ocrMetadata,
  structuredContent,
  onDownload,
  formatFileSize
}) => {
  return (
    <div className="border rounded-md p-4">
      <div className="mb-4 flex justify-between items-center border-b pb-3">
        <div className="text-sm font-semibold text-gray-700 flex items-center">
          <Info className="h-4 w-4 mr-2" /> 
          Document Metadata
        </div>
        <Button variant="outline" size="sm" onClick={onDownload}>
          <DownloadIcon className="h-4 w-4 mr-1.5" />
          Export Metadata as JSON
        </Button>
      </div>
      
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <dt className="text-sm font-medium text-gray-500">File Name</dt>
          <dd className="mt-1 text-sm text-gray-900">{ocrMetadata?.fileName || documentData.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Format</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {ocrMetadata?.format || (documentData.type === 'pdf' ? 'PDF' : documentData.type)}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">File Size</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {ocrMetadata?.fileSize ? formatFileSize(ocrMetadata.fileSize) : documentData.size}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Document Type</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {ocrMetadata?.documentType || (documentData.type === 'pdf' ? 'PDF Document' : 'Image')}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Author</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {ocrMetadata?.author || "Unknown"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Creation Date</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {ocrMetadata?.creationDate 
              ? new Date(ocrMetadata.creationDate).toLocaleDateString() 
              : new Date(documentData.date).toLocaleDateString()}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Last Modified</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {ocrMetadata?.lastModified 
              ? new Date(ocrMetadata.lastModified).toLocaleDateString() 
              : new Date(documentData.date).toLocaleDateString()}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Pages</dt>
          <dd className="mt-1 text-sm text-gray-900">{ocrMetadata?.pageCount || 1}</dd>
        </div>
        
        {ocrMetadata?.totalWords && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Word Count</dt>
            <dd className="mt-1 text-sm text-gray-900">{ocrMetadata.totalWords.toLocaleString()}</dd>
          </div>
        )}
        
        {ocrMetadata?.totalChars && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Character Count</dt>
            <dd className="mt-1 text-sm text-gray-900">{ocrMetadata.totalChars.toLocaleString()}</dd>
          </div>
        )}
        
        <div>
          <dt className="text-sm font-medium text-gray-500">Legal Status</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {documentData.verified ? (
              <span className="text-green-600 font-medium">Section 65B Verified</span>
            ) : (
              <span className="text-amber-600 font-medium">Pending Verification</span>
            )}
          </dd>
        </div>
        
        {ocrMetadata && (
          <>
            <div>
              <dt className="text-sm font-medium text-gray-500">OCR Confidence</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {Math.round(ocrMetadata.confidence * 100)}%
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Confidentiality Level</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {ocrMetadata.confidentialityLevel || "Standard"}
              </dd>
            </div>
            
            {/* Key Information Section */}
            {structuredContent?.keyInformation && Object.keys(structuredContent.keyInformation).length > 0 && (
              <div className="col-span-2 mt-4">
                <dt className="text-sm font-medium text-gray-500 flex items-center border-b pb-2 mb-2">
                  <Database className="h-4 w-4 mr-1.5 text-gray-400" />
                  Key Information
                </dt>
                <dd className="mt-2">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {Object.entries(structuredContent.keyInformation).map(([key, value], idx) => (
                      <div key={idx} className="border-l-2 border-legal-light pl-3">
                        <dt className="text-xs font-medium text-gray-500">{key}</dt>
                        <dd className="text-sm text-gray-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </dd>
              </div>
            )}
            
            {ocrMetadata.dates && ocrMetadata.dates.length > 0 && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                  Key Dates
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {ocrMetadata.dates.map((date, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">
                        {date}
                      </Badge>
                    ))}
                  </div>
                </dd>
              </div>
            )}
            
            {ocrMetadata.parties && ocrMetadata.parties.length > 0 && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                  Parties Involved
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {ocrMetadata.parties.slice(0, 5).map((party, index) => (
                      <Badge key={index} variant="outline" className="bg-amber-50">
                        {party}
                      </Badge>
                    ))}
                    {(ocrMetadata.parties.length > 5) && (
                      <Badge variant="outline" className="bg-amber-50">
                        +{ocrMetadata.parties.length - 5} more
                      </Badge>
                    )}
                  </div>
                </dd>
              </div>
            )}
            
            {ocrMetadata.keywords && ocrMetadata.keywords.length > 0 && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Tag className="h-4 w-4 mr-1.5 text-gray-400" />
                  Keywords
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {ocrMetadata.keywords.slice(0, 8).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50">
                        {keyword}
                      </Badge>
                    ))}
                    {(ocrMetadata.keywords.length > 8) && (
                      <Badge variant="outline" className="bg-green-50">
                        +{ocrMetadata.keywords.length - 8} more
                      </Badge>
                    )}
                  </div>
                </dd>
              </div>
            )}
            
            {structuredContent?.legalReferences && structuredContent.legalReferences.length > 0 && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <BookOpen className="h-4 w-4 mr-1.5 text-gray-400" />
                  Legal References
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {structuredContent.legalReferences.map((reference, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-50">
                        {reference}
                      </Badge>
                    ))}
                  </div>
                </dd>
              </div>
            )}
          </>
        )}
      </dl>
    </div>
  );
};

export default MetadataTab;
