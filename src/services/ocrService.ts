
import api from './api';

interface OCRResult {
  text: string;
  confidence: number;
  metadata: {
    pageCount?: number;
    creationDate?: string;
    author?: string;
    keywords?: string[];
  };
}

// OCR service functions
const ocrService = {
  // Extract text from a document
  extractText: async (file: File): Promise<OCRResult> => {
    // In a real app, we would upload the file and process it on the server
    // const formData = new FormData();
    // formData.append('file', file);
    // return api.post('/ocr/extract', formData);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a more realistic OCR text based on file type
        let extractedText = "";
        if (file.name.toLowerCase().includes("contract")) {
          extractedText = `CONTRACT AGREEMENT
          
THIS AGREEMENT made this 15th day of November, 2023

BETWEEN:

ABC CORPORATION, a corporation incorporated under the laws of India
(hereinafter referred to as "ABC")

- and -

XYZ LIMITED, a corporation incorporated under the laws of India
(hereinafter referred to as "XYZ")

WHEREAS ABC and XYZ wish to enter into an agreement regarding the provision of legal services;

AND WHEREAS both parties agree to the terms and conditions contained herein;

NOW THEREFORE THIS AGREEMENT WITNESSES that in consideration of the mutual covenants and agreements herein and subject to the terms and conditions specified in this Agreement, the parties agree as follows:

1. TERM OF AGREEMENT
   1.1 This Agreement shall commence on the date first written above and shall continue for a period of two (2) years (the "Term").

2. SERVICES
   2.1 XYZ shall provide legal consulting services to ABC as described in Schedule "A" attached hereto.
   2.2 XYZ shall ensure that all services are performed with reasonable skill and care.`;
        } else if (file.name.toLowerCase().includes("property")) {
          extractedText = `PROPERTY DEED

THIS DEED OF CONVEYANCE made on this 12th day of November, 2023

BETWEEN

Mr. John Smith, son of Mr. Robert Smith, resident of 456 Park Avenue, Delhi (hereinafter called the "VENDOR")

AND

Mrs. Jane Doe, daughter of Mr. William Doe, resident of 789 Lake View, Mumbai (hereinafter called the "PURCHASER")

WHEREAS the Vendor is the absolute owner of the property situated at 123 Main Street, comprising of a plot measuring 2400 sq. ft. along with a two-story building constructed thereon.

AND WHEREAS the Vendor has agreed to sell and the Purchaser has agreed to purchase the said property for a total consideration of Rs. 1,25,00,000/- (Rupees One Crore Twenty-Five Lakhs only).`;
        } else if (file.name.toLowerCase().includes("court")) {
          extractedText = `IN THE HIGH COURT OF DELHI
AT NEW DELHI
CIVIL WRIT PETITION NO. 45678 OF 2023

IN THE MATTER OF:
ABC Corporation Pvt. Ltd.            ... PETITIONER
VERSUS
Union of India & Ors.               ... RESPONDENTS

PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA FOR THE ISSUANCE OF WRIT OF MANDAMUS

To
The Hon'ble Chief Justice and His Companion Justices of the High Court of Delhi at New Delhi.

The Humble petition of the Petitioner above-named:

MOST RESPECTFULLY SHOWETH:

1. That the present petition is being filed challenging the order dated 01.10.2023 passed by Respondent No.2, whereby the application of the Petitioner for renewal of license has been arbitrarily rejected.`;
        } else if (file.name.toLowerCase().includes("testimony")) {
          extractedText = `WITNESS TESTIMONY
CASE: Smith v. Johnson (Case #5678)
DATE: November 5, 2023
WITNESS: Mr. David Williams

I, David Williams, being of sound mind and over 18 years of age, do hereby state as follows:

1. I was present at the location of 782 Oak Street on September 15, 2023, at approximately 3:30 PM.
2. I directly witnessed the automobile collision between a blue sedan driven by Mr. Smith and a red SUV driven by Mr. Johnson.
3. Prior to the collision, I observed the red SUV traveling at what appeared to be well above the posted speed limit of 40 km/h.
4. The traffic signal at the intersection was clearly green for Mr. Smith's direction of travel.
5. I heard the sound of brakes being applied sharply followed immediately by the collision.`;
        } else {
          extractedText = `This is simulated OCR text extraction. In a real application, we would use Tesseract or another OCR engine to extract text from the uploaded document.

The document appears to contain legal information that would typically be processed by our system. The quality of the extracted text depends on the resolution and clarity of the original document.

When processing real documents, the system would identify key information such as:
- Names of parties involved
- Dates and deadlines
- Legal obligations
- Contract terms
- Signatures and attestations

This extracted text can be used for further analysis, indexing, and verification purposes.`;
        }
        
        // Simulate OCR processing
        resolve({
          text: extractedText,
          confidence: 0.92,
          metadata: {
            pageCount: Math.floor(Math.random() * 10) + 1,
            creationDate: new Date().toISOString(),
            author: "Document Author",
            keywords: ["legal", "document", "sample"],
          },
        });
      }, 2000);
    });
  },
  
  // Enhance document quality
  enhanceDocument: async (file: File): Promise<Blob> => {
    // In a real app: upload, process, and return enhanced document
    // const formData = new FormData();
    // formData.append('file', file);
    // return api.post('/ocr/enhance', formData, { responseType: 'blob' });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Just return the original file for now
        // In a real implementation, we would enhance the image quality
        resolve(file);
      }, 1500);
    });
  },
  
  // New method to save extracted text to a document
  saveExtractedText: async (documentId: string, text: string): Promise<void> => {
    // In a real app: return api.post(`/documents/${documentId}/content`, { text });
    return new Promise((resolve) => {
      setTimeout(() => {
        // Update the document content in our mock data
        // This would be handled by the documentService in a real app
        resolve();
      }, 800);
    });
  }
};

export default ocrService;
