
import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import DocumentList from "@/components/documents/DocumentList";
import DocumentPreview from "@/components/documents/DocumentPreview";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Documents = () => {
  // In a real app, we'd fetch the document list and handle document selection
  const [selectedDocument, setSelectedDocument] = useState(null);

  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-legal-primary">Document Library</h1>
          <Link to="/">
            <Button className="bg-legal-primary hover:bg-legal-dark">
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload New Document
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <DocumentList />
          </div>
          <div className="lg:col-span-3">
            <DocumentPreview />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Documents;
