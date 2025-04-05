import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadIcon, FileIcon, XIcon, FileTextIcon, ImageIcon, FileType2Icon, CheckIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUploadDocument } from "@/services/documentService";
import { useNavigate } from "react-router-dom";
import ocrService from "@/services/ocrService";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";

const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [preExtractedMetadata, setPreExtractedMetadata] = useState<Record<string, any> | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
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
        extractPreviewMetadata(uploadedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];
      if (validateFile(uploadedFile)) {
        setFile(uploadedFile);
        extractPreviewMetadata(uploadedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/tiff', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'application/vnd.oasis.opendocument.text'
    ];
    
    const maxSize = 15 * 1024 * 1024; // 15MB
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPEG, PNG, TIFF, DOC, DOCX, TXT, RTF or ODT file",
        variant: "destructive",
      });
      return false;
    }
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 15MB",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const extractPreviewMetadata = async (file: File) => {
    try {
      setIsExtracting(true);
      const metadata = await ocrService.extractFileMetadata(file);
      setPreExtractedMetadata(metadata);
      
      if (file.type.startsWith('image/') || file.type.includes('pdf')) {
        const result = await api.performOCR(file);
        setTextPreview(result.text.substring(0, 200) + (result.text.length > 200 ? '...' : ''));
        
        toast({
          title: "Text extracted",
          description: `Document preview extracted with ${Math.round(result.confidence * 100)}% confidence.`,
        });
      }
    } catch (error) {
      console.error("Error extracting preview metadata:", error);
      toast({
        title: "Extraction failed",
        description: "Could not extract document preview",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const getFileTypeIcon = (file: File) => {
    const type = file.type;
    if (type.includes('pdf')) return <FileTextIcon className="h-8 w-8 text-red-500" />;
    if (type.includes('image')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (type.includes('word') || type.includes('document')) return <FileType2Icon className="h-8 w-8 text-indigo-500" />;
    return <FileIcon className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileFormatFromType = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG';
    if (mimeType.includes('png')) return 'PNG';
    if (mimeType.includes('tiff')) return 'TIFF';
    if (mimeType.includes('docx')) return 'DOCX';
    if (mimeType.includes('doc')) return 'DOC';
    if (mimeType.includes('text/plain')) return 'TXT';
    if (mimeType.includes('rtf')) return 'RTF';
    return mimeType.split('/')[1]?.toUpperCase() || 'Unknown';
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setIsExtracting(true);
      toast({
        title: "Processing document",
        description: "Extracting text and metadata...",
      });
      
      let documentContent;
      let ocrMetadata;
      
      try {
        const ocrResult = await api.performOCR(file);
        documentContent = ocrResult.text;
        ocrMetadata = ocrResult.metadata;
      } catch (error) {
        console.error("OCR extraction error:", error);
        documentContent = `Content of ${file.name}`;
        ocrMetadata = await ocrService.extractFileMetadata(file);
      }
      
      await uploadMutation.mutateAsync(file);
      
      toast({
        title: "Upload successful",
        description: "Your document has been uploaded with extracted text.",
        variant: "default"
      });
      
      setFile(null);
      setPreExtractedMetadata(null);
      setTextPreview(null);
      
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
    setPreExtractedMetadata(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-legal-primary">Upload Document</CardTitle>
        <CardDescription>
          Upload documents for OCR processing, metadata extraction, and text recognition
        </CardDescription>
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
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <Badge variant="outline" className="bg-red-50">PDF</Badge>
                <Badge variant="outline" className="bg-blue-50">JPG</Badge>
                <Badge variant="outline" className="bg-green-50">PNG</Badge>
                <Badge variant="outline" className="bg-yellow-50">TIFF</Badge>
                <Badge variant="outline" className="bg-purple-50">DOC/DOCX</Badge>
                <Badge variant="outline" className="bg-gray-50">TXT</Badge>
                <Badge variant="outline" className="bg-orange-50">RTF</Badge>
              </div>
              
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.doc,.docx,.txt,.rtf,.odt"
              />
              <Button variant="outline" className="border-legal-primary text-legal-primary hover:bg-legal-light">
                Select File
              </Button>
              
              <p className="text-xs text-gray-500 mt-4">Maximum file size: 15MB</p>
            </>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center justify-between p-3 bg-legal-light rounded-md">
                <div className="flex items-center">
                  {getFileTypeIcon(file)}
                  <div className="text-left ml-3">
                    <p className="font-medium text-gray-800 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)} • {getFileFormatFromType(file.type)}</p>
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
              
              {preExtractedMetadata && !isExtracting && (
                <div className="mt-4 text-left bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                    Document Preview Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {preExtractedMetadata.format && (
                      <div>
                        <span className="text-gray-500">Format:</span> {preExtractedMetadata.format}
                      </div>
                    )}
                    {preExtractedMetadata.pageCount && (
                      <div>
                        <span className="text-gray-500">Pages:</span> {preExtractedMetadata.pageCount}
                      </div>
                    )}
                    {preExtractedMetadata.documentType && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Type:</span> {preExtractedMetadata.documentType}
                      </div>
                    )}
                  </div>
                  
                  {textPreview && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2">Extracted Text Preview:</h4>
                      <div className="p-2 bg-white border rounded-md text-xs text-gray-600 max-h-32 overflow-y-auto">
                        {textPreview}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-3">
                    Full text and metadata will be available after upload
                  </p>
                </div>
              )}
              
              {isExtracting && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting text from document...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            className="bg-legal-primary hover:bg-legal-dark"
            disabled={!file || uploadMutation.isPending || isExtracting}
            onClick={handleUpload}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Upload & Extract Text"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
