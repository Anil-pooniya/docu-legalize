import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DownloadIcon, PrinterIcon, CheckCircleIcon } from "lucide-react";

interface DocumentPreviewProps {
  document?: {
    id: string;
    name: string;
    uploadDate: string;
    size: string;
    verified: boolean;
    content?: string;
  };
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document }) => {
  const mockDocument = document || {
    id: "1",
    name: "Contract Agreement - ABC Corp.pdf",
    uploadDate: "Nov 15, 2023",
    size: "2.4 MB",
    verified: true,
    content: `
      THIS AGREEMENT made this 15th day of November, 2023
      
      BETWEEN:
      
      ABC CORPORATION, a corporation incorporated under the laws of India
      (hereinafter referred to as "ABC")
      
      - and -
      
      XYZ LIMITED, a corporation incorporated under the laws of India
      (hereinafter referred to as "XYZ")
      
      WHEREAS ABC and XYZ wish to enter into an agreement regarding the provision of legal services;
      
      AND WHEREAS both parties agree to the terms and conditions contained herein;
      
      NOW THEREFORE THIS AGREEMENT WITNESSES that in consideration of the mutual covenants and agreements herein and subject to the terms and conditions specified in this Agreement, the parties agree as follows:
    `,
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-legal-primary mb-1">{mockDocument.name}</CardTitle>
            <CardDescription>
              Uploaded on {mockDocument.uploadDate} • {mockDocument.size}
              {mockDocument.verified && (
                <Badge className="ml-2 bg-green-100 text-green-800 border-green-300 font-medium">
                  <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                  Verified
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <PrinterIcon className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">Document Preview</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="textContent">Extracted Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-0">
            <div className="document-preview border rounded-md overflow-hidden flex items-center justify-center p-6 h-96">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto text-legal-primary opacity-50 mb-4" />
                <p className="text-gray-500 text-sm">Document preview would be displayed here.</p>
                <p className="text-gray-500 text-sm mt-1">PDF and image viewers would be implemented here.</p>
              </div>
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
                  <dd className="mt-1 text-sm text-gray-900">{mockDocument.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{mockDocument.uploadDate}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">{mockDocument.size}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Document Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">PDF Document</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-sm text-gray-900">Adobe Acrobat</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Modified Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">Nov 10, 2023</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pages</dt>
                  <dd className="mt-1 text-sm text-gray-900">4</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Legal Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {mockDocument.verified ? (
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
              <pre className="text-sm whitespace-pre-wrap font-sans">
                {mockDocument.content || "No text content extracted."}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentPreview;
