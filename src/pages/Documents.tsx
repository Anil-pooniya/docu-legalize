
import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import DocumentList from "@/components/documents/DocumentList";
import DocumentPreview from "@/components/documents/DocumentPreview";
import { Button } from "@/components/ui/button";
import { PlusIcon, FileIcon, CheckCircleIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useDocuments } from "@/services/documentService";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { useCertificates } from "@/services/legalService";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const Documents = () => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const { data: documents, isLoading } = useDocuments();
  const { data: certificates, isLoading: isLoadingCertificates } = useCertificates();
  const [activeTab, setActiveTab] = useState<"documents" | "certificates">("documents");

  // Select the first document by default if none is selected and documents are loaded
  useEffect(() => {
    if (!selectedDocumentId && documents && documents.length > 0) {
      setSelectedDocumentId(documents[0].id);
    } else if (documents && documents.length === 0) {
      setSelectedDocumentId(null); // Clear selection if there are no documents
    }
  }, [documents, selectedDocumentId]);

  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-legal-primary">Document Library</h1>
          <Link to="/#upload-section">
            <Button className="bg-legal-primary hover:bg-legal-dark">
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload New Document
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "documents" | "certificates")} className="w-full mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2">
                <DocumentList 
                  selectedDocumentId={selectedDocumentId}
                  setSelectedDocumentId={setSelectedDocumentId}
                />
              </div>
              <div className="lg:col-span-3">
                {selectedDocumentId ? (
                  <DocumentPreview documentId={selectedDocumentId} />
                ) : (
                  <div className="bg-white border rounded-lg p-8 text-center h-full flex flex-col items-center justify-center">
                    <div className="text-legal-primary text-4xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold mb-2">No Documents</h3>
                    <p className="text-gray-500 mb-6">
                      Upload your first document to get started
                    </p>
                    <Link to="/#upload-section">
                      <Button className="bg-legal-primary hover:bg-legal-dark">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Upload New Document
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="certificates" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingCertificates ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardHeader className="bg-gray-50 animate-pulse h-24"></CardHeader>
                    <CardContent className="p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </CardContent>
                    <CardFooter className="border-t p-4 animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </CardFooter>
                  </Card>
                ))
              ) : certificates && certificates.length > 0 ? (
                certificates.map(certificate => (
                  <Card key={certificate.id} className="border border-gray-200">
                    <CardHeader className="bg-gray-50 pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-legal-primary">Certificate</CardTitle>
                        <Badge 
                          variant={certificate.status === 'valid' ? 'default' : certificate.status === 'expired' ? 'destructive' : 'outline'}
                          className={certificate.status === 'valid' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {certificate.status === 'valid' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                          {certificate.status === 'valid' ? 'Valid' : certificate.status === 'expired' ? 'Expired' : 'Revoked'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>ID:</strong> {certificate.id}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Issued:</strong> {format(new Date(certificate.issuedAt), 'PPP')}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Expires:</strong> {format(new Date(certificate.expiresAt), 'PPP')}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Issuer:</strong> {certificate.issuerName}
                      </p>
                    </CardContent>
                    <CardFooter className="border-t p-4">
                      <div className="w-full flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedDocumentId(certificate.documentId)}
                        >
                          <FileIcon className="h-4 w-4 mr-1.5" />
                          View Document
                        </Button>
                        <Link to={`/certificates?id=${certificate.id}`}>
                          <Button size="sm" className="bg-legal-primary hover:bg-legal-dark">
                            View Certificate
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white border rounded-lg p-8 text-center">
                  <div className="text-legal-primary text-4xl mb-4">🔒</div>
                  <h3 className="text-xl font-semibold mb-2">No Certificates Found</h3>
                  <p className="text-gray-500 mb-6">
                    Generate certificates for your verified documents to view them here
                  </p>
                  <Button 
                    className="bg-legal-primary hover:bg-legal-dark"
                    onClick={() => setActiveTab("documents")}
                  >
                    View Documents
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </PageLayout>
  );
};

export default Documents;
