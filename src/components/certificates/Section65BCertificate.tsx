
import React from "react";
import jsPDF from "@/lib/jspdfMock"; // Use our mock implementation instead of actual jspdf

interface Section65BCertificateProps {
  documentName: string;
  generatedDate: string;
  verificationId: string;
  certifierName?: string;
  certifierDesignation?: string;
  certifierOrganization?: string;
  sha256Hash?: string;
  verificationLink?: string;
  onDownload?: () => void;
}

const Section65BCertificate: React.FC<Section65BCertificateProps> = ({
  documentName,
  generatedDate,
  verificationId,
  certifierName = "Legal System Administrator",
  certifierDesignation = "Legal Officer",
  certifierOrganization = "DocuLegalize Platform",
  sha256Hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  verificationLink = "https://doculegalize.com/verify",
  onDownload
}) => {
  const certificateRef = React.useRef<HTMLDivElement>(null);
  const [generatedHash, setGeneratedHash] = React.useState<string>(sha256Hash);

  // Generate SHA256 hash from the document content
  const generateSha256Hash = React.useCallback(async (content: string) => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
      setGeneratedHash(hashHex);
    } catch (error) {
      console.error("Error generating hash:", error);
      // Fall back to the provided hash if there's an error
      setGeneratedHash(sha256Hash);
    }
  }, [sha256Hash]);

  // Generate the hash whenever the document changes
  React.useEffect(() => {
    const documentContent = `${documentName} ${generatedDate} ${verificationId}`;
    generateSha256Hash(documentContent);
  }, [documentName, generatedDate, verificationId, generateSha256Hash]);

  return (
    <div className="certificate-wrapper">
      <div ref={certificateRef} className="certificate-container p-6 bg-white border rounded-lg shadow-md">
        <div className="certificate-header text-center mb-6">
          <h2 className="text-2xl font-bold text-legal-primary mb-2">CERTIFICATE UNDER SECTION 65B</h2>
          <h3 className="text-lg text-gray-600">Indian Evidence Act, 1872</h3>
          <div className="mt-4 certificate-badge mx-auto w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            65B
          </div>
        </div>
        
        <div className="certificate-content space-y-4 text-gray-800">
          <p>This is to certify that:</p>
          
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              The electronic document titled "<span className="font-semibold">{documentName}</span>" is a computer output produced by a regularly used system for processing information in the course of business activities.
            </li>
            <li>
              The information was regularly stored and processed in the ordinary course of activities.
            </li>
            <li>
              The computer was functioning properly, ensuring the accuracy of the document.
            </li>
            <li>
              The contents of the electronic document accurately reproduce information from the computer system.
            </li>
          </ol>
          
          <div className="mt-8 certificate-stamp p-4 border-2 border-dashed border-legal-primary rounded-md">
            <p>
              <span className="font-semibold">Document:</span> {documentName}<br />
              <span className="font-semibold">Generated Date:</span> {generatedDate}<br />
              <span className="font-semibold">Verification ID:</span> {verificationId}<br />
            </p>
          </div>

          <div className="mt-6">
            <p className="font-semibold">Certifier Information:</p>
            <p><span className="font-semibold">Name:</span> {certifierName}</p>
            <p><span className="font-semibold">Designation:</span> {certifierDesignation}</p>
            <p><span className="font-semibold">Organization:</span> {certifierOrganization}</p>
          </div>
          
          <div className="mt-6">
            <p className="font-semibold">SHA256 Hash:</p>
            <p className="text-gray-600">{generatedHash}</p>
          </div>

          {verificationLink && (
            <div className="mt-6">
              <p className="font-semibold">Verification QR Code:</p>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${verificationLink}`} 
                alt="Verification QR Code" 
                className="mt-2 border rounded" 
              />
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm text-gray-700 mt-4">
              I, <span className="font-semibold">{certifierName}</span>, hereby certify that the information contained in this certificate is true and correct to the best of my knowledge and belief.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t text-sm text-gray-500">
          <p>
            This certificate is issued in accordance with Section 65B of the Indian Evidence Act, 1872. The contents of this certificate
            are true to the best of my knowledge and belief and can be presented as evidence in a court of law.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Section65BCertificate;
