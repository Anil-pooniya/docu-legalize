
import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import Section65BCertificate from "@/components/certificates/Section65BCertificate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, FileTextIcon, ArrowRightIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useGenerateCertificate, useVerifyDocument } from "@/services/documentService";

const Certificates = () => {
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleGenerateNew = () => {
    setShowCertificateDialog(true);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-legal-primary">Legal Certificates</h1>
          <Button className="bg-legal-primary hover:bg-legal-dark" onClick={handleGenerateNew}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Generate New Certificate
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl text-legal-primary">Section 65B</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Section 65B of the Indian Evidence Act, 1872 provides for the admissibility of electronic records as evidence in court proceedings.
              </p>
              
              <div className="text-sm space-y-2">
                <h3 className="font-medium">Key Requirements:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The computer output must be produced by a computer used regularly.</li>
                  <li>The computer was operating properly during the relevant period.</li>
                  <li>The information was regularly fed into the computer.</li>
                  <li>The computer was operating properly when the document was produced.</li>
                </ul>
              </div>
              
              <Button variant="outline" className="w-full text-legal-primary border-legal-primary" asChild>
                <a href="https://indiankanoon.org/doc/13153/" target="_blank" rel="noopener noreferrer">
                  Read Legal Text <ArrowRightIcon className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <Tabs defaultValue="preview">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Certificate Preview</TabsTrigger>
                <TabsTrigger value="history">Certificate History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="mt-0">
                <Section65BCertificate />
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <div className="overflow-hidden border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Document</th>
                            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Generated On</th>
                            <th className="p-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Verification ID</th>
                            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {[
                            {
                              id: 1,
                              document: "Contract Agreement - ABC Corp.pdf",
                              date: "Nov 15, 2023",
                              verificationId: "DL-X7Y9Z2A1"
                            },
                            {
                              id: 2,
                              document: "Property Deed - 123 Main St.jpg",
                              date: "Nov 12, 2023",
                              verificationId: "DL-B3C5D2E8"
                            },
                            {
                              id: 3,
                              document: "Court Filing - Case #45678.pdf",
                              date: "Nov 8, 2023",
                              verificationId: "DL-F1G4H7J9"
                            }
                          ].map(cert => (
                            <tr key={cert.id} className="hover:bg-muted/30">
                              <td className="p-3">
                                <div className="flex items-center">
                                  <FileTextIcon className="h-5 w-5 text-legal-primary mr-2" />
                                  <span className="text-sm font-medium">{cert.document}</span>
                                </div>
                              </td>
                              <td className="p-3 text-sm">{cert.date}</td>
                              <td className="p-3 text-sm font-mono text-gray-600 hidden md:table-cell">{cert.verificationId}</td>
                              <td className="p-3">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-legal-primary hover:text-legal-dark hover:bg-legal-light"
                                  onClick={() => {
                                    setSelectedDocument(cert.document);
                                    toast({
                                      title: "Certificate loaded",
                                      description: "Certificate is ready to view or download.",
                                    });
                                  }}
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate New Certificate</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500 mb-4">
                Select a document to generate a new Section 65B certificate:
              </p>
              <div className="space-y-2">
                {["Contract Agreement - ABC Corp.pdf", "Property Deed - 123 Main St.jpg", "Court Filing - Case #45678.pdf"].map((doc, i) => (
                  <div key={i} className="flex items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <FileTextIcon className="h-5 w-5 text-legal-primary mr-2" />
                    <span className="text-sm">{doc}</span>
                    <Button 
                      className="ml-auto" 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Certificate generated",
                          description: `Certificate for ${doc} has been generated successfully.`,
                        });
                        setShowCertificateDialog(false);
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Certificates;
