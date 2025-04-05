
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
              legalTerms: ocrMetadata.legalTerms,
              keyInformation: structuredContent.keyInformation,
              content: structuredContent.sections.map(s => ({
                heading: s.heading,
                content: s.content,
                level: s.level
              })),
              clauses: structuredContent.clauses,
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
                  <strong>PARTIES:</strong>
                  <ol className="list-decimal ml-5 mt-1">
                    {ocrMetadata.parties.map((party, idx) => (
                      <li key={idx} className="mb-1">{party}</li>
                    ))}
                  </ol>
                </div>
              )}
              
              {/* Display legal terms if available */}
              {ocrMetadata.legalTerms && ocrMetadata.legalTerms.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded border-l-4 border-legal-primary">
                  <h3 className="font-bold text-sm mb-2">LEGAL TERMS:</h3>
                  <div className="flex flex-wrap gap-2">
                    {ocrMetadata.legalTerms.map((term, idx) => (
                      <span key={idx} className="italic text-gray-600">"{term}"</span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Key Information display */}
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
              
              {/* Display clauses if available */}
              {structuredContent.clauses && structuredContent.clauses.length > 0 && (
                <div className="my-4">
                  <h3 className="font-bold text-md mb-3">CLAUSES:</h3>
                  {structuredContent.clauses.map((clause, idx) => (
                    <div key={idx} className="mb-4 border-l-2 border-legal-light pl-3">
                      <h4 className="font-bold mb-1">CLAUSE {clause.number}: {clause.title}</h4>
                      <p className="mb-2">{clause.content}</p>
                      
                      {clause.subclauses && clause.subclauses.length > 0 && (
                        <div className="ml-4 mt-2">
                          {clause.subclauses.map((subclause, subIdx) => (
                            <div key={subIdx} className="mb-2">
                              <strong>{clause.number}.{subclause.number}</strong> {subclause.content}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Display regular sections if no clauses structure */}
              {(!structuredContent.clauses || structuredContent.clauses.length === 0) && structuredContent.sections.map((section, idx) => (
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
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <h4 className="font-bold mb-2">SIGNATURES:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {structuredContent.signatures.map((sig, idx) => (
                      <div key={idx} className="border p-3 rounded">
                        {sig.name && <div className="font-semibold">{sig.name}</div>}
                        {sig.position && <div className="text-sm text-gray-600">{sig.position}</div>}
                        {sig.date && <div className="text-sm mt-2">Date: {sig.date}</div>}
                        <div className="mt-2 text-center text-gray-400">[Signature]</div>
                      </div>
                    ))}
                  </div>
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
