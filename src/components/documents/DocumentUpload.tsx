
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadIcon, FileIcon, XIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUploadDocument } from "@/services/documentService";
import { useNavigate } from "react-router-dom";
import ocrService from "@/services/ocrService";

const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
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
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPEG, PNG, TIFF, DOC or DOCX file",
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

  const extractMetadata = async (file: File): Promise<any> => {
    try {
      setIsExtracting(true);
      // Get basic file metadata
      const metadata = await ocrService.extractFileMetadata(file);
      
      // For PDFs and images, attempt to extract more detailed metadata
      if (file.type.includes('pdf') || file.type.includes('image')) {
        // Read the file to extract additional metadata
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              // If we have image or PDF data, we could extract more metadata
              // For now, return the basic metadata with file type specific info
              if (file.type.includes('pdf')) {
                metadata.format = 'PDF';
                metadata.pageCount = Math.max(1, Math.ceil(file.size / 100000)); // Estimate pages
              } else {
                metadata.format = file.type.split('/')[1].toUpperCase();
                metadata.pageCount = 1;
              }
              
              resolve(metadata);
            } catch (error) {
              console.error("Error extracting detailed metadata:", error);
              resolve(metadata); // Return basic metadata if detailed extraction fails
            }
          };
          
          reader.onerror = () => resolve(metadata);
          
          // Read as array buffer for binary files like PDF
          if (file.type.includes('pdf')) {
            reader.readAsArrayBuffer(file);
          } else {
            // Read as data URL for images
            reader.readAsDataURL(file);
          }
        });
      }
      
      return metadata;
    } catch (error) {
      console.error("Error in metadata extraction:", error);
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      };
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setIsExtracting(true);
      // Extract metadata before uploading
      const metadata = await extractMetadata(file);
      
      // Create a new file object with the extracted metadata
      const fileWithMetadata = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified
      });
      
      // Add the metadata to the upload
      await uploadMutation.mutateAsync(fileWithMetadata);
      
      toast({
        title: "Upload successful",
        description: "Your document has been uploaded and is being processed.",
      });
      setFile(null);
      // Navigate to the documents page after successful upload
      navigate("/documents");
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
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
              <p className="text-sm text-gray-500 mb-4">or click to browse (PDF, JPG, PNG, TIFF, DOC, DOCX)</p>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.doc,.docx"
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
            disabled={!file || uploadMutation.isPending || isExtracting}
            onClick={handleUpload}
          >
            {uploadMutation.isPending || isExtracting ? "Processing..." : "Upload Document"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
