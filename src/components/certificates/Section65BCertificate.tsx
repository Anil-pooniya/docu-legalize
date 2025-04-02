
import React from "react";

interface Section65BCertificateProps {
  documentName: string;
  generatedDate: string;
  verificationId: string;
}

const Section65BCertificate: React.FC<Section65BCertificateProps> = ({
  documentName,
  generatedDate,
  verificationId
}) => {
  return (
    <div className="certificate-container p-6 bg-white">
      <div className="certificate-header text-center mb-6">
        <h2 className="text-2xl font-bold text-legal-primary mb-2">CERTIFICATE UNDER SECTION 65B</h2>
        <h3 className="text-lg text-gray-600">Indian Evidence Act, 1872</h3>
        <div className="mt-4 certificate-badge mx-auto w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-xl">
          65B
        </div>
      </div>
      
      <div className="certificate-content space-y-4 text-gray-800">
        <p>This is to certify that:</p>
        
        <ol className="list-decimal pl-5 space-y-3">
          <li>
            The electronic document titled "<span className="font-semibold">{documentName}</span>" is a computer output produced by a computer used regularly to store and process information for the purpose of business activities.
          </li>
          <li>
            During the period of regular use of the computer, information of the kind contained in the electronic document was regularly fed into the computer in the ordinary course of activities.
          </li>
          <li>
            The computer was operating properly during the said period, and any improper operations of the computer did not affect the electronic document or the accuracy of its contents.
          </li>
          <li>
            The information contained in the electronic document reproduces information fed into the computer in the ordinary course of activities.
          </li>
        </ol>
        
        <div className="mt-8 certificate-stamp p-4 border-2 border-dashed border-legal-primary rounded-md">
          <p>
            <span className="font-semibold">Document:</span> {documentName}<br />
            <span className="font-semibold">Generated Date:</span> {generatedDate}<br />
            <span className="font-semibold">Verification ID:</span> {verificationId}<br />
          </p>
        </div>
        
        <div className="mt-6 grid grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">
              Issued by DocuLegalize Platform
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Digital Signature</p>
            <p className="text-sm text-gray-500 mt-1">Cryptographically Verified</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t text-sm text-gray-500">
        <p>
          This certificate is issued in accordance with Section 65B of the Indian Evidence Act, 1872. The contents of this certificate
          are true to the best of knowledge and belief of the certifier.
        </p>
      </div>
    </div>
  );
};

export default Section65BCertificate;
