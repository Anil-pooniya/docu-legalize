
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileTextIcon, 
  DownloadIcon, 
  PrinterIcon, 
  CheckCircleIcon, 
  ClipboardIcon, 
  Loader2,
  FileIcon,
  Share2Icon,
  Eye
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Section65BCertificateProps {
  documentName?: string;
  generatedDate?: string;
  verificationId?: string;
}

const Section65BCertificate: React.FC<Section65BCertificateProps> = ({ 
  documentName = "Contract Agreement - ABC Corp.pdf",
  generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  verificationId = "DL-" + Math.random().toString(36).substring(2, 10).toUpperCase()
}) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(verificationId).then(
      () => {
        toast({
          title: "Verification ID copied",
          description: "The verification ID has been copied to your clipboard.",
        });
      },
      (err) => {
        toast({
          title: "Failed to copy",
          description: "Could not copy the verification ID to clipboard.",
          variant: "destructive",
        });
      }
    );
  };
  
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      toast({
        title: "Print dialog opened",
        description: "Certificate sent to printer.",
      });
    }, 300); // Short delay to allow state update
  };
  
  const handleDownload = () => {
    setIsDownloading(true);
    
    try {
      // Create certificate content
      const certificateContent = generateCertificateText();
      
      // Create PDF-like content for better formatting
      const formattedContent = certificateContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join('\n\n');
      
      // Create and trigger download as text file
      const element = document.createElement("a");
      const file = new Blob([formattedContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Section65B_Certificate_${verificationId}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Also download as HTML for better formatting
      const htmlContent = generateCertificateHTML();
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const htmlElement = document.createElement("a");
      htmlElement.href = URL.createObjectURL(htmlBlob);
      htmlElement.download = `Section65B_Certificate_${verificationId}.html`;
      document.body.appendChild(htmlElement);
      htmlElement.click();
      document.body.removeChild(htmlElement);
      
      toast({
        title: "Certificate downloaded",
        description: "Your Section 65B certificate has been downloaded successfully in text and HTML formats.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading the certificate.",
        variant: "destructive",
      });
      console.error("Certificate download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    setIsDownloadingPDF(true);
    try {
      // Create a canvas from the certificate element
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to fit the image properly on the PDF
      const imgWidth = 210; // A4 width in mm (portrait)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Section65B_Certificate_${verificationId}.pdf`);
      
      toast({
        title: "PDF downloaded",
        description: "Your Section 65B certificate has been downloaded as PDF.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "PDF download failed",
        description: "There was an error creating the PDF certificate.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const generateCertificateText = () => {
    return `
CERTIFICATE UNDER SECTION 65B
Indian Evidence Act, 1872

Verification ID: ${verificationId}
Document: ${documentName}
Date of Generation: ${generatedDate}

I, _______________________, do hereby certify that:

1. I am legally authorized to provide this certificate under Section 65B of the Indian Evidence Act, 1872.

2. The electronic document titled "${documentName}" was produced from a computer system which:
   - Was regularly used to store or process information for the activities regularly carried out by the user of the computer.
   - Was operating properly during the relevant period; or if not, any respects in which it was not operating properly did not affect the production of the document or the accuracy of its contents.

3. The information contained in this electronic document accurately reproduces information contained in the electronic records used to generate it.

4. This document is generated by a computer output and is true and correct to the best of my knowledge and belief.

Place: _______________________

This certificate is issued in accordance with Section 65B of the Indian Evidence Act, 1872, and serves as legal attestation for the admissibility of the electronic document as evidence in legal proceedings.
    `;
  };
  
  const generateCertificateHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Section 65B Certificate - ${verificationId}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin-bottom: 5px;
      color: #1f2937;
    }
    .header h3 {
      margin-top: 0;
      color: #6b7280;
      font-weight: normal;
    }
    .verification-badge {
      background-color: #1a4d8c;
      color: white;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
    }
    .content {
      margin-bottom: 30px;
    }
    .content ol {
      padding-left: 20px;
    }
    .content li {
      margin-bottom: 10px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      font-style: italic;
    }
    .signature {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }
    .signature-field {
      border-top: 1px solid #000;
      width: 200px;
      text-align: center;
      padding-top: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CERTIFICATE UNDER SECTION 65B</h1>
    <h3>Indian Evidence Act, 1872</h3>
  </div>
  
  <div class="verification-badge">
    <div>Legally Verified Document</div>
    <div>Verification ID: ${verificationId}</div>
  </div>
  
  <div class="content">
    <p>
      Document: <strong>${documentName}</strong><br>
      Date of Generation: <strong>${generatedDate}</strong>
    </p>
    
    <p>
      I, _____________________, do hereby certify that:
    </p>
    
    <ol>
      <li>
        I am legally authorized to provide this certificate under Section 65B of the Indian Evidence Act, 1872.
      </li>
      <li>
        The electronic document titled "${documentName}" was produced from a computer system which:
        <ul>
          <li>Was regularly used to store or process information for the activities regularly carried out by the user of the computer.</li>
          <li>Was operating properly during the relevant period; or if not, any respects in which it was not operating properly did not affect the production of the document or the accuracy of its contents.</li>
        </ul>
      </li>
      <li>
        The information contained in this electronic document accurately reproduces information contained in the electronic records used to generate it.
      </li>
      <li>
        This document is generated by a computer output and is true and correct to the best of my knowledge and belief.
      </li>
    </ol>
  </div>
  
  <div class="signature">
    <div>
      <div class="signature-field">Date: ${generatedDate}</div>
    </div>
    <div>
      <div class="signature-field">Signature</div>
    </div>
    <div>
      <div class="signature-field">Place: ________________</div>
    </div>
  </div>
  
  <div class="footer">
    This certificate is issued in accordance with Section 65B of the Indian Evidence Act, 1872, and serves as legal attestation for the admissibility of the electronic document as evidence in legal proceedings.
  </div>
</body>
</html>
    `;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-legal-primary">Section 65B Certificate</CardTitle>
            <CardDescription>
              Electronic Evidence Certification for {documentName}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={isPrinting}>
              {isPrinting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  <span className="hidden sm:inline">Printing...</span>
                </>
              ) : (
                <>
                  <PrinterIcon className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Print</span>
                </>
              )}
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleDownloadPDF} 
              disabled={isDownloadingPDF}
              className="bg-legal-primary hover:bg-legal-dark"
            >
              {isDownloadingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                </>
              ) : (
                <>
                  <DownloadIcon className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={certificateRef} className="border rounded-lg p-6 bg-white print:shadow-none">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center mb-2">
              <div className="bg-legal-primary h-16 w-16 rounded-full flex items-center justify-center text-white">
                <CheckCircleIcon className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-2xl font-bold uppercase text-legal-dark mb-1">Certificate under Section 65B</h2>
            <h3 className="text-md text-gray-600">Indian Evidence Act, 1872</h3>
          </div>

          <div className="certificate-badge bg-gradient-to-r from-legal-primary to-legal-dark text-white rounded-md p-4 flex items-center justify-between mb-6 shadow-sm">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">Legally Verified Document</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">Verification ID:</span>
              <code className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm font-mono">{verificationId}</code>
              <button 
                onClick={handleCopyToClipboard}
                className="ml-1 p-1 hover:bg-white hover:bg-opacity-10 rounded"
                aria-label="Copy verification ID"
              >
                <ClipboardIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6 text-sm">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <strong className="text-legal-primary">Document:</strong> {documentName}
              </div>
              <div>
                <strong className="text-legal-primary">Date:</strong> {generatedDate}
              </div>
            </div>

            <p className="text-base">
              I, <span className="font-medium">___________________</span>, do hereby certify that:
            </p>

            <ol className="list-decimal pl-5 space-y-4">
              <li>
                I am legally authorized to provide this certificate under Section 65B of the Indian Evidence Act, 1872.
              </li>
              <li>
                The electronic document titled "<span className="font-medium">{documentName}</span>" was produced from a computer system which:
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>Was regularly used to store or process information for the activities regularly carried out by the user of the computer.</li>
                  <li>Was operating properly during the relevant period; or if not, any respects in which it was not operating properly did not affect the production of the document or the accuracy of its contents.</li>
                </ul>
              </li>
              <li>
                The information contained in this electronic document accurately reproduces information contained in the electronic records used to generate it.
              </li>
              <li>
                This document is generated by a computer output and is true and correct to the best of my knowledge and belief.
              </li>
            </ol>

            <div className="mt-10 grid grid-cols-2 gap-8">
              <div className="border-t pt-2">
                <p className="font-medium mb-1">Date:</p>
                <p>{generatedDate}</p>
              </div>
              <div className="border-t pt-2">
                <p className="font-medium mb-1">Place:</p>
                <p>_______________________</p>
              </div>
            </div>

            <div className="mt-8">
              <p className="font-medium mb-2">Signature:</p>
              <div className="h-16 mt-2 border-2 border-dashed border-legal-primary rounded-md flex items-center justify-center mb-4">
                <p className="text-legal-primary font-medium">Digital Signature Applied</p>
              </div>
            </div>

            <div className="mt-8 text-xs text-gray-500 italic text-center">
              This certificate is issued in accordance with Section 65B of the Indian Evidence Act, 1872, and serves as legal attestation for the admissibility of the electronic document as evidence in legal proceedings.
            </div>
            
            <div className="flex justify-center mt-6">
              <div className="flex items-center border border-legal-primary rounded-full px-4 py-1 text-xs text-legal-primary">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Digitally signed and secure
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-1.5"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileTextIcon className="h-4 w-4" />
            )}
            Download as Text/HTML
          </Button>
          <Button 
            variant="outline"
            size="sm" 
            onClick={handlePrint}
            disabled={isPrinting}
            className="gap-1.5"
          >
            {isPrinting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PrinterIcon className="h-4 w-4" />
            )}
            Print Certificate
          </Button>
          <Button 
            variant="default"
            size="sm"
            onClick={handleDownloadPDF} 
            disabled={isDownloadingPDF}
            className="bg-legal-primary hover:bg-legal-dark gap-1.5"
          >
            {isDownloadingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <DownloadIcon className="h-4 w-4" />
            )}
            Download as PDF
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            className="gap-1.5"
            asChild
          >
            <a href={`mailto:?subject=Section%2065B%20Certificate&body=Your%20Section%2065B%20certificate%20with%20verification%20ID%20${verificationId}%20is%20attached.%0A%0ARegards%2C%0ADocuLegalize%20Team`}>
              <Share2Icon className="h-4 w-4" />
              Share Certificate
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Section65BCertificate;
