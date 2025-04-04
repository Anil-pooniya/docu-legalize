
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DownloadIcon, PrinterIcon, CheckCircleIcon, Loader2, Save, ScrollText, FileSearch, Tag, Users, Calendar, BookOpen, Database, AlignLeft, Code, Info } from "lucide-react";
import { useDocument, useGenerateCertificate, useUpdateDocumentContent } from "@/services/documentService";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import ocrService from "@/services/ocrService";
import Section65BCertificate from "../certificates/Section65BCertificate";
import jsPDF from "@/lib/jspdfMock";

interface DocumentPreviewProps {
  documentId?: string;
}

interface OCRMetadata {
  confidence: number;
  pageCount?: number;
  parties?: string[];
  dates?: string[];
  keywords?: string[];
  documentType?: string;
  confidentialityLevel?: string;
  author?: string;
  creationDate?: string;
  fileName?: string;
  fileSize?: number;
  format?: string;
  lastModified?: string;
  totalWords?: number;
  totalChars?: number;
}

interface StructuredContent {
  title?: string;
  sections: { heading?: string; content: string; level: number }[];
  tables?: { description: string; location: string }[];
  signatures?: { name?: string; position?: string; date?: string }[];
  legalReferences?: string[];
  definitions?: Record<string, string>;
  keyInformation?: Record<string, string>;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ documentId = "1" }) => {
  const { data: documentData, isLoading, error } = useDocument(documentId);
  const certificateMutation = useGenerateCertificate();
  const updateContentMutation = useUpdateDocumentContent();
  const [activeTab, setActiveTab] = useState("preview");
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formatType, setFormatType] = useState<'plain' | 'structured' | 'json'>('plain');
  const [ocrMetadata, setOcrMetadata] = useState<OCRMetadata | null>(null);
  const [structuredContent, setStructuredContent] = useState<StructuredContent | null>(null);
  const [certificateData, setCertificateData] = useState<{
    id: string;
    documentName: string;
    date: string;
  } | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching document",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  useEffect(() => {
    setExtractedText(null);
    setCertificateData(null);
    setOcrMetadata(null);
    setStructuredContent(null);
    
    if (documentData?.content) {
      setExtractedText(documentData.content);
    }
  }, [documentData]);

  const handleGenerateCertificate = () => {
    if (!documentData) return;
    
    certificateMutation.mutate(documentData.id, {
      onSuccess: (data) => {
        setCertificateData({
          id: data.certificateId,
          documentName: documentData.name,
          date: new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        });
        setActiveTab("certificate");
      }
    });
  };

  const handleExtractText = async () => {
    if (!documentData) return;
    
    setIsExtracting(true);
    try {
      const mockFile = new File([""], documentData.name, { 
        type: documentData.type === "pdf" ? "application/pdf" : "image/jpeg" 
      });
      
      const result = await ocrService.extractText(mockFile);
      setExtractedText(result.text);
      
      setOcrMetadata({
        confidence: result.confidence,
        pageCount: result.metadata.pageCount,
        parties: result.metadata.parties,
        dates: result.metadata.dates,
        keywords: result.metadata.keywords,
        documentType: result.metadata.documentType,
        confidentialityLevel: result.metadata.confidentialityLevel,
        author: result.metadata.author,
        creationDate: result.metadata.creationDate,
        fileName: result.metadata.fileName,
        fileSize: result.metadata.fileSize,
        format: result.metadata.format,
        lastModified: result.metadata.lastModified,
        totalWords: result.metadata.totalWords,
        totalChars: result.metadata.totalChars
      });
      
      if (result.structuredContent) {
        setStructuredContent(result.structuredContent);
      }
      
      if (documentData.id && result.text) {
        await ocrService.saveExtractedText(documentData.id, result.text, result.structuredContent);
      }
      
      toast({
        title: "Text extracted",
        description: `Document text extracted with ${Math.round(result.confidence * 100)}% confidence.`,
      });
      
      setActiveTab("textContent");
    } catch (err) {
      toast({
        title: "Extraction failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveContent = async () => {
    if (!documentData || !extractedText) return;
    
    setIsSaving(true);
    try {
      await updateContentMutation.mutateAsync({
        id: documentData.id,
        content: extractedText
      });
      
      toast({
        title: "Content saved",
        description: "Document content has been saved successfully.",
      });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print dialog opened",
      description: "Document sent to printer.",
    });
  };

  const handleDownload = () => {
    if (!documentData) return;
    
    let filename = "";
    let content: Blob | string = "";
    
    if (activeTab === "textContent" && extractedText) {
      if (formatType === 'structured' && ocrMetadata && structuredContent) {
        content = ocrService.exportAsText({
          text: extractedText,
          confidence: ocrMetadata.confidence,
          metadata: ocrMetadata as any,
          structuredContent: structuredContent
        });
        filename = `${documentData.name.replace(/\.[^/.]+$/, '')}_structured.txt`;
      } else if (formatType === 'json' && ocrMetadata && structuredContent) {
        // Create JSON representation
        content = ocrService.convertToJSON({
          text: extractedText,
          confidence: ocrMetadata.confidence,
          metadata: ocrMetadata as any,
          structuredContent: structuredContent
        });
        filename = `${documentData.name.replace(/\.[^/.]+$/, '')}_data.json`;
      } else {
        content = extractedText;
        filename = `${documentData.name.replace(/\.[^/.]+$/, '')}_plain.txt`;
      }
    } else if (activeTab === "metadata" && ocrMetadata) {
      content = ocrService.getMetadataAsJSON({
        text: extractedText || '',
        confidence: ocrMetadata.confidence,
        metadata: ocrMetadata as any,
        structuredContent: structuredContent || { sections: [] }
      });
      filename = `${documentData.name.replace(/\.[^/.]+$/, '')}_metadata.json`;
    } else if (activeTab === "certificate" && certificateData) {
      content = `SECTION 65B CERTIFICATE
      
Document: ${certificateData.documentName}
Certificate ID: ${certificateData.id}
Issued Date: ${certificateData.date}

This is to certify that this electronic record is generated by a computer system in the ordinary course of activities of DocuLegalize.

The computer output containing this information is produced by the computer in the ordinary course of the activities of the owner.

The information contained in this electronic record is derived from the computer system during the period over which the computer was used regularly to store or process information for the purpose of any activities regularly carried on over that period by the person having lawful control over the use of the computer.

During said period of time, information of the kind contained in the electronic record was regularly fed into the computer in the ordinary course of the said activities.

The computer was operating properly and the accuracy of the information is not disputed.
      `;
      
      filename = `certificate-${certificateData.id}.txt`;
    } else {
      content = documentData?.content || `Mock content for ${documentData?.name}`;
      filename = documentData?.name || "document.txt";
    }
    
    const element = window.document.createElement("a");
    
    if (typeof content === 'string') {
      const file = new Blob([content], { type: formatType === 'json' ? 'application/json' : 'text/plain' });
      element.href = URL.createObjectURL(file);
    } else {
      element.href = URL.createObjectURL(content);
    }
    
    element.download = filename;
    element.click();
    
    toast({
      title: "Download started",
      description: "Your document is being downloaded.",
    });
  };

  const handleDownloadCertificateAsPDF = () => {
    if (!certificateRef.current || !certificateData) return;
    
    try {
      toast({
        title: "PDF generation started",
        description: "Your certificate PDF is being generated and will download shortly.",
      });
      
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      doc.html(certificateRef.current, {
        callback: function(pdf) {
          pdf.save(`Section65B_Certificate_${certificateData.id}.pdf`);
          
          if (documentData) {
            const newCertificateData = {
              id: certificateData.id,
              documentId: documentData.id,
              name: `Section65B_Certificate_${certificateData.id}.pdf`,
              date: new Date().toISOString()
            };
            
            const savedCertificates = JSON.parse(localStorage.getItem('certificates') || '[]');
            savedCertificates.push(newCertificateData);
            localStorage.setItem('certificates', JSON.stringify(savedCertificates));
            
            toast({
              title: "Certificate saved",
              description: "Your certificate has been saved and will be available for future sessions.",
            });
          }
        },
        x: 10,
        y: 10,
        width: 180,
        windowWidth: 650
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error generating PDF",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-6 w-[300px] mb-2" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !documentData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl text-legal-primary">Document Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error loading document.</p>
            <p className="text-gray-500 text-sm">Please select a valid document or try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-legal-primary mb-1">{documentData.name}</CardTitle>
            <CardDescription>
              Uploaded on {new Date(documentData.date).toLocaleDateString()} • {documentData.size}
              <span className="ml-2">
                {documentData.verified && (
                  <Badge className="bg-green-100 text-green-800 border-green-300 font-medium">
                    <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                    Verified
                  </Badge>
                )}
              </span>
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            {documentData.verified && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateCertificate}
                disabled={certificateMutation.isPending}
              >
                {certificateMutation.isPending ? (
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
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <PrinterIcon className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <DownloadIcon className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">Document Preview</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="textContent">Extracted Text</TabsTrigger>
            {certificateData && (
              <TabsTrigger value="certificate">Certificate</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="preview" className="mt-0">
            <div className="document-preview border rounded-md overflow-hidden flex items-center justify-center p-6 h-96">
              {documentData.type === "pdf" ? (
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto text-red-500 opacity-50 mb-4" />
                  <p className="text-gray-500 text-sm">PDF document preview.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleExtractText}
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
              ) : documentData.type === "image" ? (
                <div className="text-center">
                  <div className="bg-gray-100 p-4 rounded-md mb-4">
                    <FileText className="h-16 w-16 mx-auto text-blue-500 opacity-50 mb-4" />
                    <p className="text-gray-500 text-sm">Image document preview.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleExtractText}
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
          </TabsContent>
          
          <TabsContent value="metadata" className="mt-0">
            <div className="border rounded-md p-4">
              <div className="mb-4 flex justify-between items-center border-b pb-3">
                <div className="text-sm font-semibold text-gray-700 flex items-center">
                  <Info className="h-4 w-4 mr-2" /> 
                  Document Metadata
                </div>
                <Button variant="outline" size="sm" onClick={handleDownload}>
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
                  <dd className="mt-1 text-sm text-gray-900">{ocrMetadata?.format || (documentData.type === 'pdf' ? 'PDF' : documentData.type)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">{ocrMetadata?.fileSize ? formatFileSize(ocrMetadata.fileSize) : documentData.size}</dd>
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
                    {ocrMetadata?.creationDate ? new Date(ocrMetadata.creationDate).toLocaleDateString() : new Date(documentData.date).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Modified</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {ocrMetadata?.lastModified ? new Date(ocrMetadata.lastModified).toLocaleDateString() : new Date(documentData.date).toLocaleDateString()}
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
          </TabsContent>
          
          <TabsContent value="textContent" className="mt-0">
            <div className="border rounded-md p-4 h-80 overflow-auto">
              {extractedText ? (
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
                        onClick={() => setFormatType('plain')}
                      >
                        <AlignLeft className="h-4 w-4 mr-1.5" />
                        Plain Text
                      </Button>
                      <Button 
                        variant={formatType === 'structured' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormatType('structured')}
                      >
                        <ScrollText className="h-4 w-4 mr-1.5" />
                        Structured
                      </Button>
                      <Button 
                        variant={formatType === 'json' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormatType('json')}
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
                      onClick={handleDownload}
                    >
                      <DownloadIcon className="h-4 w-4 mr-1.5" />
                      Download {formatType === 'structured' ? 'Structured Text' : formatType === 'json' ? 'JSON Data' : 'Plain Text'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="ml-2"
                      onClick={handleSaveContent}
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
              ) : documentData.content ? (
                <div className="flex flex-col h-full">
                  <pre className="text-sm whitespace-pre-wrap font-sans flex-grow">
                    {documentData.content}
                  </pre>
                  <div className="flex justify-end pt-4 border-t mt-4">
                    <Button 
                      variant="outline" 
                      className="ml-2"
                      onClick={handleSaveContent}
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
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No text content extracted yet.</p>
                  <Button 
                    onClick={handleExtractText}
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
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="certificate" className="mt-0">
            {certificateData && (
              <div>
                <div ref={certificateRef}>
                  <Section65BCertificate
                    documentName={certificateData.documentName}
                    generatedDate={certificateData.date}
                    verificationId={certificateData.id}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    className="bg-legal-primary hover:bg-legal-dark"
                    onClick={handleDownloadCertificateAsPDF}
                  >
                    <DownloadIcon className="h-4 w-4 mr-1.5" />
                    Download as PDF
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentPreview;
