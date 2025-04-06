
import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import Section65BCertificate from "@/components/certificates/Section65BCertificate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, FileTextIcon, ArrowRightIcon, FileIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon, EyeIcon, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useGenerateCertificate, useVerifyDocument } from "@/services/documentService";
import { format } from "date-fns";

const Certificates = () => {
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("history");
  const [viewCertificateDetails, setViewCertificateDetails] = useState<{
    id: string;
    document: string;
    date: string;
    verificationId: string;
    certifierName?: string;
    certifierDesignation?: string;
    certifierOrganization?: string;
    sha256Hash?: string;
    verificationLink?: string;
  } | null>(null);
  const [savedCertificates, setSavedCertificates] = useState<Array<any>>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load saved certificates from localStorage
    const loadSavedCertificates = () => {
      const savedCerts = localStorage.getItem('savedCertificates');
      if (savedCerts) {
        try {
          const certificates = JSON.parse(savedCerts);
          setSavedCertificates(certificates);
          if (certificates.length > 0 && !viewCertificateDetails) {
            setViewCertificateDetails(certificates[0]);
          }
        } catch (error) {
          console.error("Error parsing saved certificates:", error);
          localStorage.setItem('savedCertificates', JSON.stringify([]));
        }
      }
    };
    
    loadSavedCertificates();
  }, []);

  const handleGenerateNew = () => {
    setShowCertificateDialog(true);
  };

  const handleViewCertificate = (certificate: {
    id: number | string;
    document: string;
    date: string;
    verificationId: string;
    certifierName?: string;
    certifierDesignation?: string;
    certifierOrganization?: string;
    sha256Hash?: string;
    verificationLink?: string;
  }) => {
    setViewCertificateDetails({
      id: String(certificate.id),
      document: certificate.document,
      date: certificate.date,
      verificationId: certificate.verificationId,
      certifierName: certificate.certifierName || 'Legal Administrator',
      certifierDesignation: certificate.certifierDesignation || 'Legal Officer',
      certifierOrganization: certificate.certifierOrganization || 'DocuLegalize Platform',
      sha256Hash: certificate.sha256Hash || generateMockSHA256(),
      verificationLink: certificate.verificationLink || `https://doculegalize.com/verify/${certificate.verificationId}`
    });
    setActiveTab("preview");
  };

  const generateMockSHA256 = () => {
    const characters = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleCertificateDownload = () => {
    if (!viewCertificateDetails) return;
    
    try {
      const element = window.document.createElement("a");
      element.href = `data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAg`;
      element.download = `Certificate_${viewCertificateDetails.verificationId}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast({
        title: "Certificate downloaded",
        description: "Your certificate has been successfully downloaded.",
      });
      
      const downloads = JSON.parse(localStorage.getItem('certificateDownloads') || '[]');
      downloads.push({
        certificateId: viewCertificateDetails.id,
        downloadDate: new Date().toISOString()
      });
      localStorage.setItem('certificateDownloads', JSON.stringify(downloads));
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your certificate.",
        variant: "destructive"
      });
    }
  };

  const saveCertificateToLocalStorage = (certificate: any) => {
    try {
      const existingCerts = JSON.parse(localStorage.getItem('savedCertificates') || '[]');
      const updatedCerts = [certificate, ...existingCerts];
      localStorage.setItem('savedCertificates', JSON.stringify(updatedCerts));
      setSavedCertificates(updatedCerts);
      
      toast({
        title: "Certificate saved",
        description: "Certificate has been saved to your history."
      });
    } catch (error) {
      console.error("Error saving certificate:", error);
      toast({
        title: "Error saving certificate",
        description: "There was an error saving the certificate to history.",
        variant: "destructive"
      });
    }
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Certificate Preview</TabsTrigger>
                <TabsTrigger value="history">Certificate History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="mt-0">
                {viewCertificateDetails ? (
                  <Card className="p-4">
                    <Section65BCertificate 
                      documentName={viewCertificateDetails.document} 
                      generatedDate={new Date(viewCertificateDetails.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      verificationId={viewCertificateDetails.verificationId}
                      certifierName={viewCertificateDetails.certifierName}
                      certifierDesignation={viewCertificateDetails.certifierDesignation}
                      certifierOrganization={viewCertificateDetails.certifierOrganization}
                      sha256Hash={viewCertificateDetails.sha256Hash}
                      verificationLink={viewCertificateDetails.verificationLink}
                    />
                    <div className="flex justify-center mt-6">
                      <Button 
                        className="bg-legal-primary hover:bg-legal-dark" 
                        onClick={handleCertificateDownload}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6 text-center">
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="bg-legal-light p-4 rounded-full mb-4">
                        <FileIcon className="h-12 w-12 text-legal-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No Certificate Selected</h3>
                      <p className="text-gray-500 mb-4">
                        Select a certificate from the history to preview or generate a new one
                      </p>
                      <Button 
                        className="bg-legal-primary hover:bg-legal-dark" 
                        onClick={handleGenerateNew}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Generate New Certificate
                      </Button>
                    </div>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <div className="overflow-auto border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Document</th>
                            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Generated On</th>
                            <th className="p-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Verification ID</th>
                            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {[...savedCertificates, 
                            {
                              id: 1,
                              document: "Contract Agreement - ABC Corp.pdf",
                              date: "Nov 15, 2023",
                              verificationId: "DL-X7Y9Z2A1",
                              status: "valid",
                              certifierName: "John Smith",
                              certifierDesignation: "Legal Counsel",
                              certifierOrganization: "ABC Law Associates",
                              sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                              verificationLink: "https://doculegalize.com/verify/DL-X7Y9Z2A1"
                            },
                            {
                              id: 2,
                              document: "Property Deed - 123 Main St.jpg",
                              date: "Nov 12, 2023",
                              verificationId: "DL-B3C5D2E8",
                              status: "valid",
                              certifierName: "Sarah Johnson",
                              certifierDesignation: "Notary Public",
                              certifierOrganization: "Johnson Notary Services",
                              sha256Hash: "7d6fd7774f0d87624da6dcf16d0aae3985d7b58972833766a4eb6206ea20ab47",
                              verificationLink: "https://doculegalize.com/verify/DL-B3C5D2E8"
                            },
                            {
                              id: 3,
                              document: "Court Filing - Case #45678.pdf",
                              date: "Nov 8, 2023",
                              verificationId: "DL-F1G4H7J9",
                              status: "expired"
                            },
                            {
                              id: 4,
                              document: "Power of Attorney - Smith.pdf",
                              date: "Oct 25, 2023",
                              verificationId: "DL-K2L5M9N1",
                              status: "revoked"
                            }
                          ].map((cert, index) => (
                            <tr key={`${cert.id}-${index}`} className="hover:bg-muted/30">
                              <td className="p-3">
                                <div className="flex items-center">
                                  <FileTextIcon className="h-5 w-5 text-legal-primary mr-2" />
                                  <span className="text-sm font-medium">{cert.document}</span>
                                </div>
                              </td>
                              <td className="p-3 text-sm">{cert.date}</td>
                              <td className="p-3 text-sm font-mono text-gray-600 hidden md:table-cell">{cert.verificationId}</td>
                              <td className="p-3">
                                <Badge 
                                  variant={
                                    cert.status === "valid" ? "default" : 
                                    cert.status === "expired" ? "secondary" : "destructive"
                                  }
                                  className={
                                    cert.status === "valid" ? "bg-green-100 text-green-800" : 
                                    cert.status === "expired" ? "bg-amber-100 text-amber-800" : ""
                                  }
                                >
                                  <span className="flex items-center">
                                    {cert.status === "valid" && (
                                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                                    )}
                                    {cert.status === "expired" && (
                                      <ClockIcon className="h-3 w-3 mr-1" />
                                    )}
                                    {cert.status === "revoked" && (
                                      <AlertCircleIcon className="h-3 w-3 mr-1" />
                                    )}
                                    {cert.status === "valid" ? "Valid" : 
                                     cert.status === "expired" ? "Expired" : "Revoked"}
                                  </span>
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-legal-primary hover:text-legal-dark hover:bg-legal-light"
                                    onClick={() => handleViewCertificate(cert)}
                                  >
                                    <EyeIcon className="h-4 w-4 mr-1.5" />
                                    View
                                  </Button>
                                  {cert.status === "valid" && (
                                    <Button
                                      variant="ghost" 
                                      size="sm"
                                      className="text-legal-primary hover:text-legal-dark hover:bg-legal-light"
                                      onClick={() => {
                                        handleViewCertificate(cert);
                                        setActiveTab("preview");
                                      }}
                                    >
                                      <Download className="h-4 w-4 mr-1.5" />
                                      Download
                                    </Button>
                                  )}
                                </div>
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
                {["Contract Agreement - ABC Corp.pdf", "Property Deed - 123 Main St.jpg", "Court Filing - Case #45678.pdf", "Power of Attorney - Smith.pdf"].map((doc, i) => (
                  <div key={i} className="flex items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <FileTextIcon className="h-5 w-5 text-legal-primary mr-2" />
                    <span className="text-sm">{doc}</span>
                    <Button 
                      className="ml-auto" 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const now = new Date();
                        const verificationId = "DL-" + Math.random().toString(36).substring(2, 10).toUpperCase();
                        const newCert = {
                          id: Math.floor(Math.random() * 1000),
                          document: doc,
                          date: format(now, "MMM dd, yyyy"),
                          verificationId: verificationId,
                          certifierName: "Current User",
                          certifierDesignation: "Legal Administrator",
                          certifierOrganization: "DocuLegalize Platform",
                          sha256Hash: generateMockSHA256(),
                          verificationLink: `https://doculegalize.com/verify/${verificationId}`,
                          status: "valid"
                        };
                        
                        saveCertificateToLocalStorage(newCert);
                        handleViewCertificate(newCert);
                        
                        toast({
                          title: "Certificate generated",
                          description: `Certificate for ${doc} has been generated and saved to history.`,
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
