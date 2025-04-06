
// This is a mock API service for document processing

interface OCRConfig {
  language?: string;
  enhanceResult?: boolean;
  detectOrientation?: boolean;
}

interface OCRResult {
  text: string;
  confidence: number;
  metadata: Record<string, any>;
  pages?: Array<{
    pageIndex: number;
    text: string;
    width: number;
    height: number;
  }>;
}

interface MetadataResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  creationDate?: string;
  lastModified?: string;
  author?: string;
  pageCount?: number;
  format?: string;
}

// Mock PDF parsing errors to simulate real-world scenarios
function simulatePDFIssue(file: File): Error | null {
  // Simulate password-protected or encrypted PDF
  if (file.name.toLowerCase().includes('secure') || file.name.toLowerCase().includes('protected')) {
    return new Error('The PDF file is password-protected or encrypted.');
  }
  
  // Simulate scanned-only PDF with no embedded text
  if (file.name.toLowerCase().includes('scan') || file.name.toLowerCase().includes('scanned')) {
    return new Error('The PDF contains only scanned images without embedded text. Advanced OCR is required.');
  }
  
  // Simulate corrupted PDF
  if (file.name.toLowerCase().includes('corrupt') || file.name.toLowerCase().includes('damaged')) {
    return new Error('The PDF file appears to be corrupted or damaged.');
  }
  
  return null;
}

/**
 * Perform OCR on a document
 */
async function performOCR(file: File, config?: OCRConfig): Promise<OCRResult> {
  console.log("API: Performing OCR on file:", file.name);
  
  return new Promise((resolve, reject) => {
    // Simulate API processing time
    setTimeout(() => {
      // Check for simulated issues with PDFs
      if (file.type === 'application/pdf') {
        const error = simulatePDFIssue(file);
        if (error) {
          reject(error);
          return;
        }
      }
      
      // Simulate OCR process
      try {
        if (file.name.toLowerCase().includes('error') || file.name.toLowerCase().includes('fail')) {
          reject(new Error('Error attempting to read image.'));
          return;
        }
        
        // Generate realistic mock OCR data based on file name
        let ocrText = "";
        let confidence = 0.85;
        const metadata: Record<string, any> = {
          pageCount: Math.floor(Math.random() * 5) + 1,
          format: file.type === 'application/pdf' ? 'PDF' : 
                  file.type.includes('image') ? file.type.split('/')[1].toUpperCase() : 
                  'UNKNOWN',
          fileName: file.name,
          fileSize: file.size,
          totalWords: 0,
          totalChars: 0
        };
        
        // Generate mock text based on file type and name
        if (file.name.toLowerCase().includes('contract')) {
          ocrText = generateMockContractText();
          metadata.documentType = 'Contract';
          metadata.parties = ['Acme Corp.', 'John Smith'];
          metadata.dates = ['2025-04-01'];
          confidence = 0.92;
        } else if (file.name.toLowerCase().includes('invoice')) {
          ocrText = generateMockInvoiceText();
          metadata.documentType = 'Invoice';
          metadata.parties = ['XYZ Company', 'Customer Corp'];
          metadata.dates = ['2025-03-30'];
          confidence = 0.88;
        } else if (file.name.toLowerCase().includes('report')) {
          ocrText = generateMockReportText();
          metadata.documentType = 'Report';
          metadata.author = 'Alice Johnson';
          metadata.dates = ['2025-03-15'];
          confidence = 0.94;
        } else if (file.name.toLowerCase().includes('receipt')) {
          ocrText = generateMockReceiptText();
          metadata.documentType = 'Receipt';
          metadata.dates = ['2025-04-02'];
          confidence = 0.85;
        } else if (file.name.toLowerCase().includes('legal') || file.name.toLowerCase().includes('agreement')) {
          ocrText = generateMockLegalText();
          metadata.documentType = 'Legal Document';
          metadata.parties = ['Party A', 'Party B', 'Legal Firm LLP'];
          metadata.dates = ['2025-02-12'];
          confidence = 0.91;
        } else {
          ocrText = generateMockDefaultText();
          metadata.documentType = 'Document';
          confidence = 0.80;
        }
        
        // Calculate word and character counts
        metadata.totalWords = ocrText.split(/\s+/).filter(Boolean).length;
        metadata.totalChars = ocrText.length;
        
        // Add keywords based on content
        metadata.keywords = extractKeywords(ocrText);
        
        resolve({
          text: ocrText,
          confidence,
          metadata
        });
      } catch (err) {
        console.error("API OCR error:", err);
        reject(new Error('OCR processing failed'));
      }
    }, 2000); // Simulate 2-second processing time
  });
}

/**
 * Extract metadata from a file
 */
async function extractMetadata(file: File): Promise<MetadataResult> {
  console.log("API: Extracting metadata from file:", file.name);
  
  return new Promise((resolve) => {
    // Simulate API processing time
    setTimeout(() => {
      // Generate mock metadata
      const result: MetadataResult = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        creationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        format: file.type === 'application/pdf' ? 'PDF' : 
                file.type.includes('image') ? file.type.split('/')[1].toUpperCase() : 
                'UNKNOWN'
      };
      
      // Add more metadata based on file type
      if (file.type === 'application/pdf') {
        result.pageCount = Math.floor(Math.random() * 20) + 1;
        result.author = generateRandomAuthor();
      }
      
      resolve(result);
    }, 500); // Simulate 500ms processing time
  });
}

// Helper functions to generate mock text and data
function generateMockContractText(): string {
  return `CONTRACT AGREEMENT
  
This Agreement is made and entered into as of April 5, 2025, by and between Acme Corp., a corporation organized and existing under the laws of the State of Delaware, with its principal place of business at 123 Main Street, Anytown, CA 94538 ("Company"), and John Smith, an individual residing at 456 Oak Lane, Somewhere, NY 10001 ("Contractor").

WHEREAS, Company desires to engage Contractor to provide certain services, and Contractor is willing to provide such services to Company;

NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth, the parties agree as follows:

1. SERVICES
1.1 Service Description. Contractor will perform such services as described in Exhibit A attached hereto ("Services").
1.2 Performance. Contractor shall perform the Services in accordance with the terms and conditions of this Agreement and in compliance with all applicable laws and regulations.

2. COMPENSATION
2.1 Fees. As full compensation for the Services, Company shall pay Contractor the amounts specified in Exhibit B attached hereto.
2.2 Invoicing. Contractor shall submit invoices to Company on a monthly basis.
2.3 Payment Terms. Company shall pay all undisputed amounts within thirty (30) days after receipt of Contractor's invoice.

3. TERM AND TERMINATION
3.1 Term. This Agreement shall commence on the Effective Date and shall continue until the completion of the Services, unless earlier terminated as provided herein.
3.2 Termination for Convenience. Company may terminate this Agreement at any time without cause upon thirty (30) days' prior written notice to Contractor.

4. CONFIDENTIALITY
4.1 Definition. "Confidential Information" means all non-public information disclosed by one party to the other that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.

ACME CORP.

By: _________________________
Name: Jane Doe
Title: CEO

CONTRACTOR

By: _________________________
Name: John Smith
Date: April 5, 2025`;
}

function generateMockInvoiceText(): string {
  return `INVOICE

XYZ COMPANY
123 Business Avenue
Enterprise, CA 95123
Phone: (555) 123-4567
Email: billing@xyzcompany.com

INVOICE #: INV-2025-0412
DATE: March 30, 2025
DUE DATE: April 30, 2025

BILL TO:
Customer Corp
Attn: Accounts Payable
789 Corporate Parkway
Businessville, MA 02108

DESCRIPTION                          QTY    UNIT PRICE    AMOUNT
---------------------------------------------------------------
Professional Services - March 2025    40      $150.00     $6,000.00
Software License Renewal              1     $2,500.00     $2,500.00
Hardware Components                   5       $200.00     $1,000.00
---------------------------------------------------------------
                                             SUBTOTAL:    $9,500.00
                                             TAX (8.25%):   $783.75
                                             TOTAL:      $10,283.75

PAYMENT TERMS: Net 30

Please make checks payable to XYZ Company
For wire transfers, please contact our accounting department

Thank you for your business!`;
}

function generateMockReportText(): string {
  return `QUARTERLY BUSINESS REPORT
Q1 2025

Prepared by: Alice Johnson
Date: March 15, 2025

EXECUTIVE SUMMARY

This report provides an overview of the company's performance for the first quarter of fiscal year 2025. Overall, the company has shown strong growth in key areas while facing challenges in others.

1. FINANCIAL HIGHLIGHTS

Revenue: $12.5M (↑18% YoY)
Net Profit: $2.3M (↑12% YoY)
Operating Expenses: $4.2M (↑8% YoY)
Cash Reserves: $8.4M (↑15% from Q4 2024)

2. MARKET ANALYSIS

Our market share has increased to 23% in our primary market segment, representing a 3% gain over Q4 2024. Competitor analysis shows that our main competitor has lost 2% market share during the same period.

3. PRODUCT PERFORMANCE

Product A: $5.2M revenue (↑22% YoY)
Product B: $4.1M revenue (↑15% YoY)
Product C: $3.2M revenue (↑8% YoY)

4. CHALLENGES AND OPPORTUNITIES

Supply chain disruptions have caused minor delays in product delivery, but strategic inventory management has minimized customer impact.
New market opportunities have been identified in the Asia-Pacific region, with potential for expansion in Q3.

5. CONCLUSION AND RECOMMENDATIONS

Based on Q1 performance, we recommend increasing investment in Product A development and accelerating our expansion strategy for the Asia-Pacific region.

APPENDICES

Appendix A: Detailed Financial Statements
Appendix B: Market Research Data
Appendix C: Customer Satisfaction Survey Results`;
}

function generateMockReceiptText(): string {
  return `RECEIPT

STORE NAME: Quick Mart
ADDRESS: 789 Retail Road, Shopville, CA 90210
PHONE: (555) 987-6543
WEBSITE: www.quickmart.example.com

RECEIPT #: 2025-04-6542
DATE: April 2, 2025
TIME: 14:32:45

CASHIER: Emily

ITEM                     QTY    PRICE      TOTAL
-------------------------------------------------
Organic Bananas           1     $1.99      $1.99
Whole Grain Bread         1     $4.29      $4.29
Free Range Eggs           1     $5.99      $5.99
Almond Milk               2     $3.49      $6.98
Grass-Fed Ground Beef     1    $12.99     $12.99
-------------------------------------------------
                          SUBTOTAL:        $32.24
                          TAX (8.25%):      $2.66
                          TOTAL:           $34.90

PAYMENT METHOD: Credit Card - VISA **** 5678
AUTHORIZATION: 853942

RETURN POLICY:
Items may be returned within 30 days with receipt.
Perishable items cannot be returned.

THANK YOU FOR SHOPPING AT QUICK MART!
VISIT US ONLINE AT WWW.QUICKMART.EXAMPLE.COM`;
}

function generateMockLegalText(): string {
  return `CONFIDENTIALITY AGREEMENT

THIS CONFIDENTIALITY AGREEMENT (the "Agreement") is made and entered into as of February 12, 2025 (the "Effective Date"), by and between Party A, a corporation organized under the laws of Delaware, with its principal place of business at 123 Legal Avenue, Lawtown, NY 10001 ("Disclosing Party"), and Party B, a corporation organized under the laws of California, with its principal place of business at 456 Contract Boulevard, Agreementville, CA 94538 ("Receiving Party").

WITNESSETH:

WHEREAS, the Disclosing Party possesses certain ideas and information relating to [subject matter] that is confidential and proprietary to Disclosing Party (hereinafter referred to as "Confidential Information"); and

WHEREAS, the Receiving Party is willing to receive disclosure of the Confidential Information pursuant to the terms of this Agreement for the purpose of [stated purpose];

NOW THEREFORE, in consideration for the mutual undertakings of the Disclosing Party and the Receiving Party under this Agreement, the parties agree as follows:

1. DISCLOSURE. Disclosing Party agrees to disclose, and Receiver agrees to receive Confidential Information.

2. CONFIDENTIALITY.
   2.1 No Use. Receiving Party agrees not to use the Confidential Information in any way except for the Purpose.
   2.2 No Disclosure. Receiving Party agrees to use its best efforts to prevent and protect the Confidential Information, or any part thereof, from disclosure to any person other than Receiving Party's employees having a need for disclosure in connection with Receiving Party's authorized use of the Confidential Information.

3. TERM.
   3.1 The obligations of Receiving Party herein shall be effective from the date the Disclosing Party last discloses any Confidential Information to Receiving Party pursuant to this Agreement. Further, the obligation not to disclose shall not be affected by bankruptcy, receivership, assignment, attachment or seizure procedures, whether initiated by or against Receiving Party, nor by the rejection of any agreement between the Disclosing Party and Receiving Party, by a trustee of Receiving Party in bankruptcy, or by the Receiving Party as a debtor-in-possession or the equivalent of any of the foregoing under local law.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

PARTY A

By: _________________________
Name: [Name]
Title: [Title]

PARTY B

By: _________________________
Name: [Name]
Title: [Title]

LEGAL FIRM LLP

By: _________________________
Name: [Name]
Title: Attorney`;
}

function generateMockDefaultText(): string {
  return `DOCUMENT

This is a sample document that contains various types of content that might be found in a typical business document. The text includes paragraphs, lists, and some formatting to simulate a real document.

SECTION 1: INTRODUCTION

This document serves as a template for testing text extraction and OCR capabilities. It includes various elements that are commonly found in business and legal documents, such as:

- Paragraphs of text
- Numbered and bulleted lists
- Headers and subheaders
- Names and dates
- Simple tables

SECTION 2: KEY INFORMATION

Name: Sample Document
Date: April 6, 2025
Reference: DOC-2025-0406
Author: John Doe

SECTION 3: CONTENT

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

3.1 Subsection

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

SECTION 4: CONCLUSION

This concludes the sample document. It should provide sufficient content for testing various text extraction and document processing features.

Signed,

[Signature]
John Doe
Document Creator`;
}

function generateRandomAuthor(): string {
  const firstNames = ["John", "Jane", "Michael", "Emily", "David", "Sarah", "Robert", "Lisa"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia"];
  
  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${randomFirstName} ${randomLastName}`;
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction based on common business terms
  const keywords = [
    "contract", "agreement", "invoice", "report", "confidential",
    "payment", "services", "legal", "business", "financial",
    "quarterly", "annual", "statement", "receipt", "transaction"
  ];
  
  const result: string[] = [];
  const textLower = text.toLowerCase();
  
  keywords.forEach(keyword => {
    if (textLower.includes(keyword)) {
      result.push(keyword);
    }
  });
  
  // Add some randomness to the keywords
  const additionalKeywords = [
    "client", "vendor", "expense", "revenue", "profit",
    "project", "deadline", "meeting", "proposal", "budget"
  ];
  
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * additionalKeywords.length);
    const keyword = additionalKeywords[randomIndex];
    if (!result.includes(keyword)) {
      result.push(keyword);
    }
  }
  
  return result;
}

export default {
  performOCR,
  extractMetadata
};
