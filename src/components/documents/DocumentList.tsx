
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileTextIcon,
  FileImageIcon,
  FilePdfIcon,
  SearchIcon,
  ChevronDownIcon,
  CheckSquareIcon,
  XSquareIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Mock document data
const MOCK_DOCUMENTS = [
  {
    id: "1",
    name: "Contract Agreement - ABC Corp.pdf",
    type: "pdf",
    size: "2.4 MB",
    date: "2023-11-15",
    verified: true,
  },
  {
    id: "2",
    name: "Property Deed - 123 Main St.jpg",
    type: "image",
    size: "1.8 MB",
    date: "2023-11-12",
    verified: true,
  },
  {
    id: "3",
    name: "Court Filing - Case #45678.pdf",
    type: "pdf",
    size: "3.1 MB",
    date: "2023-11-08",
    verified: false,
  },
  {
    id: "4",
    name: "Client Testimony - Smith v. Johnson.pdf",
    type: "pdf",
    size: "1.5 MB",
    date: "2023-11-05",
    verified: true,
  },
  {
    id: "5",
    name: "Evidence Photo #1 - Accident Scene.jpg",
    type: "image",
    size: "2.2 MB",
    date: "2023-11-01",
    verified: false,
  },
];

// Helper function to get the right icon
const getDocumentIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FilePdfIcon className="h-6 w-6 text-red-500" />;
    case "image":
      return <FileImageIcon className="h-6 w-6 text-blue-500" />;
    default:
      return <FileTextIcon className="h-6 w-6 text-gray-500" />;
  }
};

const DocumentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  
  const filteredDocuments = MOCK_DOCUMENTS.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterVerified === null || doc.verified === filterVerified;
    return matchesSearch && matchesFilter;
  });

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
        <div className="overflow-hidden rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Size</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center">
                        {getDocumentIcon(doc.type)}
                        <span className="ml-2 font-medium text-sm truncate max-w-[150px] sm:max-w-xs">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600 hidden sm:table-cell">
                      {new Date(doc.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm text-gray-600 hidden md:table-cell">{doc.size}</td>
                    <td className="p-3">
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
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" className="text-legal-primary hover:text-legal-dark hover:bg-legal-light">
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    No documents found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentList;
