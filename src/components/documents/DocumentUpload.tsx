
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadIcon, FileIcon, XIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUploadDocument } from "@/services/documentService";
import { useNavigate } from "react-router-dom";

const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const { toast } = useToast();
  const uploadMutation = useUploadDocument();
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const uploadedFile = e.dataTransfer.files[0];
      if (validateFile(uploadedFile)) {
        setFile(uploadedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];
      if (validateFile(uploadedFile)) {
        setFile(uploadedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPEG, PNG, or TIFF file",
        variant: "destructive",
      });
      return false;
    }
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      await uploadMutation.mutateAsync(file);
      toast({
        title: "Upload successful",
        description: "Your document has been uploaded and is being processed.",
      });
      setFile(null);
      // Navigate to the documents page after successful upload
      navigate("/documents");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-legal-primary">Upload Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragging ? "border-legal-primary bg-legal-light" : "border-gray-300 hover:border-legal-primary"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          {!file ? (
            <>
              <UploadIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">Drag and drop your document</h3>
              <p className="text-sm text-gray-500 mb-4">or click to browse (PDF, JPG, PNG, TIFF)</p>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.tiff"
              />
              <Button variant="outline" className="border-legal-primary text-legal-primary hover:bg-legal-light">
                Select File
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between p-3 bg-legal-light rounded-md">
              <div className="flex items-center">
                <FileIcon className="h-8 w-8 text-legal-primary mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-800 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <XIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            className="bg-legal-primary hover:bg-legal-dark"
            disabled={!file || uploadMutation.isPending}
            onClick={handleUpload}
          >
            {uploadMutation.isPending ? "Processing..." : "Upload Document"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
