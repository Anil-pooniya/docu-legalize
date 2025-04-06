
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocument, useGenerateCertificate, useUpdateDocumentContent } from "@/services/documentService";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import ocrService from "@/services/ocrService";
import jsPDF from "@/lib/jspdfMock";

// Import types
import { DocumentPreviewProps, OCRMetadata, StructuredContent, CertificateData } from "./types";

// Import components
import DocumentPreviewHeader from "./DocumentPreviewHeader";
import DocumentPreviewTab from "./tabs/DocumentPreviewTab";
import MetadataTab from "./tabs/MetadataTab";
import TextContentTab from "./tabs/TextContentTab";
import CertificateTab from "./tabs/CertificateTab";

// Import utilities
import { formatFileSize, createMockFile, prepareDownload } from "./utils/documentUtils";

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
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
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
    setExtractionError(null);
    try {
      // Create mock file with appropriate content
      const mockFile = createMockFile(documentData.name, documentData.type);
      
      // Extract text
      const result = await ocrService.extractText(mockFile);
      
      // Check if we got meaningful text
      if (!result.text || result.text.trim().length === 0) {
        throw new Error("No text could be extracted from this document.");
      }
      
      setExtractedText(result.text);
      
      // Set metadata
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
        totalChars: result.metadata.totalChars,
        legalTerms: result.metadata.legalTerms
      });
      
      // Set structured content if available
      if (result.structuredContent) {
        setStructuredContent(result.structuredContent);
      }
      
      // Save extracted text
      if (documentData.id && result.text) {
        await ocrService.saveExtractedText(documentData.id, result.text, result.structuredContent);
      }
      
      toast({
        title: "Text extracted",
        description: `Document text extracted with ${Math.round(result.confidence * 100)}% confidence.`,
      });
      
      setActiveTab("textContent");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Text extraction error:", err);
      
      setExtractionError(errorMessage);
      
      toast({
        title: "Extraction failed",
        description: errorMessage,
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
    
    const { content, filename } = prepareDownload({
      activeTab,
      formatType,
      extractedText,
      ocrMetadata,
      structuredContent,
      documentName: documentData.name,
      documentContent: documentData.content,
      certificateData
    });
    
    const element = window.document.createElement("a");
    
    if (typeof content === 'string') {
      const file = new Blob([content], { 
        type: activeTab === "metadata" || formatType === 'json' ? 'application/json' : 'text/plain' 
      });
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

  if (isLoading) {
    return (
      <Card className="w-full">
        <DocumentPreviewHeader 
          name=""
          date=""
          size=""
          verified={false}
          onGenerateCertificate={() => {}}
          onPrint={() => {}}
          onDownload={() => {}}
          isCertificateGenerating={false}
        />
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !documentData) {
    return (
      <Card className="w-full">
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
      <DocumentPreviewHeader 
        name={documentData.name}
        date={documentData.date}
        size={documentData.size}
        verified={documentData.verified}
        onGenerateCertificate={handleGenerateCertificate}
        onPrint={handlePrint}
        onDownload={handleDownload}
        isCertificateGenerating={certificateMutation.isPending}
      />
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
            <DocumentPreviewTab 
              documentType={documentData.type}
              onExtractText={handleExtractText}
              isExtracting={isExtracting}
              ocrMetadata={ocrMetadata}
              extractionError={extractionError}
            />
          </TabsContent>
          
          <TabsContent value="metadata" className="mt-0">
            <MetadataTab 
              documentData={{
                name: documentData.name,
                date: documentData.date,
                type: documentData.type,
                size: documentData.size,
                verified: documentData.verified
              }}
              ocrMetadata={ocrMetadata}
              structuredContent={structuredContent}
              onDownload={handleDownload}
              formatFileSize={formatFileSize}
            />
          </TabsContent>
          
          <TabsContent value="textContent" className="mt-0">
            <div className="border rounded-md p-4 h-80 overflow-auto">
              <TextContentTab 
                extractedText={extractedText}
                documentContent={documentData.content}
                formatType={formatType}
                onSetFormatType={setFormatType}
                ocrMetadata={ocrMetadata}
                structuredContent={structuredContent}
                onDownload={handleDownload}
                onSaveContent={handleSaveContent}
                onExtractText={handleExtractText}
                isSaving={isSaving}
                isExtracting={isExtracting}
                extractionError={extractionError}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="certificate" className="mt-0">
            {certificateData && (
              <CertificateTab 
                certificateData={certificateData}
                certificateRef={certificateRef}
                onDownloadCertificateAsPDF={handleDownloadCertificateAsPDF}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentPreview;
