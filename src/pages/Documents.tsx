
import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import DocumentList from "@/components/documents/DocumentList";
import DocumentPreview from "@/components/documents/DocumentPreview";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useDocuments } from "@/services/documentService";

const Documents = () => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const { data: documents } = useDocuments();

  // Select the first document by default if none is selected and documents are loaded
  useEffect(() => {
    if (!selectedDocumentId && documents && documents.length > 0) {
      setSelectedDocumentId(documents[0].id);
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <DocumentList 
              selectedDocumentId={selectedDocumentId}
              setSelectedDocumentId={setSelectedDocumentId}
            />
          </div>
          <div className="lg:col-span-3">
            <DocumentPreview documentId={selectedDocumentId || undefined} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Documents;
