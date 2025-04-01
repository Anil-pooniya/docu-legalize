
import React, { useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentUpload from "@/components/documents/DocumentUpload";
import DocumentList from "@/components/documents/DocumentList";
import { FileTextIcon, CheckCircleIcon, SearchIcon, ArrowRightIcon, GavelIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  
  // Function to scroll to the upload section
  const scrollToUpload = () => {
    const uploadSection = document.getElementById("upload-section");
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  // Check if we should scroll to upload section (from URL parameter)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('upload') === 'true') {
      setTimeout(scrollToUpload, 300); // Small delay to ensure DOM is ready
    }
  }, [location]);

  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <section className="mb-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-legal-primary">
              DocuLegalize - Digital Document Conversion with Legal Compliance
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Convert printed or typed documents into searchable digital formats while ensuring compliance 
              with Section 65B of the Indian Evidence Act.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button className="bg-legal-primary hover:bg-legal-dark" onClick={scrollToUpload}>
                <FileTextIcon className="mr-2 h-4 w-4" /> Upload Document
              </Button>
              <Link to="/documents">
                <Button variant="outline" className="border-legal-primary text-legal-primary hover:bg-legal-light">
                  <SearchIcon className="mr-2 h-4 w-4" /> Explore Documents
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-legal-primary flex items-center">
                  <div className="bg-legal-light p-1.5 rounded-full mr-2">
                    <FileTextIcon className="h-5 w-5 text-legal-primary" />
                  </div>
                  Document Conversion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Upload printed or scanned documents and convert them into searchable digital formats using OCR technology.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-legal-primary flex items-center">
                  <div className="bg-legal-light p-1.5 rounded-full mr-2">
                    <CheckCircleIcon className="h-5 w-5 text-legal-primary" />
                  </div>
                  Legal Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Generate Section 65B certificates to ensure legal admissibility of electronic documents in courts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-legal-primary flex items-center">
                  <div className="bg-legal-light p-1.5 rounded-full mr-2">
                    <SearchIcon className="h-5 w-5 text-legal-primary" />
                  </div>
                  Searchable Archive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Store and retrieve documents easily with our powerful search capabilities and metadata extraction.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="upload-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <DocumentUpload />
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-legal-primary">Legal Admissibility</CardTitle>
              <CardDescription>
                Section 65B compliance for electronic evidence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-legal-light p-2 rounded-md mr-3">
                    <GavelIcon className="h-5 w-5 text-legal-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Legal Framework</h3>
                    <p className="text-sm text-gray-600">
                      Section 65B of the Indian Evidence Act, 1872 provides for the admissibility of electronic records as evidence in court proceedings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-legal-light p-2 rounded-md mr-3">
                    <CheckCircleIcon className="h-5 w-5 text-legal-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Automatic Certification</h3>
                    <p className="text-sm text-gray-600">
                      Our system automatically generates the required certificates for electronic documents, ensuring their admissibility in court.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to="/certificates">
                    <Button variant="outline" className="w-full border-legal-primary text-legal-primary hover:bg-legal-light">
                      View Certificate Templates 
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <DocumentList />
        </section>
      </div>
    </PageLayout>
  );
};

export default Index;
