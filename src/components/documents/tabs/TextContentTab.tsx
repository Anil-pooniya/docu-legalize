
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, AlignLeft, ScrollText, Code, DownloadIcon, Save, Loader2, FileSearch } from "lucide-react";
import { OCRMetadata, StructuredContent } from "../types";

interface TextContentTabProps {
  extractedText: string | null;
  documentContent?: string;
  formatType: 'plain' | 'structured' | 'json';
  onSetFormatType: (type: 'plain' | 'structured' | 'json') => void;
  ocrMetadata: OCRMetadata | null;
  structuredContent: StructuredContent | null;
  onDownload: () => void;
  onSaveContent: () => void;
  onExtractText: () => void;
  isSaving: boolean;
  isExtracting: boolean;
}

const TextContentTab: React.FC<TextContentTabProps> = ({
  extractedText,
  documentContent,
  formatType,
  onSetFormatType,
  ocrMetadata,
  structuredContent,
  onDownload,
  onSaveContent,
  onExtractText,
  isSaving,
  isExtracting
}) => {
  if (extractedText) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-4 flex justify-between items-center border-b pb-3">
          <div className="text-sm font-semibold text-gray-700 flex items-center">
            <FileText className="h-4 w-4 mr-2" /> 
            Extracted Text Format:
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={formatType === 'plain' ? "default" : "outline"}
              size="sm"
              onClick={() => onSetFormatType('plain')}
            >
              <AlignLeft className="h-4 w-4 mr-1.5" />
              Plain Text
            </Button>
            <Button 
              variant={formatType === 'structured' ? "default" : "outline"}
              size="sm"
              onClick={() => onSetFormatType('structured')}
            >
              <ScrollText className="h-4 w-4 mr-1.5" />
              Structured
            </Button>
            <Button 
              variant={formatType === 'json' ? "default" : "outline"}
              size="sm"
              onClick={() => onSetFormatType('json')}
            >
              <Code className="h-4 w-4 mr-1.5" />
              JSON
            </Button>
          </div>
        </div>

        <pre className="text-sm whitespace-pre-wrap font-sans flex-grow overflow-auto">
          {formatType === 'plain' && extractedText}
          
          {formatType === 'json' && ocrMetadata && structuredContent && (
            JSON.stringify({
              document: {
                name: ocrMetadata.fileName,
                type: ocrMetadata.documentType,
                format: ocrMetadata.format,
                author: ocrMetadata.author,
                created: ocrMetadata.creationDate,
                modified: ocrMetadata.lastModified,
                pages: ocrMetadata.pageCount,
                wordCount: ocrMetadata.totalWords,
                characterCount: ocrMetadata.totalChars
              },
              parties: ocrMetadata.parties,
              dates: ocrMetadata.dates,
              keyInformation: structuredContent.keyInformation,
              content: structuredContent.sections.map(s => ({
                heading: s.heading,
                content: s.content,
                level: s.level
              })),
              references: structuredContent.legalReferences,
              ocrConfidence: Math.round(ocrMetadata.confidence * 100)
            }, null, 2)
          )}
          
          {formatType === 'structured' && structuredContent && ocrMetadata && (
            <div className="structured-text">
              {structuredContent.title && (
                <h2 className="text-lg font-bold mb-4">{structuredContent.title}</h2>
              )}
              
              {ocrMetadata.documentType && (
                <div className="mb-4">
                  <strong>DOCUMENT TYPE:</strong> {ocrMetadata.documentType}
                </div>
              )}
              
              {ocrMetadata.dates && ocrMetadata.dates.length > 0 && (
                <div className="mb-4">
                  <strong>DATE:</strong> {ocrMetadata.dates[0]}
                </div>
              )}
              
              {ocrMetadata.parties && ocrMetadata.parties.length > 0 && (
                <div className="mb-4">
                  <strong>PARTIES:</strong> {ocrMetadata.parties.join(", ")}
                </div>
              )}
              
              {/* Add Key Information display */}
              {structuredContent.keyInformation && Object.keys(structuredContent.keyInformation).length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <h3 className="font-bold text-sm mb-2 text-blue-700">KEY INFORMATION:</h3>
                  <ul className="list-disc pl-5">
                    {Object.entries(structuredContent.keyInformation).map(([key, value], idx) => (
                      <li key={idx} className="text-sm">
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {structuredContent.sections.map((section, idx) => (
                <div key={idx} className="mb-4">
                  {section.heading && (
                    <h3 className={`font-bold ${section.level === 1 ? 'text-md' : 'text-sm'} mb-2`}>
                      {section.heading}
                    </h3>
                  )}
                  <p>{section.content}</p>
                </div>
              ))}
              
              {structuredContent.tables && structuredContent.tables.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold">Tables Detected:</h4>
                  <ul>
                    {structuredContent.tables.map((table, idx) => (
                      <li key={idx}>{table.description} at {table.location}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {structuredContent.signatures && structuredContent.signatures.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold">Signatures:</h4>
                  <ul>
                    {structuredContent.signatures.map((sig, idx) => (
                      <li key={idx}>
                        {sig.name && <span>{sig.name}</span>}
                        {sig.position && <span> ({sig.position})</span>}
                        {sig.date && <span> - Date: {sig.date}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t">
                <strong>OCR CONFIDENCE:</strong> {Math.round(ocrMetadata.confidence * 100)}%
              </div>
            </div>
          )}
        </pre>
        <div className="flex justify-end pt-4 border-t mt-4">
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={onDownload}
          >
            <DownloadIcon className="h-4 w-4 mr-1.5" />
            Download {formatType === 'structured' ? 'Structured Text' : formatType === 'json' ? 'JSON Data' : 'Plain Text'}
          </Button>
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={onSaveContent}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                Save Content
              </>
            )}
          </Button>
        </div>
      </div>
    );
  } else if (documentContent) {
    return (
      <div className="flex flex-col h-full">
        <pre className="text-sm whitespace-pre-wrap font-sans flex-grow">
          {documentContent}
        </pre>
        <div className="flex justify-end pt-4 border-t mt-4">
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={onSaveContent}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                Save Content
              </>
            )}
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No text content extracted yet.</p>
        <Button 
          onClick={onExtractText}
          disabled={isExtracting}
        >
          {isExtracting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <FileSearch className="h-4 w-4 mr-1.5" />
              Extract Document Text
            </>
          )}
        </Button>
      </div>
    );
  }
};

export default TextContentTab;
