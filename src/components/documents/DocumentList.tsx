
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileIcon,
  FileImageIcon,
  FileText,
  SearchIcon,
  CheckSquareIcon,
  XSquareIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDocuments, useVerifyDocument } from "@/services/documentService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

// Helper function to get the right icon
const getDocumentIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-6 w-6 text-red-500" />;
    case "image":
      return <FileImageIcon className="h-6 w-6 text-blue-500" />;
    default:
      return <FileIcon className="h-6 w-6 text-gray-500" />;
  }
};

interface DocumentListProps {
  selectedDocumentId?: string | null;
  setSelectedDocumentId?: (id: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  selectedDocumentId,
  setSelectedDocumentId 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const { data: documents, isLoading, error } = useDocuments();
  const verifyMutation = useVerifyDocument();
  const { toast } = useToast();
  
  // Handle errors from the useDocuments hook
  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching documents",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterVerified === null || doc.verified === filterVerified;
    return matchesSearch && matchesFilter;
  }) || [];

  const handleVerify = (id: string) => {
    verifyMutation.mutate(id);
  };

  const handleDocumentSelect = (id: string) => {
    if (setSelectedDocumentId) {
      setSelectedDocumentId(id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl text-legal-primary">Document Library</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-auto pr-4"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={filterVerified === true ? "default" : "outline"}
                size="sm"
                className={filterVerified === true ? "bg-legal-primary" : ""}
                onClick={() => setFilterVerified(filterVerified === true ? null : true)}
              >
                <CheckSquareIcon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Verified</span>
              </Button>
              <Button
                variant={filterVerified === false ? "default" : "outline"}
                size="sm"
                className={filterVerified === false ? "bg-legal-primary" : ""}
                onClick={() => setFilterVerified(filterVerified === false ? null : false)}
              >
                <XSquareIcon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Unverified</span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center space-x-4 p-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            Error loading documents. Please try again later.
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <TableRow 
                      key={doc.id} 
                      className={selectedDocumentId === doc.id ? "bg-legal-light" : ""}
                      onClick={() => handleDocumentSelect(doc.id)}
                    >
                      <TableCell>
                        <div className="flex items-center">
                          {getDocumentIcon(doc.type)}
                          <span className="ml-2 font-medium text-sm truncate max-w-[150px] sm:max-w-xs">
                            {doc.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-gray-600">
                        {new Date(doc.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-600">
                        {doc.size}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            doc.verified
                              ? "border-green-500 text-green-700 bg-green-50"
                              : "border-amber-500 text-amber-700 bg-amber-50"
                          }`}
                        >
                          {doc.verified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-legal-primary hover:text-legal-dark hover:bg-legal-light"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDocumentSelect(doc.id);
                            }}
                          >
                            View
                          </Button>
                          {!doc.verified && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-legal-primary text-legal-primary hover:bg-legal-light"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerify(doc.id);
                              }}
                              disabled={verifyMutation.isPending}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="p-6 text-center text-muted-foreground">
                      No documents found matching your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentList;
