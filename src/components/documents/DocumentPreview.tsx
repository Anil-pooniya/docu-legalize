
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DownloadIcon, PrinterIcon, CheckCircleIcon, Loader2, Save } from "lucide-react";
import { useDocument, useGenerateCertificate, useUpdateDocumentContent } from "@/services/documentService";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import ocrService from "@/services/ocrService";
import Section65BCertificate from "../certificates/Section65BCertificate";

interface DocumentPreviewProps {
  documentId?: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ documentId = "1" }) => {
  const { data: documentData, isLoading, error } = useDocument(documentId);
  const certificateMutation = useGenerateCertificate();
  const updateContentMutation = useUpdateDocumentContent();
  const [activeTab, setActiveTab] = useState("preview");
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [certificateData, setCertificateData] = useState<{
    id: string;
    documentName: string;
    date: string;
  } | null>(null);
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
    // Clear extracted text when document changes
    setExtractedText(null);
    setCertificateData(null);
    
    // If document has content already, use it
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
      // In a real app, we would need to fetch the actual file
      // For now, we'll simulate with a mock file
      const mockFile = new File([""], documentData.name, { 
        type: documentData.type === "pdf" ? "application/pdf" : "image/jpeg" 
      });
      
      const result = await ocrService.extractText(mockFile);
      setExtractedText(result.text);
      
      // Save the extracted text to the document
      if (documentData.id && result.text) {
        await ocrService.saveExtractedText(documentData.id, result.text);
      }
      
      toast({
        title: "Text extracted",
        description: "Document text has been successfully extracted.",
      });
      
      // Switch to the text content tab
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
    
    // In a real app, we would fetch the document file
    // For now, we'll create a mock text file for download
    const element = window.document.createElement("a");
    
    let fileContent = "";
    if (activeTab === "textContent" && extractedText) {
      fileContent = extractedText;
    } else {
      fileContent = documentData?.content || `Mock content for ${documentData?.name}`;
    }
    
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = documentData?.name || "document.txt";
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
    
    toast({
      title: "Download started",
      description: "Your document is being downloaded.",
    });
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
                        Extracting...
                      </>
                    ) : (
                      "Extract Document Text"
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
                        Extracting...
                      </>
                    ) : (
                      "Extract Document Text"
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
                Page <strong>1</strong> of <strong>4</strong>
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
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{documentData.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(documentData.date).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">{documentData.size}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Document Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{documentData.type === 'pdf' ? 'PDF Document' : 'Image'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-sm text-gray-900">DocuLegalize System</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Modified Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(documentData.date).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pages</dt>
                  <dd className="mt-1 text-sm text-gray-900">4</dd>
                </div>
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
              </dl>
            </div>
          </TabsContent>
          
          <TabsContent value="textContent" className="mt-0">
            <div className="border rounded-md p-4 h-80 overflow-auto">
              {extractedText ? (
                <div className="flex flex-col h-full">
                  <pre className="text-sm whitespace-pre-wrap font-sans flex-grow">
                    {extractedText}
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
                      "Extract Document Text"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="certificate" className="mt-0">
            {certificateData && (
              <Section65BCertificate
                documentName={certificateData.documentName}
                generatedDate={certificateData.date}
                verificationId={certificateData.id}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentPreview;
