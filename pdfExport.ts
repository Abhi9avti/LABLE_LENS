/**
 * METRISCAN FAST - Professional Flow-Based Document & PDF Generation System
 * Mathematical page calculation, automatic text wrapping, pagination, and zero overlap.
 * Complies with Legal Metrology (Packaged Commodities) Rules, 2011 documentation requirements.
 */

import { jsPDF } from 'jspdf';
import { Complaint, ComplianceReport, InspectionSession, ProductScanResult, RuleFinding } from '../types';

/**
 * Flow-based layout manager for jsPDF that eliminates text overlap, handles
 * page breaks, automatic text wrapping, dynamic tables, and page numbering.
 */
class DocumentFlowEngine {
  private doc: jsPDF;
  public pageWidth: number;
  public pageHeight: number;
  public marginLeft: number;
  public marginRight: number;
  public marginTop: number;
  public marginBottom: number;
  public contentWidth: number;
  public currentY: number;
  private documentTitle: string;
  private reportCode: string;

  constructor(title: string, reportCode: string) {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    this.documentTitle = title;
    this.reportCode = reportCode;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();

    // Standard fixed margins
    this.marginLeft = 16;
    this.marginRight = 16;
    this.marginTop = 22;
    this.marginBottom = 20;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;

    this.currentY = this.marginTop;
  }

  /**
   * Check if required height fits on the current page.
   * If not, adds a new page and resets currentY to marginTop.
   */
  public ensureSpace(requiredHeight: number): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.marginBottom) {
      this.doc.addPage();
      this.currentY = this.marginTop;
    }
  }

  /**
   * Adds an official header banner to the first page.
   */
  public addGovernmentHeader(departmentName: string, subHeader: string): void {
    this.doc.setFillColor(15, 23, 42); // slate-900
    this.doc.rect(0, 0, this.pageWidth, 24, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.text('LEGAL METROLOGY DIVISION • GOVERNMENT OF HARYANA', this.pageWidth / 2, 8, { align: 'center' });

    this.doc.setFontSize(8.5);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(departmentName.toUpperCase(), this.pageWidth / 2, 14, { align: 'center' });

    this.doc.setFontSize(7.5);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(subHeader, this.pageWidth / 2, 19, { align: 'center' });

    this.currentY = 32;
  }

  /**
   * Section Heading with flow spacing
   */
  public addHeading(title: string, level: 1 | 2 | 3 = 1): void {
    const spaceMap = { 1: 14, 2: 10, 3: 8 };
    this.ensureSpace(spaceMap[level]);

    this.doc.setTextColor(15, 23, 42);
    if (level === 1) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(12);
      this.doc.text(title, this.marginLeft, this.currentY);
      this.currentY += 2;
      this.doc.setDrawColor(203, 213, 225);
      this.doc.setLineWidth(0.4);
      this.doc.line(this.marginLeft, this.currentY, this.pageWidth - this.marginRight, this.currentY);
      this.currentY += 5;
    } else if (level === 2) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(10);
      this.doc.text(title, this.marginLeft, this.currentY);
      this.currentY += 4.5;
    } else {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(8.5);
      this.doc.text(title, this.marginLeft, this.currentY);
      this.currentY += 4;
    }
  }

  /**
   * Safe auto-wrapping paragraph with exact line height calculation
   */
  public addParagraph(text: string, options: { fontSize?: number; fontStyle?: 'normal' | 'bold' | 'italic'; color?: [number, number, number]; indent?: number } = {}): void {
    const fontSize = options.fontSize || 8.5;
    const fontStyle = options.fontStyle || 'normal';
    const color = options.color || [51, 65, 85];
    const indent = options.indent || 0;

    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', fontStyle);
    this.doc.setTextColor(color[0], color[1], color[2]);

    const usableWidth = this.contentWidth - indent;
    const lines = this.doc.splitTextToSize(text, usableWidth);
    const lineHeight = fontSize * 0.45; // mm per line
    const totalHeight = lines.length * lineHeight;

    this.ensureSpace(totalHeight + 2);

    for (let i = 0; i < lines.length; i++) {
      this.doc.text(lines[i], this.marginLeft + indent, this.currentY + (i * lineHeight));
    }

    this.currentY += totalHeight + 2.5;
  }

  /**
   * Two-column metadata grid (e.g. Field: Value)
   */
  public addMetadataGrid(pairs: { label: string; value: string }[]): void {
    const rowHeight = 6;
    const colWidth = this.contentWidth / 2;

    for (let i = 0; i < pairs.length; i += 2) {
      this.ensureSpace(rowHeight);

      // Left item
      const left = pairs[i];
      if (left) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(8);
        this.doc.setTextColor(15, 23, 42);
        this.doc.text(left.label, this.marginLeft, this.currentY);

        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(71, 85, 105);
        this.doc.text(left.value, this.marginLeft + 36, this.currentY);
      }

      // Right item
      if (i + 1 < pairs.length) {
        const right = pairs[i + 1];
        const rightColX = this.marginLeft + colWidth;

        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(8);
        this.doc.setTextColor(15, 23, 42);
        this.doc.text(right.label, rightColX, this.currentY);

        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(71, 85, 105);
        this.doc.text(right.value, rightColX + 36, this.currentY);
      }

      this.currentY += rowHeight;
    }

    this.currentY += 3;
  }

  /**
   * Robust dynamic table with pagination, column widths, and cell text wrapping
   */
  public addTable(
    headers: string[],
    rows: (string | { text: string; status?: 'PASS' | 'FAIL' | 'REVIEW' })[][],
    colWidthPercentages: number[]
  ): void {
    const colWidths = colWidthPercentages.map((pct) => (pct / 100) * this.contentWidth);
    const headerHeight = 7;

    // Draw header
    this.ensureSpace(headerHeight + 10);
    this.drawTableHeader(headers, colWidths);

    // Draw rows
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];

      // Calculate max lines in this row to determine row height
      let maxLines = 1;
      const wrappedCells: string[][] = [];

      for (let c = 0; c < row.length; c++) {
        const raw = typeof row[c] === 'string' ? (row[c] as string) : (row[c] as any).text;
        const width = colWidths[c] - 4; // 2mm padding on each side
        this.doc.setFontSize(7.5);
        const lines = this.doc.splitTextToSize(raw || '—', width);
        wrappedCells.push(lines);
        if (lines.length > maxLines) {
          maxLines = lines.length;
        }
      }

      const rowHeight = Math.max(7, maxLines * 3.6 + 3);
      this.ensureSpace(rowHeight);

      // If page break occurred, re-draw table header on new page
      if (this.currentY === this.marginTop) {
        this.drawTableHeader(headers, colWidths);
      }

      // Draw zebra row background
      this.doc.setFillColor(r % 2 === 0 ? 255 : 248, r % 2 === 0 ? 255 : 250, r % 2 === 0 ? 255 : 252);
      this.doc.rect(this.marginLeft, this.currentY, this.contentWidth, rowHeight, 'F');

      // Draw border
      this.doc.setDrawColor(226, 232, 240);
      this.doc.setLineWidth(0.2);
      this.doc.rect(this.marginLeft, this.currentY, this.contentWidth, rowHeight, 'S');

      // Draw cell texts
      let currentX = this.marginLeft;
      for (let c = 0; c < row.length; c++) {
        const cellData = row[c];
        const lines = wrappedCells[c];
        const isStatusCell = typeof cellData !== 'string' && cellData.status;

        if (isStatusCell) {
          // Status badge pill
          const status = cellData.status;
          this.doc.setFont('helvetica', 'bold');
          this.doc.setFontSize(7);
          if (status === 'PASS') {
            this.doc.setTextColor(22, 101, 52); // green-800
          } else if (status === 'FAIL') {
            this.doc.setTextColor(185, 28, 28); // red-700
          } else {
            this.doc.setTextColor(180, 83, 9); // amber-700
          }
          this.doc.text(cellData.text, currentX + 2, this.currentY + 4.5);
        } else {
          this.doc.setFont('helvetica', 'normal');
          this.doc.setFontSize(7.5);
          this.doc.setTextColor(30, 41, 59);

          for (let l = 0; l < lines.length; l++) {
            this.doc.text(lines[l], currentX + 2, this.currentY + 4 + (l * 3.4));
          }
        }

        currentX += colWidths[c];
      }

      this.currentY += rowHeight;
    }

    this.currentY += 4;
  }

  private drawTableHeader(headers: string[], colWidths: number[]): void {
    const headerHeight = 6.5;
    this.doc.setFillColor(30, 41, 59);
    this.doc.rect(this.marginLeft, this.currentY, this.contentWidth, headerHeight, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(255, 255, 255);

    let currentX = this.marginLeft;
    for (let i = 0; i < headers.length; i++) {
      this.doc.text(headers[i], currentX + 2, this.currentY + 4.5);
      currentX += colWidths[i];
    }

    this.currentY += headerHeight;
  }

  /**
   * Finalize document: applies headers and page numbers on every page
   */
  public finalize(): jsPDF {
    const totalPages = this.doc.getNumberOfPages();

    for (let p = 1; p <= totalPages; p++) {
      this.doc.setPage(p);

      // Header on pages > 1
      if (p > 1) {
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(7.5);
        this.doc.setTextColor(100, 116, 139);
        this.doc.text(this.documentTitle, this.marginLeft, 10);
        this.doc.text(this.reportCode, this.pageWidth - this.marginRight, 10, { align: 'right' });
        this.doc.setDrawColor(226, 232, 240);
        this.doc.setLineWidth(0.2);
        this.doc.line(this.marginLeft, 12, this.pageWidth - this.marginRight, 12);
      }

      // Footer on all pages
      const footerY = this.pageHeight - 8;
      this.doc.setDrawColor(226, 232, 240);
      this.doc.setLineWidth(0.2);
      this.doc.line(this.marginLeft, footerY - 4, this.pageWidth - this.marginRight, footerY - 4);

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(7);
      this.doc.setTextColor(148, 163, 184);
      this.doc.text('METRISCAN FAST • Legal Metrology (Packaged Commodities) Compliance System', this.marginLeft, footerY);

      this.doc.text(`Page ${p} of ${totalPages}`, this.pageWidth - this.marginRight, footerY, { align: 'right' });
    }

    return this.doc;
  }
}

/**
 * 1. OFFICIAL INSPECTOR INSPECTION REPORT & STATUTORY MEMORANDUM
 */
export function generateInspectionPDF(session: InspectionSession): jsPDF {
  const engine = new DocumentFlowEngine(
    'FIELD INSPECTION MEMORANDUM',
    session.inspectionCode || session.id
  );

  engine.addGovernmentHeader(
    'Department of Food, Civil Supplies & Consumer Affairs',
    'Legal Metrology Enforcement Division • Act 2009 & PCR Rules 2011'
  );

  engine.addHeading(`Inspection Memorandum: ${session.inspectionCode || session.id}`, 1);

  // Establishment & Officer Metadata
  engine.addMetadataGrid([
    { label: 'Shop Name:', value: session.shopName },
    { label: 'Date / Time:', value: new Date(session.startTime).toLocaleString('en-IN') },
    { label: 'Premises:', value: session.shopAddress },
    { label: 'Inspector:', value: session.officerName },
    { label: 'District / Area:', value: `${session.district || 'Sirsa'}, ${session.area || 'Sirsa City'}` },
    { label: 'Office:', value: session.officeName },
    { label: 'Inspection Type:', value: session.inspectionType.replace('_', ' ') },
    { label: 'Grievance Docket:', value: session.complaintRefId || 'Routine / Proactive' },
  ]);

  // Section 1: Summary of Commodities Audited
  engine.addHeading('1. Summary of Shelf Commodities Audited', 2);
  const total = session.scannedProducts.length || session.totalScanned;
  engine.addParagraph(
    `Total Commodities Checked: ${total} | Conforming (Pass): ${session.passedCount} | Flagged Issues: ${session.potentialIssuesCount} | Needs Verification: ${session.needsReviewCount}`,
    { fontStyle: 'bold', color: [15, 23, 42] }
  );

  // Section 2: Itemized Table of Observations
  engine.addHeading('2. Itemized Package Observations', 2);
  const tableHeaders = ['#', 'Commodity / Brand', 'Declared Net Qty / MRP', 'Key Observation / Rule Check', 'Status'];
  const tableRows: any[][] = session.scannedProducts.map((p, idx) => {
    const mainIssue = p.findings.find((f) => f.status !== 'PASS');
    const observationText = mainIssue
      ? `${mainIssue.ruleNumber || 'Rule'}: ${mainIssue.reason || 'Declaration not clearly detected'}`
      : 'All mandatory declarations verified conforming';

    const statusObj = {
      text: p.overallStatus === 'PASS' ? 'PASS' : p.overallStatus === 'POTENTIAL_NON_COMPLIANCE' ? 'FLAGGED' : 'REVIEW',
      status: (p.overallStatus === 'PASS' ? 'PASS' : p.overallStatus === 'POTENTIAL_NON_COMPLIANCE' ? 'FAIL' : 'REVIEW') as any,
    };

    return [
      String(idx + 1),
      `${p.declarations.productName || 'Commodity'}\nBrand: ${p.declarations.brand || 'N/A'}`,
      `Qty: ${p.declarations.netQuantity || 'N/A'}\nMRP: ${p.declarations.mrp || 'N/A'}`,
      observationText,
      statusObj,
    ];
  });

  if (tableRows.length > 0) {
    engine.addTable(tableHeaders, tableRows, [6, 28, 22, 32, 12]);
  } else {
    engine.addParagraph('No commodities recorded during this session.');
  }

  // Section 3: Officer Directives & Statutory Remarks
  engine.addHeading('3. Inspecting Officer Directives & Statutory Notice', 2);
  const notes = session.officerSummaryNotes || 'Field inspection conducted under provisions of Legal Metrology Act, 2009. Any non-compliant packaged commodities must be seized or compounded under Rule 32 within statutory timeline.';
  engine.addParagraph(notes);

  // Signatures
  engine.ensureSpace(32);
  const doc = (engine as any).doc;
  const sigY = engine.currentY + 14;
  doc.setDrawColor(148, 163, 184);
  doc.line(engine.marginLeft, sigY, engine.marginLeft + 65, sigY);
  doc.line(engine.pageWidth - engine.marginRight - 65, sigY, engine.pageWidth - engine.marginRight, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Signature / Seal of Establishment Proprietor', engine.marginLeft, sigY + 5);
  doc.text('Authorized Legal Metrology Inspector', engine.pageWidth - engine.marginRight - 65, sigY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Officer: ${session.officerName}`, engine.pageWidth - engine.marginRight - 65, sigY + 9);
  doc.text(`Office: ${session.officeName}`, engine.pageWidth - engine.marginRight - 65, sigY + 13);

  return engine.finalize();
}

/**
 * 2. CITIZEN GRIEVANCE DOSSIER PDF
 */
export function generateComplaintPDF(complaint: Complaint): jsPDF {
  const engine = new DocumentFlowEngine(
    'CITIZEN GRIEVANCE DOSSIER',
    complaint.id
  );

  engine.addGovernmentHeader(
    'National Legal Metrology Grievance Portal',
    'Citizen Consumer Affairs & Packaged Commodities Monitoring'
  );

  engine.addHeading(`Citizen Grievance Record: ${complaint.id}`, 1);

  engine.addMetadataGrid([
    { label: 'Grievance Docket:', value: complaint.id },
    { label: 'Filing Date:', value: new Date(complaint.createdAt).toLocaleString('en-IN') },
    { label: 'Complainant:', value: complaint.consumerName || 'Citizen' },
    { label: 'Contact:', value: complaint.consumerContact || 'Confidential' },
    { label: 'Selling Store:', value: complaint.sellerName },
    { label: 'Store Address:', value: complaint.sellerAddress },
    { label: 'District / Area:', value: `${complaint.district || 'Sirsa'}, ${complaint.area || 'Sirsa'}` },
    { label: 'Docket Status:', value: complaint.status },
  ]);

  engine.addHeading('1. Commodity & Reported Issue', 2);
  engine.addParagraph(`Product Name: ${complaint.productName} (Brand: ${complaint.brand || 'Unspecified'})`, { fontStyle: 'bold' });
  engine.addParagraph(`Issue Categorization: ${complaint.issue}`);
  engine.addParagraph(`Citizen Statement: "${complaint.description}"`, { fontStyle: 'italic' });

  if (complaint.scanResult) {
    engine.addHeading('2. AI Optical Pre-Analysis Findings', 2);
    const findingsRows = complaint.scanResult.findings.map((f, i) => [
      String(i + 1),
      f.ruleTitle,
      f.detectedValue || 'Not Detected',
      {
        text: f.status === 'PASS' ? 'PASS' : 'FLAGGED',
        status: (f.status === 'PASS' ? 'PASS' : 'FAIL') as any,
      },
    ]);

    engine.addTable(
      ['#', 'Mandatory Declaration', 'Detected Label Extract', 'Verification'],
      findingsRows,
      [8, 42, 35, 15]
    );
  }

  engine.addHeading('3. Statutory Routing & Legal Rights', 2);
  engine.addParagraph(
    'This grievance docket has been entered into the government case tracking workspace under Section 15 of the Legal Metrology Act, 2009. An Assistant Controller will assign an on-site field inspection officer.'
  );

  return engine.finalize();
}

/**
 * 3. RETAILER / PRODUCT COMPLIANCE AUDIT REPORT
 */
export function generateRetailerReportPDF(product: ProductScanResult, storeName: string = 'Retail Store Inventory'): jsPDF {
  const engine = new DocumentFlowEngine(
    'COMMODITY COMPLIANCE AUDIT',
    product.id
  );

  engine.addGovernmentHeader(
    'Packaged Commodity Compliance Checklist',
    'Legal Metrology (Packaged Commodities) Rules, 2011 Verification'
  );

  engine.addHeading(`Compliance Audit: ${product.declarations.productName || 'Packaged Commodity'}`, 1);

  engine.addMetadataGrid([
    { label: 'Audit ID:', value: product.id },
    { label: 'Scan Date:', value: new Date(product.scanTimestamp).toLocaleString('en-IN') },
    { label: 'Product Name:', value: product.declarations.productName || 'N/A' },
    { label: 'Brand:', value: product.declarations.brand || 'N/A' },
    { label: 'Declared Net Qty:', value: product.declarations.netQuantity || 'N/A' },
    { label: 'Declared MRP:', value: product.declarations.mrp || 'N/A' },
    { label: 'Manufacturer:', value: product.declarations.manufacturer || 'N/A' },
    { label: 'Overall Result:', value: product.overallStatus === 'PASS' ? 'LOOKS GOOD' : 'ATTENTION NEEDED' },
  ]);

  engine.addHeading('Mandatory Package Declarations Assessment', 2);
  const rows = product.findings.map((f, i) => [
    String(i + 1),
    f.ruleTitle,
    f.detectedValue || 'Not clearly identified',
    {
      text: f.status === 'PASS' ? 'PASS' : 'ATTENTION',
      status: (f.status === 'PASS' ? 'PASS' : 'FAIL') as any,
    },
  ]);

  engine.addTable(['#', 'Mandatory Declaration', 'Observed Information', 'Result'], rows, [8, 42, 35, 15]);

  engine.addHeading('Retailer Guidance', 2);
  if (product.overallStatus === 'PASS') {
    engine.addParagraph('✓ This package contains the standard mandatory declarations required before display for retail sale.');
  } else {
    engine.addParagraph('⚠ Attention: Certain mandatory declarations could not be identified or are incomplete. Ensure distributor supplies conforming stock before placing on shelves to prevent non-compliance liability under Section 36.');
  }

  return engine.finalize();
}

/**
 * Downloads generated Inspection PDF
 */
export function downloadInspectionPDF(session: InspectionSession): void {
  const doc = generateInspectionPDF(session);
  const filename = `METRISCAN_${session.inspectionCode || session.id}_Notice.pdf`;
  doc.save(filename);
}

/**
 * Downloads Complaint PDF
 */
export function downloadComplaintPDF(complaint: Complaint): void {
  const doc = generateComplaintPDF(complaint);
  const filename = `METRISCAN_Grievance_${complaint.id}.pdf`;
  doc.save(filename);
}

/**
 * Downloads Retailer Product Report PDF
 */
export function downloadRetailerPDF(product: ProductScanResult): void {
  const doc = generateRetailerReportPDF(product);
  const filename = `METRISCAN_Product_${product.id}.pdf`;
  doc.save(filename);
}

/**
 * Downloads clean editable document format with correct typography and CSS tables
 */
export function downloadEditableReport(
  title: string,
  contentHtml: string,
  filename: string = 'METRISCAN_Compliance_Report.html'
): void {
  const fullDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: "Segoe UI", -apple-system, Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #0f172a; max-width: 800px; margin: 0 auto; padding: 24px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { margin: 0 0 4px 0; font-size: 20px; font-weight: 700; color: #0f172a; }
    .header p { margin: 0; font-size: 12px; color: #475569; }
    h2 { font-size: 15px; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; color: #1e293b; }
    p { font-size: 13px; margin: 6px 0; color: #334155; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 12px; }
    th { background: #0f172a; color: #ffffff; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
    .badge-pass { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; }
    .badge-flag { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>METRISCAN FAST • LEGAL METROLOGY COMPLIANCE RECORD</h1>
    <p>Department of Food, Civil Supplies & Consumer Affairs • Generated: ${new Date().toLocaleString('en-IN')}</p>
  </div>
  <div>
    ${contentHtml}
  </div>
  <div class="footer">
    <p>METRISCAN FAST Official Metrology Record • Official enforcement requires authorized officer verification.</p>
  </div>
</body>
</html>`;

  const blob = new Blob([fullDocument], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
