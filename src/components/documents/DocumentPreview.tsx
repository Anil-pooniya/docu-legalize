
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DownloadIcon, PrinterIcon, CheckCircleIcon } from "lucide-react";
import { useDocument, useGenerateCertificate } from "@/services/documentService";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import ocrService from "@/services/ocrService";

interface DocumentPreviewProps {
  documentId?: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ documentId = "1" }) => {
  const { data: document, isLoading, error } = useDocument(documentId);
  const certificateMutation = useGenerateCertificate();
  const [activeTab, setActiveTab] = useState("preview");
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
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
    
    // If document has content already, use it
    if (document?.content) {
      setExtractedText(document.content);
    }
  }, [document]);

  const handleGenerateCertificate = () => {
    if (!document) return;
    
    certificateMutation.mutate(document.id);
  };

  const handleExtractText = async () => {
    if (!document) return;
    
    setIsExtracting(true);
    try {
      // In a real app, we would need to fetch the actual file
      // For now, we'll simulate with a mock file
      const mockFile = new File([""], document.name, { 
        type: document.type === "pdf" ? "application/pdf" : "image/jpeg" 
      });
      
      const result = await ocrService.extractText(mockFile);
      setExtractedText(result.text);
      
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

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print dialog opened",
      description: "Document sent to printer.",
    });
  };

  const handleDownload = () => {
    // In a real app, we would fetch the document file
    // For now, we'll create a mock text file for download
    const element = document.createElement("a");
    
    let fileContent = "";
    if (activeTab === "textContent" && extractedText) {
      fileContent = extractedText;
    } else {
      fileContent = document?.content || `Mock content for ${document?.name}`;
    }
    
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = document?.name || "document.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
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

  if (error || !document) {
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
            <CardTitle className="text-xl text-legal-primary mb-1">{document.name}</CardTitle>
            <CardDescription>
              Uploaded on {new Date(document.date).toLocaleDateString()} • {document.size}
              <span className="ml-2">
                {document.verified && (
                  <Badge className="bg-green-100 text-green-800 border-green-300 font-medium">
                    <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                    Verified
                  </Badge>
                )}
              </span>
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            {document.verified && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateCertificate}
                disabled={certificateMutation.isPending}
              >
                <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Generate Certificate</span>
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
          </TabsList>
          
          <TabsContent value="preview" className="mt-0">
            <div className="document-preview border rounded-md overflow-hidden flex items-center justify-center p-6 h-96">
              {document.type === "pdf" ? (
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto text-red-500 opacity-50 mb-4" />
                  <p className="text-gray-500 text-sm">PDF document preview.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleExtractText}
                    disabled={isExtracting}
                  >
                    {isExtracting ? "Extracting..." : "Extract Document Text"}
                  </Button>
                </div>
              ) : document.type === "image" ? (
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
                    {isExtracting ? "Extracting..." : "Extract Document Text"}
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
                  <dd className="mt-1 text-sm text-gray-900">{document.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(document.date).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">{document.size}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Document Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{document.type === 'pdf' ? 'PDF Document' : 'Image'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-sm text-gray-900">DocuLegalize System</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Modified Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(document.date).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pages</dt>
                  <dd className="mt-1 text-sm text-gray-900">4</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Legal Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {document.verified ? (
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
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {extractedText}
                </pre>
              ) : document.content ? (
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {document.content}
                </pre>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No text content extracted yet.</p>
                  <Button 
                    onClick={handleExtractText}
                    disabled={isExtracting}
                  >
                    {isExtracting ? "Extracting..." : "Extract Document Text"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentPreview;
